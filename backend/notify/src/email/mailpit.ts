import axios, { type AxiosResponse } from 'axios';

import {
  type EmailFrom,
  type EmailMessage,
  type EmailSender,
  httpFailure,
  networkFailure,
  providerIdOf,
} from './port.ts';

export interface MailpitOptions {
  /** The Mailpit HTTP API, e.g. http://localhost:8025 */
  url: string;
  from: EmailFrom;
  timeoutMs?: number;
}

/**
 * The laptop's fake inbox (infra/docker-compose.yml): Mailpit's HTTP send API, the same shape of
 * call as Brevo live, so sign-in codes show up at http://localhost:8025 and nowhere real.
 */
export function mailpitSender({ url, from, timeoutMs = 5_000 }: MailpitOptions): EmailSender {
  const endpoint = new URL('/api/v1/send', url);
  return {
    name: 'mailpit',
    send: async (message: EmailMessage) => {
      let response: AxiosResponse<unknown>;
      try {
        response = await axios.post<unknown>(
          endpoint.href,
          JSON.stringify({
            From: { Email: from.email, Name: from.name },
            To: [{ Email: message.to }],
            Subject: message.subject,
            Text: message.text,
            HTML: message.html,
            Tags: message.tags,
          }),
          {
            headers: { 'content-type': 'application/json', accept: 'application/json' },
            signal: AbortSignal.timeout(timeoutMs),
            maxRedirects: 0,
            validateStatus: () => true,
          },
        );
      } catch {
        // axios's error holds the request (the message): never pass it on
        throw networkFailure('MAILPIT');
      }
      if (response.status < 200 || response.status > 299) {
        throw httpFailure('MAILPIT', response.status);
      }
      return { providerId: providerIdOf(response.data, 'ID') };
    },
  };
}
