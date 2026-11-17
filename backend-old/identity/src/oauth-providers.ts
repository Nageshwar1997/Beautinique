import { createHash, randomBytes } from 'node:crypto';

import type { SocialProvider } from '@beautinique/shared-contracts';
import {
  array,
  boolean,
  emailZod,
  number,
  object,
  string,
  union,
  type ZodType,
} from '@beautinique/shared-zod';
import axios, { type AxiosResponse } from 'axios';

/**
 * The three providers' OAuth endpoints (ARCHITECTURE §7.1). identity never uses an ID token: it
 * takes the access token from the provider's token endpoint itself (TLS, its client secret, PKCE
 * where the provider has it) and asks the provider's API who that is. LinkedIn's web flow has no
 * PKCE (only its native apps do), so there the `state` cookie alone ties the trip to the browser.
 */
interface ProviderSpec {
  authorize: string;
  token: string;
  scope: string;
  pkce: boolean;
  /** More authorize parameters */
  extra: Record<string, string>;
  /** The API calls that say who this is */
  api: Record<string, string>;
}

const SPECS: Readonly<Record<SocialProvider, ProviderSpec>> = {
  google: {
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    scope: 'openid email profile',
    pkce: true,
    // the account chooser, so a second Google account can be picked
    extra: { prompt: 'select_account' },
    api: { userinfo: 'https://openidconnect.googleapis.com/v1/userinfo' },
  },
  linkedin: {
    authorize: 'https://www.linkedin.com/oauth/v2/authorization',
    token: 'https://www.linkedin.com/oauth/v2/accessToken',
    scope: 'openid profile email',
    pkce: false,
    extra: {},
    api: { userinfo: 'https://api.linkedin.com/v2/userinfo' },
  },
  github: {
    authorize: 'https://github.com/login/oauth/authorize',
    token: 'https://github.com/login/oauth/access_token',
    scope: 'read:user user:email',
    pkce: true,
    extra: {},
    api: { user: 'https://api.github.com/user', emails: 'https://api.github.com/user/emails' },
  },
};

/** One provider's client, from IDENTITY__<PROVIDER>_CLIENT_ID and _SECRET. */
export interface ProviderClient {
  clientId: string;
  clientSecret: string;
}

/** Social sign-in's settings: the clients set, the redirect origin, and a stand-in for tests. */
export interface SocialSettings {
  clients: Partial<Record<SocialProvider, ProviderClient>>;
  /** IDENTITY__OAUTH_REDIRECT_ORIGIN; null when no provider is set */
  origin: string | null;
  /** IDENTITY__OAUTH_PROVIDERS_URL (tests and E2E): every endpoint at this stand-in */
  providersUrl?: string;
}

/** Who the provider says signed in: its own id for them, and their email when it is verified. */
export interface ProviderProfile {
  subject: string;
  /** Lower case (emailZod); null when the provider gave none */
  email: string | null;
  emailVerified: boolean;
}

/**
 * The provider did not answer as it should (network, a refused code, an odd body). Carries no
 * axios error: those hold the request, with the client secret and the code (RULES §3.8).
 */
export class ProviderFailure extends Error {
  readonly provider: SocialProvider;
  readonly step: 'token' | 'profile';
  /** The provider's HTTP status; 0 when it never answered */
  readonly status: number;

  constructor(provider: SocialProvider, step: 'token' | 'profile', status: number) {
    super(`${provider} ${step} failed (${String(status)})`);
    this.name = 'ProviderFailure';
    this.provider = provider;
    this.step = step;
    this.status = status;
  }
}

const TIMEOUT_MS = 10_000;

const endpoint = (
  settings: SocialSettings,
  provider: SocialProvider,
  name: string,
  real: string,
) => (settings.providersUrl === undefined ? real : `${settings.providersUrl}/${provider}/${name}`);

/** The callback URL registered with every provider, for this app's origin. */
export const redirectUri = (settings: SocialSettings, provider: SocialProvider): string =>
  `${settings.origin ?? ''}/api/v1/auth/oauth/${provider}/callback`;

/** A PKCE pair (RFC 7636, S256): the verifier stays in Redis, the challenge goes to the provider. */
export function pkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString('base64url');
  return { verifier, challenge: createHash('sha256').update(verifier).digest('base64url') };
}

/** Whether the provider gets PKCE (LinkedIn's web flow has none). */
export const usesPkce = (provider: SocialProvider): boolean => SPECS[provider].pkce;

/** The provider's sign-in page for this trip. */
export function authorizeUrl(
  settings: SocialSettings,
  provider: SocialProvider,
  { clientId, state, challenge }: { clientId: string; state: string; challenge: string | null },
): string {
  const spec = SPECS[provider];
  const url = new URL(endpoint(settings, provider, 'authorize', spec.authorize));
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri(settings, provider),
    scope: spec.scope,
    state,
    ...(challenge === null ? {} : { code_challenge: challenge, code_challenge_method: 'S256' }),
    ...spec.extra,
  }).toString();
  return url.toString();
}

