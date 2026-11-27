import { randomUUID } from 'node:crypto';

import {
  AppError,
  errorBody,
  requestIdOf,
  signCall,
  toAppError,
  unauthenticated,
  validationFailed,
  type SigningKey,
  type Verifier,
} from '@beautinique/backend-server-kit';
import type { Clock } from '@beautinique/shared-clock';
import { EVENT_MAX_BYTES } from '@beautinique/shared-contracts';
import { enum as enumOf, number, strictObject, string } from 'zod';

import type { DeliveryRequest, DeliveryStatus, EventsLogger, Inbox } from './inbox.ts';
import { subscriberService } from './subscriber.ts';

/** How a dispatcher gets an event to its subscribers, and which subscribers it can reach. */
export interface DeliveryTransport {
  readonly subscribers: ReadonlySet<string>;
  /** One try. It never throws for the other side's sake: a subscriber that cannot be reached is `unavailable`. */
  deliver(request: DeliveryRequest): Promise<DeliveryStatus>;
}

/** The transport of a bundle: the subscriber's inbox, called in the process (docs/ARCHITECTURE.md §3 rule 2). */
export function inProcessDelivery(inboxes: readonly Inbox[]): DeliveryTransport {
  const bySubscriber = new Map<string, Inbox>();
  for (const inbox of inboxes) {
    if (bySubscriber.has(inbox.subscriber)) {
      throw new RangeError(`The inbox of ${inbox.subscriber} is given twice.`);
    }
    bySubscriber.set(inbox.subscriber, inbox);
  }
  return {
    subscribers: new Set(bySubscriber.keys()),
    async deliver(request) {
      const inbox = bySubscriber.get(request.subscriber);
      if (inbox === undefined) return 'failed';
      return inbox.receive(request);
    },
  };
}

/** The path of a subscriber's inbox in a split: `/internal/events/<subscriber>`; the signature covers its name. */
export const inboxPath = (subscriber: string): string => `/internal/events/${subscriber}`;

const callOf = (subscriber: string): string => `events.${subscriber}`;

/** How long a try over HTTP may take: the handler's transaction has 10 seconds, and a little more. */
export const DELIVERY_TIMEOUT_MS = 15_000;

export interface SignedHttpDeliveryOptions {
  /** Where each subscriber's service is, by subscriber: `{ finance: 'http://finance.internal:4000' }`. */
  baseUrls: Readonly<Record<string, string>>;
  key: SigningKey;
  clock: Clock;
  /** `fetch`, or another function that sends a request. */
  send?: typeof fetch;
  nonce?: () => string;
  logger: EventsLogger;
}

const answerSchema = strictObject(
  {
    status: enumOf(
      ['delivered', 'failed', 'dead', 'unavailable'],
      'status must be delivered, failed, dead or unavailable.',
    ),
  },
  'An answer is { status } and nothing else.',
);

/**
 * The transport of a split: a signed HTTP call to the subscriber's inbox (SR-071). A subscriber
 * that does not answer, or answers with a 5xx, is `unavailable` and the try does not count; a 4xx
 * (a call it would not take: a wrong key, a wrong body) is `failed`, since trying again does not
 * mend it.
 */
export function signedHttpDelivery(options: SignedHttpDeliveryOptions): DeliveryTransport {
  const send = options.send ?? fetch;
  const nonce = options.nonce ?? randomUUID;
  const urls = new Map(Object.entries(options.baseUrls));
  for (const subscriber of urls.keys()) subscriberService(subscriber);
  return {
    subscribers: new Set(urls.keys()),
    async deliver(request) {
      const baseUrl = urls.get(request.subscriber);
      if (baseUrl === undefined) return 'failed';
      const body = JSON.stringify({
        payload: request.payload,
        attempt: request.attempt,
        maxAttempts: request.maxAttempts,
      });
      const signed = signCall(
        options.key,
        callOf(request.subscriber),
        body,
        options.clock.now(),
        nonce(),
      );
      let response: Response;
      try {
        response = await send(`${baseUrl}${inboxPath(request.subscriber)}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...signed },
          body,
          signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
        });
      } catch (thrown) {
        options.logger.warn(
          { subscriber: request.subscriber, err: thrown },
          'A subscriber could not be reached.',
        );
        return 'unavailable';
      }
      if (response.status >= 500) return 'unavailable';
      const answer = answerSchema.safeParse(await response.json().catch(() => undefined));
      if (response.status !== 200 || !answer.success) {
        options.logger.error(
          { subscriber: request.subscriber, status: response.status },
          'A subscriber would not take an event.',
        );
        return 'failed';
      }
      return answer.data.status;
    },
  };
}

const requestSchema = strictObject(
  {
    payload: string('payload is required.').max(
      EVENT_MAX_BYTES,
      `payload must be at most ${String(EVENT_MAX_BYTES)} characters.`,
    ),
    attempt: number('attempt must be a number.')
      .int('attempt must be a whole number.')
      .min(1, 'attempt must be at least 1.'),
    maxAttempts: number('maxAttempts must be a number.')
      .int('maxAttempts must be a whole number.')
      .min(1, 'maxAttempts must be at least 1.'),
  },
  'A delivery is { payload, attempt, maxAttempts } and nothing else.',
);

export interface InboxEndpointOptions {
  verifier: Verifier;
  logger: EventsLogger;
}

/**
 * The HTTP side of an inbox in a split, in the subscriber's service: checks the signature first,
 * then the body, then takes the event. A call that is not signed right gets 401 and no reason.
 * Mount it on `POST /internal/events/<subscriber>` with the body as text (the signature is over
 * its exact bytes).
 */
export function createInboxEndpoint(
  inbox: Inbox,
  options: InboxEndpointOptions,
): (request: {
  headers: Readonly<Record<string, string | undefined>>;
  body: string;
}) => Promise<{ status: number; body: unknown }> {
  return async (request) => {
    const requestId = requestIdOf(request.headers['x-request-id']);
    try {
      const verdict = options.verifier.verify(
        callOf(inbox.subscriber),
        request.body,
        request.headers,
      );
      if (!verdict.ok) throw unauthenticated();
      let json: unknown;
      try {
        json = JSON.parse(request.body);
      } catch {
        throw validationFailed([{ path: 'body', message: 'The body must be JSON.' }]);
      }
      const parsed = requestSchema.safeParse(json);
      if (!parsed.success) {
        throw validationFailed(
          parsed.error.issues.map((issue) => ({
            path: ['body', ...issue.path.map(String)].join('.'),
            message: issue.message,
          })),
        );
      }
      const status = await inbox.receive({ subscriber: inbox.subscriber, ...parsed.data });
      return { status: 200, body: { status } };
    } catch (thrown) {
      const error = toAppError(thrown);
      if (!(thrown instanceof AppError)) {
        options.logger.error(
          { err: thrown, requestId, subscriber: inbox.subscriber },
          'An inbox call failed.',
        );
      }
      return { status: error.status, body: errorBody(error, requestId) };
    }
  };
}
