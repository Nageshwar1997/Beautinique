import type { Logger } from '@beautinique/backend-server-kit';
import type { AppId } from '@beautinique/shared-contracts';

/** What proved who the person is in a sign-in (the session records it, T3.2). */
export type AuthMethod = 'email-code' | 'password' | 'totp' | 'recovery-code';

export interface IssueSessionInput {
  userId: string;
  email: string;
  app: AppId;
  methods: AuthMethod[];
}

/**
 * The last step of every sign-in (ARCHITECTURE §7.1). T3.2 puts the real session here (refresh
 * rotation, ES256 tokens, per-app cookies), and T3.3 the check that the account has a grant in
 * the app: no grant, no session.
 */
export interface SessionPort {
  issue(input: IssueSessionInput): Promise<{ userId: string; email: string }>;
}

/**
 * Until T3.2: no session, no cookie. It only names who signed in, so nothing a sign-in gives
 * opens anything (the gateway refuses every non-public route without a session).
 */
export const namesOnlySessions = (logger: Logger): SessionPort => ({
  issue({ userId, email, app, methods }) {
    logger.info({ userId, app, methods }, 'signed in (no session until T3.2)');
    return Promise.resolve({ userId, email });
  },
});
