import axios, { type AxiosResponse } from 'axios';

import {
  type EmailFrom,
  type EmailMessage,
  type EmailSender,
  httpFailure,
  networkFailure,
  providerIdOf,
} from './port.ts';

export interface BrevoOptions {
  apiKey: string;
  from: EmailFrom;
  /** default https://api.brevo.com; tests point it at a local server */
  baseUrl?: string;
  /** default 10 s: the send task holds the queue meanwhile */
  timeoutMs?: number;
}

/**
 * Brevo's transactional email API over HTTPS (POST /v3/smtp/email, header `api-key`). Render's free
 * plan blocks the SMTP ports, so never SMTP (ARCHITECTURE §10).
 */
export function brevoSender({
  apiKey,
  from,
  baseUrl = 'https://api.brevo.com',
  timeoutMs = 10_000,
}: BrevoOptions): EmailSender {
  const endpoint = new URL('/v3/smtp/email', baseUrl);
  return {
    name: 'brevo',
    send: async (message: EmailMessage) => {
      let response: AxiosResponse<unknown>;
      try {
        response = await axios.post<unknown>(
          endpoint.href,
          JSON.stringify({
            sender: { email: from.email, name: from.name },
            to: [{ email: message.to }],
            subject: message.subject,
            htmlContent: message.html,
            textContent: message.text,
            tags: message.tags,
          }),
          {
            headers: {
              'api-key': apiKey,
              'content-type': 'application/json',
              accept: 'application/json',
            },
            signal: AbortSignal.timeout(timeoutMs),
            // a redirect would carry the api-key to another address
            maxRedirects: 0,
            validateStatus: () => true,
          },
        );
      } catch {
        // axios's error holds the request (the api-key, the message): never pass it on
        throw networkFailure('BREVO');
      }
      if (response.status < 200 || response.status > 299) {
        // the body may echo the message: never into an error or a log
        throw httpFailure('BREVO', response.status);
      }
      return { providerId: providerIdOf(response.data, 'messageId') };
    },
  };
}
