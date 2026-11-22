/** One email, already rendered. English only; the text part is always there. */
export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Short labels the provider shows in its logs (`otp`); never personal data. */
  tags: readonly string[];
}

/** The sender every message goes out as: one verified address (there is no own domain). */
export interface EmailFrom {
  email: string;
  name: string;
}

/** Delivers email (ARCHITECTURE §10): Brevo's HTTPS API live, Mailpit on the laptop, a fake in tests. */
export interface EmailSender {
  readonly name: string;
  /** Resolves with the provider's message id; fails with EmailSendError. */
  send(message: EmailMessage): Promise<{ providerId: string }>;
}

/**
 * Why a send failed, without the message (no addresses or codes in errors or logs). `retry`: the
 * same message may go through later (network, 5xx, rate limit, a key fixed in the dashboard);
 * otherwise the provider refused this message for good.
 */
export class EmailSendError extends Error {
  readonly code: string;
  readonly retry: boolean;
  readonly status: number | undefined;

  constructor(code: string, { retry, status }: { retry: boolean; status?: number }) {
    super(`Email not sent: ${code}${status === undefined ? '' : ` (HTTP ${String(status)})`}`);
    this.name = 'EmailSendError';
    this.code = code;
    this.retry = retry;
    this.status = status;
  }
}

/**
 * Turns a provider's HTTP answer into an EmailSendError: 400 and 422 refuse the message, 401 and
 * 403 mean a wrong key (worth trying again once someone fixes it), the rest (402 credits, 429,
 * 5xx) pass with time.
 */
export function httpFailure(provider: string, status: number): EmailSendError {
  if (status === 400 || status === 422) {
    return new EmailSendError(`${provider}_REJECTED`, { retry: false, status });
  }
  if (status === 401 || status === 403) {
    return new EmailSendError(`${provider}_UNAUTHORIZED`, { retry: true, status });
  }
  return new EmailSendError(`${provider}_UNAVAILABLE`, { retry: true, status });
}

/** A request that did not get an answer (timeout, DNS, connection refused): try again later. */
export function networkFailure(provider: string): EmailSendError {
  return new EmailSendError(`${provider}_UNREACHABLE`, { retry: true });
}

/** The provider answered 2xx without the id it promises: sent, but say so. */
export function providerIdOf(body: unknown, field: string): string {
  if (typeof body === 'object' && body !== null) {
    const value = (body as Record<string, unknown>)[field];
    if (typeof value === 'string' && value !== '') return value;
  }
  return 'unknown';
}
