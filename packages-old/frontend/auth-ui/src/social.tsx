import { API_BASE_URL, useApiClient, useApiQuery } from '@beautinique/frontend-api-client';
import { cx, Spinner } from '@beautinique/frontend-components';
import { CheckboxField, Form, SubmitButton, useZodForm } from '@beautinique/frontend-forms';
import {
  finishSocialSignUp,
  getSocialSignUp,
  listSocialProviders,
  navigationHref,
  OAUTH_RESULTS,
  OAUTH_TOTP_FRAGMENT,
  type OAuthResult,
  type SocialProvider,
  startSocialSignIn,
} from '@beautinique/shared-contracts';
import { literal, object, type ZodType } from '@beautinique/shared-zod';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { LEGAL_LINKS, type LegalLinks } from './email-step';
import { TEXT_LINK, TextLink } from './layout';
import { AUTH_PATHS, authHref, safeNext } from './next';
import { useSession } from './session';

/** The providers' names as people know them. */
export const PROVIDER_NAMES: Readonly<Record<SocialProvider, string>> = {
  google: 'Google',
  linkedin: 'LinkedIn',
  github: 'GitHub',
};

/** Each provider's logo, when the app has one (the icons package). */
export type ProviderIcons = Partial<Record<SocialProvider, ReactNode>>;

/** Why a social sign-in came back to the sign-in page (`?oauth=`), in words. */
const OAUTH_NOTICES: Readonly<Record<OAuthResult, string>> = {
  cancelled: 'Signing in was cancelled. Choose how you want to sign in.',
  expired: 'That sign-in took too long, or began in another browser. Please try again.',
  failed:
    'We could not sign you in with that account just now. Please try again, or use your email and password.',
  'email-unverified':
    'That account has no verified email we can use. Verify your email with them, or sign up with your email here.',
  locked: 'There were too many wrong tries on this account. Please try again in an hour.',
};

/** The sign-in page's note for `?oauth=<result>`; nothing for anything else. */
export function oauthNotice(result: string | null): string | undefined {
  return (OAUTH_RESULTS as readonly (string | null)[]).includes(result)
    ? OAUTH_NOTICES[result as OAuthResult]
    : undefined;
}

/** The sign-in's authenticator step a provider sent the browser to: `#totp=<loginId>`. */
export function totpStepOf(hash: string): string | null {
  const found = new RegExp(`^#${OAUTH_TOTP_FRAGMENT}=([0-9a-f-]{36})$`, 'i').exec(hash);
  return found?.[1] ?? null;
}

/** The authenticator step's link after a provider: `/sign-in?next=...#totp=<loginId>`. */
export const totpStepHref = (loginId: string, next: string): string =>
  `${authHref(AUTH_PATHS.signIn, next)}#${OAUTH_TOTP_FRAGMENT}=${loginId}`;

export interface SocialSignInProps {
  /** Where to go once signed in (the page's `next`) */
  next?: string | null;
  /** The providers' logos (decorative: the text names them) */
  icons?: ProviderIcons;
}

/**
 * "Continue with Google / LinkedIn / GitHub" (ARCHITECTURE §7.1, the customer app only): links,
 * since the browser goes to the provider and back as pages. Shown only where they work: the
 * origin registered with the providers (a Vercel preview, or a provider without a client, shows
 * none).
 */
export function SocialSignIn({ next, icons = {} }: SocialSignInProps) {
  const offered = useApiQuery(listSocialProviders, undefined, { staleTime: 5 * 60_000 });
  const here = typeof window === 'undefined' ? null : window.location.origin;
  const data = offered.data;
  if (!data || data.providers.length === 0 || data.origin === null || data.origin !== here) {
    return null;
  }
  const target = safeNext(next);
  return (
    <div className="space-y-3">
      <div className="text-foreground-muted flex items-center gap-3 text-sm">
        <span aria-hidden="true" className="bg-border h-px flex-1" />
        or
        <span aria-hidden="true" className="bg-border h-px flex-1" />
      </div>
      <ul className="space-y-3">
        {data.providers.map((provider) => (
          <li key={provider}>
            <a
              href={navigationHref(API_BASE_URL, startSocialSignIn, {
                params: { provider },
                query: target === '/' ? {} : { next: target },
              })}
              className={cx(
                'tone-neutral focus-ring min-h-touch inline-flex w-full items-center justify-center gap-3 rounded-full px-5 text-base font-medium',
                'border-border-strong bg-surface text-foreground hover:bg-tone-subtle border',
              )}
            >
              {icons[provider] !== undefined && (
                <span aria-hidden="true" className="inline-flex size-5 items-center">
                  {icons[provider]}
                </span>
              )}
              Continue with {PROVIDER_NAMES[provider]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ConsentFields {
  consent?: { terms?: boolean; adult?: boolean };
}
interface ConsentValues {
  consent: { terms: true; adult: true };
}

/** The customer app's consent, as its sign-up asks it (contracts consentProblems). */
const consentZod: ZodType<ConsentValues, ConsentFields> = object({
  consent: object({
    terms: literal(true, 'Accept the terms and privacy notice'),
    adult: literal(true, 'Confirm that you are 18 or older'),
  }),
});

/**
 * The page a provider sends a new account to (`/sign-up/finish`): the consent this app asks (18
 * or older, the terms and privacy notice), then signed in, or the authenticator step of an account
 * that has one. The waiting sign-up lasts 15 minutes; after that, choose the provider again.
 */
export function SocialSignUpFinish({ legal = LEGAL_LINKS }: { legal?: LegalLinks }) {
  const client = useApiClient();
  const session = useSession();
  const navigate = useNavigate();
  const waiting = useApiQuery(getSocialSignUp, undefined, { retry: false, staleTime: Infinity });
  const form = useZodForm(consentZod, { defaultValues: {} });
  if (waiting.isPending) {
    return (
      <div className="flex min-h-32 items-center justify-center">
        <Spinner label="Loading your sign-up" />
      </div>
    );
  }
  if (waiting.isError) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm">
          {waiting.error.code === 'OAUTH_SIGN_UP_EXPIRED'
            ? waiting.error.message
            : 'We could not load your sign-up. Please start again.'}
        </p>
        <p className="text-sm">
          <TextLink to={AUTH_PATHS.signIn}>Sign in</TextLink> or{' '}
          <TextLink to={AUTH_PATHS.signUp}>create an account</TextLink>.
        </p>
      </div>
    );
  }
  const { provider, email } = waiting.data;
  return (
    <Form
      form={form}
      className="space-y-4"
      onSubmit={async (body) => {
        const done = await client.call(finishSocialSignUp, { body });
        if (done.next === 'totp' && done.loginId !== undefined) {
          await navigate(totpStepHref(done.loginId, done.nextPath), { replace: true });
          return;
        }
        await session.signedIn();
        await navigate(safeNext(done.nextPath), { replace: true });
      }}
    >
      <p className="text-sm">
        You are signing up to Beautinique as <strong className="font-semibold">{email}</strong> with{' '}
        {PROVIDER_NAMES[provider]}.
      </p>
      <CheckboxField control={form.control} name="consent.terms">
        I accept the{' '}
        <a href={legal.terms} target="_blank" rel="noreferrer" className={TEXT_LINK}>
          terms of use
        </a>{' '}
        and the{' '}
        <a href={legal.privacy} target="_blank" rel="noreferrer" className={TEXT_LINK}>
          privacy notice
        </a>
      </CheckboxField>
      <CheckboxField control={form.control} name="consent.adult">
        I am 18 or older
      </CheckboxField>
      <SubmitButton fullWidth>Create account</SubmitButton>
    </Form>
  );
}
