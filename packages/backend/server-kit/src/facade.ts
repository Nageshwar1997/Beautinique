import { randomUUID } from 'node:crypto';

import type { Clock } from '@beautinique/shared-clock';
import {
  ERROR_STATUSES,
  errorBodySchema,
  SERVICES,
  type ErrorStatus,
  type Service,
} from '@beautinique/shared-contracts';
import { strictObject, string, unknown, type input, type output, type ZodType } from 'zod';

import { actorSchema, type Actor } from './actor.ts';
import {
  AppError,
  errorBody,
  internalError,
  notFound,
  toAppError,
  unauthenticated,
  validationFailed,
} from './errors.ts';
import { requestIdOf } from './request-id.ts';
import { signCall, type SigningKey, type Verifier } from './signing.ts';

/** What one call of a facade takes and gives (docs/ARCHITECTURE.md §2.3, SR-071). Both are JSON, in either mode. */
export interface FacadeMethod {
  input: ZodType;
  output: ZodType;
}

export type FacadeMethods = Readonly<Record<string, FacadeMethod>>;

export interface Facade<M extends FacadeMethods> {
  readonly service: Service;
  readonly methods: M;
}

const METHOD_NAME = /^[a-z][A-Za-z0-9]*$/;

/**
 * The facade of a service: the calls that other services may make on it, with what each takes and
 * gives. One definition serves both modes (docs/ARCHITECTURE.md §2.4 rule 10): in a bundle the call
 * is a function call in the process, in a split the same call is signed HTTP.
 */
export function defineFacade<const M extends FacadeMethods>(
  service: Service,
  methods: M,
): Facade<M> {
  if (!SERVICES.includes(service)) {
    throw new RangeError(`The facade of ${service} is not of a service of the list.`);
  }
  for (const name of Object.keys(methods)) {
    if (!METHOD_NAME.test(name)) {
      throw new RangeError(`The call ${name} of the facade of ${service} is not in camelCase.`);
    }
  }
  return Object.freeze({ service, methods });
}

/** Who calls, for whom, and which request this is a part of: an actor is authorized by the service that owns the call (SR-071). */
export interface CallContext {
  actor: Actor | undefined;
  requestId: string;
}

/** What the service that owns the facade writes: one function for each call. */
export type FacadeImplementation<M extends FacadeMethods> = {
  readonly [K in keyof M]: (
    input: output<M[K]['input']>,
    call: CallContext,
  ) => Promise<input<M[K]['output']>>;
};

/** What the other services use: the same calls, in either mode. */
export type FacadeClient<M extends FacadeMethods> = {
  readonly [K in keyof M]: (
    input: input<M[K]['input']>,
    call: CallContext,
  ) => Promise<output<M[K]['output']>>;
};

/** Takes a call to the service that owns the facade, and brings back what it answered (not yet checked). */
export type FacadeTransport = (request: {
  service: Service;
  method: string;
  input: unknown;
  call: CallContext;
}) => Promise<unknown>;

// Both modes pass JSON and nothing else, so that a call does the same in a bundle and in a split.
const throughJson = (value: unknown): unknown =>
  value === undefined ? undefined : (JSON.parse(JSON.stringify(value)) as unknown);

function methodOf<M extends FacadeMethods>(facade: Facade<M>, name: string): FacadeMethod {
  // The names are the keys of `methods`; one that came from outside (a URL) may be anything.
  const method = Object.hasOwn(facade.methods, name) ? facade.methods[name] : undefined;
  if (method === undefined) throw notFound();
  return method;
}

/**
 * The service that owns the facade answering a call: checks what came in, runs its function, and
 * checks what goes out with the schema (so a field that the facade does not name never leaves).
 * Used by the two modes: the call in the process, and the signed HTTP endpoint.
 */
export async function answerFacadeCall<M extends FacadeMethods>(
  facade: Facade<M>,
  implementation: FacadeImplementation<M>,
  name: string,
  wireInput: unknown,
  call: CallContext,
): Promise<unknown> {
  const method = methodOf(facade, name);
  const parsed = method.input.safeParse(wireInput);
  if (!parsed.success) {
    throw validationFailed(
      parsed.error.issues.map((issue) => ({
        path: ['input', ...issue.path.map(String)].join('.'),
        message: issue.message,
      })),
    );
  }
  const run = implementation[name as keyof M] as (
    input: unknown,
    call: CallContext,
  ) => Promise<unknown>;
  const result = method.output.safeParse(await run(parsed.data, call));
  if (!result.success) throw internalError();
  return throughJson(result.data);
}

/**
 * The client of a facade: checks the input, sends it through the transport, checks what comes
 * back. An error of the owner comes as the same `AppError` in both modes.
 */
