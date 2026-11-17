// What the apps' E2E read from the laptop's or CI's Mailpit (`npm run infra:up`): the emailed
// codes and the emails to one address, which each test makes its own (`e2eEmail`).
const MAILPIT = 'http://localhost:8025/api/v1';

export interface Mail {
  ID: string;
  Subject: string;
  Snippet: string;
}

/** A fresh test address for one test: never a real person's (@beautinique.example). */
export function e2eEmail(name: string): string {
  return `e2e-${name}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}@beautinique.example`;
}

/** Mailpit's answer to a search; none while it does not answer (a busy machine drops a call). */
async function search(to: string): Promise<Mail[] | null> {
  try {
    const answer = await fetch(`${MAILPIT}/search?query=${encodeURIComponent(`to:${to}`)}`);
    return ((await answer.json()) as { messages: Mail[] }).messages;
  } catch {
    return null;
  }
}

/** The emails to `to`, newest first, once there are `count` (30 s at most). */
export async function mailsTo(to: string, count = 1): Promise<Mail[]> {
  const end = Date.now() + 30_000;
  for (;;) {
    const found = await search(to);
    if (found !== null && found.length >= count) return found;
    if (Date.now() > end) throw new Error(`fewer than ${String(count)} emails reached ${to}`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

/** The 6-digit code of the `count`-th email to `to` (the newest one). */
export async function codeFor(to: string, count = 1): Promise<string> {
  const [newest] = await mailsTo(to, count);
  const code = /\b(\d{6})\b/.exec(newest?.Snippet ?? '')?.[1];
  if (code === undefined) throw new Error(`no code in the email to ${to}`);
  return code;
}

/** Deletes every email to `to` (a test cleans up after itself). */
export async function deleteMailsTo(to: string): Promise<void> {
  const found = await search(to);
  if (found === null || found.length === 0) return;
  await fetch(`${MAILPIT}/messages`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ IDs: found.map((mail) => mail.ID) }),
  });
}
