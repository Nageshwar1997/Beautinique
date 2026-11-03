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
      'InvitationForm',
      'LEGAL_LINKS',
      'LinkButton',
      'MyDevices',
      'NEXT_PARAM',
      'RECOVERY_CODES_FILE',
      'RecoveryCodes',
      'RedirectIfSignedIn',
      'RequireSignIn',
      'SecuritySettings',
      'SessionProvider',
      'SignInForm',
      'SignUpForm',
      'StatusBadge',
      'StepUpProvider',
      'TEXT_LINK',
      'TextLink',
      'authHref',
      'clearSessionHint',
      'groupSecret',
      'hasSessionHint',
      'recoveryCodesText',
      'safeNext',
      'signInStateOf',
      'useSession',
    ]);
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
