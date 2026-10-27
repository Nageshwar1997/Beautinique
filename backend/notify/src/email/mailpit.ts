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
      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({
            From: { Email: from.email, Name: from.name },
            To: [{ Email: message.to }],
            Subject: message.subject,
            Text: message.text,
            HTML: message.html,
            Tags: message.tags,
          }),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch {
        throw networkFailure('MAILPIT');
      }
      if (!response.ok) {
        await response.body?.cancel();
        throw httpFailure('MAILPIT', response.status);
      }
      const body: unknown = await response.json().catch(() => null);
      return { providerId: providerIdOf(body, 'ID') };
    },
  };
}
