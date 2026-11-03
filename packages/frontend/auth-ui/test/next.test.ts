import { describe, expect, it } from 'vitest';

import * as api from '../src/index';
import { AUTH_PATHS, authHref, safeNext } from '../src/index';

describe('the entry point', () => {
  it('has the screens, the session and the helpers', () => {
    expect(Object.keys(api).toSorted()).toEqual([
      'ACCOUNT_PATHS',
      'APP_NAMES',
      'AUTH_PATHS',
      'AccountCard',
      'AccountMenu',
      'AuthLayout',
      'AuthenticatorSetup',
      'CodeStep',
      'EmailStep',
      'FEW_RECOVERY_CODES',
      'ForgotPasswordForm',
      'IDLE_RENEW_MS',
      'IDLE_TICK_MS',
      'IDLE_WARNING_MS',
      'IdleNotice',
      'InvitationForm',
      'LEGAL_LINKS',
      'LinkButton',
      'MyDevices',
      'NEXT_PARAM',
      'PROVIDER_NAMES',
      'RECOVERY_CODES_FILE',
      'RecoveryCodes',
      'RedirectIfSignedIn',
      'RequireSignIn',
      'SecuritySettings',
      'SessionProvider',
      'SignInForm',
      'SignUpForm',
      'SocialSignIn',
      'SocialSignUpFinish',
      'StatusBadge',
      'StepUpProvider',
      'TEXT_LINK',
      'TextLink',
      'authHref',
      'clearSessionHint',
      'groupSecret',
      'hasSessionHint',
      'idleSignOutNotice',
      'oauthNotice',
      'recoveryCodesText',
      'safeNext',
      'signInStateOf',
      'totpStepHref',
      'totpStepOf',
      'useSession',
    ]);
  });
});

describe('social sign-in helpers', () => {
  it('reads the authenticator step a provider sent the browser to, and names why it came back', () => {
    const loginId = '01920000-0000-7000-8000-000000000003';
    expect(api.totpStepOf(`#totp=${loginId}`)).toBe(loginId);
    for (const hash of ['', '#totp=', '#totp=abc', `#other=${loginId}`, `#totp=${loginId}x`]) {
      expect(api.totpStepOf(hash), hash).toBeNull();
    }
    expect(api.totpStepHref(loginId, '/account')).toBe(`/sign-in?next=%2Faccount#totp=${loginId}`);
    expect(api.totpStepHref(loginId, '/')).toBe(`/sign-in#totp=${loginId}`);
    expect(api.oauthNotice('cancelled')).toContain('cancelled');
    expect(api.oauthNotice('locked')).toContain('in an hour');
    expect(api.oauthNotice('something-else')).toBeUndefined();
    expect(api.oauthNotice(null)).toBeUndefined();
    // the consent page is an auth page: never a place to come back to
    expect(AUTH_PATHS.socialSignUp).toBe('/sign-up/finish');
    expect(safeNext('/sign-up/finish')).toBe('/');
  });
});

describe('safeNext', () => {
  it('keeps a page of this site, with its search and hash', () => {
    expect(safeNext('/orders')).toBe('/orders');
    expect(safeNext('/products/rose-lipstick?v=2#reviews')).toBe(
      '/products/rose-lipstick?v=2#reviews',
    );
    expect(safeNext('/cart?add=sku-1')).toBe('/cart?add=sku-1');
    // encoded characters stay encoded: only ever a path here
    expect(safeNext('/a%0d%0ab')).toBe('/a%0d%0ab');
  });

  it('sends anything that could leave the site, or loop, home', () => {
    for (const next of [
      null,
      undefined,
      '',
      'orders',
      'https://evil.example/',
      '//evil.example',
      '/\\evil.example',
      '/a\u0000b',
      '/a\nb',
      'javascript:alert(1)',
      `/${'a'.repeat(2048)}`,
      '/sign-in',
      '/sign-in/',
      '/sign-in?next=/orders',
      '/sign-up',
      '/forgot-password',
      '/invitation',
    ]) {
      expect(safeNext(next), String(next)).toBe('/');
    }
  });

  it('builds auth links that carry next, and none for the home page', () => {
    expect(authHref(AUTH_PATHS.signIn, '/orders?page=2')).toBe(
      '/sign-in?next=%2Forders%3Fpage%3D2',
    );
    expect(authHref(AUTH_PATHS.signUp, '/')).toBe('/sign-up');
    expect(authHref(AUTH_PATHS.signIn, '//evil.example')).toBe('/sign-in');
    expect(authHref(AUTH_PATHS.forgotPassword, null)).toBe('/forgot-password');
  });
});