const tokenZod = object({ access_token: string().min(1) });
const oidcUserZod = object({
  sub: string().min(1),
  email: string().optional(),
  email_verified: union([boolean(), string()]).optional(),
});
const githubUserZod = object({ id: number().int() });
const githubEmailsZod = array(object({ email: string(), primary: boolean(), verified: boolean() }));

/** One call; anything but 200 with the expected body is a ProviderFailure (no axios error out). */
async function ask<T>(
  provider: SocialProvider,
  step: 'token' | 'profile',
  schema: ZodType<T>,
  call: () => Promise<AxiosResponse<unknown>>,
): Promise<T> {
  let answer: AxiosResponse<unknown>;
  try {
    answer = await call();
  } catch {
    throw new ProviderFailure(provider, step, 0);
  }
  const parsed = schema.safeParse(answer.data);
  if (answer.status !== 200 || !parsed.success) {
    throw new ProviderFailure(provider, step, answer.status);
  }
  return parsed.data;
}

const http = axios.create({
  timeout: TIMEOUT_MS,
  maxContentLength: 64 * 1024,
  maxRedirects: 0,
  validateStatus: () => true,
  headers: { 'User-Agent': 'Beautinique-identity' },
});

/** The code from the callback for an access token (with the PKCE verifier where there is one). */
async function accessToken(
  settings: SocialSettings,
  provider: SocialProvider,
  { client, code, verifier }: { client: ProviderClient; code: string; verifier: string | null },
): Promise<string> {
  const form = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(settings, provider),
    client_id: client.clientId,
    client_secret: client.clientSecret,
    ...(verifier === null ? {} : { code_verifier: verifier }),
  });
  const token = await ask(provider, 'token', tokenZod, () =>
    http.post(endpoint(settings, provider, 'token', SPECS[provider].token), form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    }),
  );
  return token.access_token;
}

const verifiedEmail = (email: string | undefined): string | null => {
  const parsed = emailZod.safeParse(email);
  return parsed.success ? parsed.data : null;
};

/** Who the access token belongs to. */
async function profileOf(
  settings: SocialSettings,
  provider: SocialProvider,
  token: string,
): Promise<ProviderProfile> {
  const api = (name: string) => endpoint(settings, provider, name, SPECS[provider].api[name] ?? '');
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
  if (provider === 'github') {
    const user = await ask(provider, 'profile', githubUserZod, () =>
      http.get(api('user'), { headers: { ...headers, Accept: 'application/vnd.github+json' } }),
    );
    const emails = await ask(provider, 'profile', githubEmailsZod, () =>
      http.get(api('emails'), { headers: { ...headers, Accept: 'application/vnd.github+json' } }),
    );
    // the primary one, and only once GitHub has verified it
    const primary = emails.find((e) => e.primary && e.verified);
    const email = verifiedEmail(primary?.email);
    return { subject: String(user.id), email, emailVerified: email !== null };
  }
  const user = await ask(provider, 'profile', oidcUserZod, () =>
    http.get(api('userinfo'), { headers }),
  );
  return {
    subject: user.sub,
    email: verifiedEmail(user.email),
    // some providers send "true" as a string
    emailVerified: user.email_verified === true || user.email_verified === 'true',
  };
}

/** The whole server-to-server part of a callback: the code for who signed in. */
export async function signedInAt(
  settings: SocialSettings,
  provider: SocialProvider,
  { code, verifier }: { code: string; verifier: string | null },
): Promise<ProviderProfile> {
  const client = settings.clients[provider];
  if (!client) throw new ProviderFailure(provider, 'token', 0);
  const token = await accessToken(settings, provider, { client, code, verifier });
  return profileOf(settings, provider, token);
}

/** The settings from identity's config. */
export function socialSettings(config: {
  googleClientId?: string;
  googleClientSecret?: string;
  linkedinClientId?: string;
  linkedinClientSecret?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  oauthRedirectOrigin?: string;
  oauthProvidersUrl?: string;
}): SocialSettings {
  const pair = (clientId?: string, clientSecret?: string): ProviderClient | undefined =>
    clientId !== undefined && clientSecret !== undefined ? { clientId, clientSecret } : undefined;
  const clients: SocialSettings['clients'] = {};
  const google = pair(config.googleClientId, config.googleClientSecret);
  const linkedin = pair(config.linkedinClientId, config.linkedinClientSecret);
  const github = pair(config.githubClientId, config.githubClientSecret);
  if (google) clients.google = google;
  if (linkedin) clients.linkedin = linkedin;
  if (github) clients.github = github;
  return {
    clients,
    origin: config.oauthRedirectOrigin ?? null,
    ...(config.oauthProvidersUrl === undefined ? {} : { providersUrl: config.oauthProvidersUrl }),
  };
}
