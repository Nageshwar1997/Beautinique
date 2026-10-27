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
      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'content-type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            sender: { email: from.email, name: from.name },
            to: [{ email: message.to }],
            subject: message.subject,
            htmlContent: message.html,
            textContent: message.text,
            tags: message.tags,
          }),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch {
        throw networkFailure('BREVO');
      }
      if (!response.ok) {
        // the body may echo the message: read it away, never into an error or a log
        await response.body?.cancel();
        throw httpFailure('BREVO', response.status);
      }
      const body: unknown = await response.json().catch(() => null);
      return { providerId: providerIdOf(body, 'messageId') };
    },
  };
}