export function createFacadeClient<M extends FacadeMethods>(
  facade: Facade<M>,
  transport: FacadeTransport,
): FacadeClient<M> {
  const calls = Object.entries(facade.methods).map(([name, method]) => {
    const call = async (given: unknown, context: CallContext): Promise<unknown> => {
      const sent = throughJson(method.input.parse(given));
      const answer = await transport({
        service: facade.service,
        method: name,
        input: sent,
        call: context,
      });
      return method.output.parse(answer);
    };
    return [name, call] as const;
  });
  return Object.freeze(Object.fromEntries(calls)) as FacadeClient<M>;
}

/** The transport of a bundle: the owner's function, called in the process (no HTTP hop, §2.4 rule 10). */
export function inProcessTransport<M extends FacadeMethods>(
  facade: Facade<M>,
  implementation: FacadeImplementation<M>,
): FacadeTransport {
  return ({ method, input: wire, call }) =>
    answerFacadeCall(facade, implementation, method, throughJson(wire), call);
}

// What goes over HTTP: the input, who is calling and the request id, all under the signature.
const envelopeSchema = strictObject(
  {
    input: unknown(),
    actor: actorSchema.optional(),
    requestId: string('requestId is required.').min(1, 'requestId is required.'),
  },
  'A call is { input, actor, requestId } and nothing else.',
);

/** The path of a call: `/internal/<service>/<method>`; the signature covers its name. */
export const facadePath = (service: Service, method: string): string =>
  `/internal/${service}/${method}`;

export interface SignedHttpOptions {
  /** Where the service that owns the facade is, like `http://commerce.internal:4000`. */
  baseUrl: string;
  key: SigningKey;
  clock: Clock;
  /** `fetch`, or another function that sends a request. */
  send?: typeof fetch;
  nonce?: () => string;
}

/** The transport of a split: signed HTTP to the service that owns the facade (SR-071). */
export function signedHttpTransport(options: SignedHttpOptions): FacadeTransport {
  const send = options.send ?? fetch;
  const nonce = options.nonce ?? randomUUID;
  return async ({ service, method, input: wire, call }) => {
    const body = JSON.stringify({
      input: wire,
      ...(call.actor === undefined ? {} : { actor: call.actor }),
      requestId: call.requestId,
    });
    const signed = signCall(
      options.key,
      `${service}.${method}`,
      body,
      options.clock.now(),
      nonce(),
    );
    const response = await send(`${options.baseUrl}${facadePath(service, method)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...signed },
      body,
    });
    const answer: unknown = await response.json().catch(() => undefined);
    if (response.status === 200) return (answer as { output?: unknown } | undefined)?.output;
    const error = errorBodySchema.safeParse(answer);
    if (!error.success) throw internalError();
    const { code, message, details } = error.data.error;
    throw new AppError({ status: statusOf(response.status), code, message, details });
  };
}

function statusOf(status: number): ErrorStatus {
  return ERROR_STATUSES.find((known) => known === status) ?? 500;
}

export interface FacadeEndpointOptions {
  verifier: Verifier;
  logger?: { error(fields: Readonly<Record<string, unknown>>, message: string): void };
}

export interface RawRequest {
  headers: Readonly<Record<string, string | undefined>>;
  /** The body as it came, as text: the signature is over these exact bytes. */
  body: string;
}

/**
 * The HTTP side of a facade, in the service that owns it: checks the signature first, then the
 * envelope, then answers the call. A call that is not signed right gets 401 and no reason (so the
 * caller learns nothing of the keys).
 */
export function createFacadeEndpoint<M extends FacadeMethods>(
  facade: Facade<M>,
  implementation: FacadeImplementation<M>,
  options: FacadeEndpointOptions,
): (method: string, request: RawRequest) => Promise<{ status: number; body: unknown }> {
  return async (method, request) => {
    const requestId = requestIdOf(request.headers['x-request-id']);
    try {
      const verdict = options.verifier.verify(
        `${facade.service}.${method}`,
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
      const envelope = envelopeSchema.safeParse(json);
      if (!envelope.success) {
        throw validationFailed(
          envelope.error.issues.map((issue) => ({
            path: ['body', ...issue.path.map(String)].join('.'),
            message: issue.message,
          })),
        );
      }
      const output = await answerFacadeCall(facade, implementation, method, envelope.data.input, {
        actor: envelope.data.actor,
        requestId: envelope.data.requestId,
      });
      return { status: 200, body: { output } };
    } catch (thrown) {
      const error = toAppError(thrown);
      if (!(thrown instanceof AppError)) {
        options.logger?.error(
          { err: thrown, requestId, call: `${facade.service}.${method}` },
          'A facade call failed.',
        );
      }
      return { status: error.status, body: errorBody(error, requestId) };
    }
  };
}
