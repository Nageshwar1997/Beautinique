// A stand-in for Google, LinkedIn and GitHub sign-in (TASKS T3.1 PR 4), for identity's tests and
// the apps' E2E: identity points at it with IDENTITY__OAUTH_PROVIDERS_URL, so no test ever reaches
// a real provider. Each provider's pages and API live at /<provider>/...: the sign-in page agrees at
// once for the person queued next (or says the person cancelled), the token endpoint checks the
// code, the redirect URL, the client and PKCE like the real ones, and the API says who it is.
//   in a test:  const fake = await startFakeOAuth(); fake.next('google', { subject, email });
//   over HTTP:  POST <url>/fake/next {"provider":"google","person":{...}} (E2E specs)
import { createHash, randomBytes } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

export type FakeProvider = 'google' | 'linkedin' | 'github';

/** Who signs in at the provider next. */
export interface FakePerson {
  /** The provider's id for them (GitHub's is a number) */
  subject: string;
  email?: string;
  /** Whether the provider verified the email (default true) */
  emailVerified?: boolean;
}

/** What the stand-in saw, for tests to check. */
export interface FakeSeen {
  authorize: URLSearchParams[];
  token: URLSearchParams[];
}

export interface FakeOAuth {
  /** `http://127.0.0.1:<port>`: IDENTITY__OAUTH_PROVIDERS_URL */
  url: string;
  /** The next sign-in at `provider` is this person, or a cancel */
  next(provider: FakeProvider, person: FakePerson | 'cancel'): void;
  /** The client secret each provider expects (any, when not set) */
  secrets: Partial<Record<FakeProvider, string>>;
  seen: FakeSeen;
  stop(): Promise<void>;
}

interface Grant {
  provider: FakeProvider;
  person: FakePerson;
  clientId: string;
  redirectUri: string;
  challenge: string | null;
}

const PROVIDERS: readonly FakeProvider[] = ['google', 'linkedin', 'github'];
const isProvider = (value: string | undefined): value is FakeProvider =>
  (PROVIDERS as readonly (string | undefined)[]).includes(value);

const token = (): string => randomBytes(24).toString('base64url');

async function bodyOf(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));
}

/** Starts the stand-in on 127.0.0.1 (`port` 0: any free one). */
export async function startFakeOAuth({ port = 0 }: { port?: number } = {}): Promise<FakeOAuth> {
  const queued = new Map<FakeProvider, (FakePerson | 'cancel')[]>();
  const grants = new Map<string, Grant>();
  const tokens = new Map<string, { provider: FakeProvider; person: FakePerson }>();
  const seen: FakeSeen = { authorize: [], token: [] };
  const secrets: FakeOAuth['secrets'] = {};
  const next: FakeOAuth['next'] = (provider, person) => {
    queued.set(provider, [...(queued.get(provider) ?? []), person]);
  };

  const server = createServer((req, res) => {
    void (async () => {
      const url = new URL(req.url ?? '/', 'http://fake');
      const [, provider, ...rest] = url.pathname.split('/');
      const path = rest.join('/');
      if (provider === 'fake' && path === 'next' && req.method === 'POST') {
        const { provider: which, person } = JSON.parse(await bodyOf(req)) as {
          provider: string;
          person: FakePerson | 'cancel';
        };
        if (!isProvider(which)) {
          json(res, 400, { error: 'unknown provider' });
          return;
        }
        next(which, person);
        json(res, 200, { queued: true });
        return;
      }
      if (!isProvider(provider)) {
        json(res, 404, { error: 'not_found' });
        return;
      }

      if (path === 'authorize' && req.method === 'GET') {
        seen.authorize.push(url.searchParams);
        const redirectUri = url.searchParams.get('redirect_uri') ?? '';
        const state = url.searchParams.get('state') ?? '';
        const back = new URL(redirectUri);
        const person = queued.get(provider)?.shift() ?? 'cancel';
        if (person === 'cancel') {
          back.search = new URLSearchParams({ error: 'access_denied', state }).toString();
        } else {
          const code = token();
          grants.set(code, {
            provider,
            person,
            clientId: url.searchParams.get('client_id') ?? '',
            redirectUri,
            challenge: url.searchParams.get('code_challenge'),
          });
          back.search = new URLSearchParams({ code, state }).toString();
        }
        res.writeHead(302, { location: back.toString() }).end();
        return;
      }

      if (path === 'token' && req.method === 'POST') {
        const form = new URLSearchParams(await bodyOf(req));
        seen.token.push(form);
        const code = form.get('code') ?? '';
        const grant = grants.get(code);
        grants.delete(code);
        const verifier = form.get('code_verifier');
        const pkceOk =
          grant?.challenge === null ||
          (grant !== undefined &&
            verifier !== null &&
            createHash('sha256').update(verifier).digest('base64url') === grant.challenge);
        const expected = secrets[provider];
        const ok =
          grant?.provider === provider &&
          grant.redirectUri === form.get('redirect_uri') &&
          grant.clientId === form.get('client_id') &&
          (expected === undefined || expected === form.get('client_secret')) &&
          pkceOk;
        if (!ok) {
          // GitHub answers 200 with an error body; the others 400
          json(res, provider === 'github' ? 200 : 400, { error: 'invalid_grant' });
          return;
        }
        const access = token();
        tokens.set(access, { provider, person: grant.person });
        json(res, 200, { access_token: access, token_type: 'Bearer', expires_in: 3600 });
        return;
      }

      const bearer = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1];
      const holder = bearer === undefined ? undefined : tokens.get(bearer);
      if (holder?.provider !== provider) {
        json(res, 401, { error: 'invalid_token' });
        return;
      }
      const { person } = holder;
      const verified = person.emailVerified ?? true;
      if (provider !== 'github' && path === 'userinfo' && req.method === 'GET') {
        json(res, 200, {
          sub: person.subject,
          name: 'Riya',
          ...(person.email === undefined ? {} : { email: person.email, email_verified: verified }),
        });
        return;
      }
      if (provider === 'github' && path === 'user' && req.method === 'GET') {
        json(res, 200, { id: Number(person.subject), login: `riya${person.subject}` });
        return;
      }
      if (provider === 'github' && path === 'emails' && req.method === 'GET') {
        json(
          res,
          200,
          person.email === undefined
            ? []
            : [
                { email: `other-${person.email}`, primary: false, verified: true },
                { email: person.email, primary: true, verified },
              ],
        );
        return;
      }
      json(res, 404, { error: 'not_found' });
    })().catch(() => {
      if (!res.headersSent) json(res, 500, { error: 'server_error' });
    });
  });
  await new Promise<void>((resolve) => server.listen(port, '127.0.0.1', resolve));
  const { port: bound } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${String(bound)}`,
    next,
    secrets,
    seen,
    async stop() {
      await new Promise((resolve) => server.close(resolve));
      server.closeAllConnections();
    },
  };
}
