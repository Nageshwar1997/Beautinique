// The customer app's sign-up and sign-in, end to end (ARCHITECTURE §9.2): the browser, the dev
// server's /api proxy, the gateway, identity, notify and Mailpit. Each test makes its own account.
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

import { codeFor, deleteMailsTo, e2eEmail } from '../../../scripts/e2e/mail';
import { totpCode } from '../../../scripts/e2e/totp';

const PASSWORD = 'pink lipstick on a rainy day';
const NEW_PASSWORD = 'rose gold eyeliner at midnight';

/** axe on the page as it is, colour contrast included (a real layout here). */
async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([]);
}

/** Nothing wider than the screen (no sideways scroll on a phone). */
async function expectNoSideScroll(page: Page) {
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(wide).toBeLessThanOrEqual(0);
}

/** The header's account control, once the session is known. */
const accountButton = (page: Page, email: string) =>
  page.getByRole('button', { name: `Account (${email})` });

async function signUp(page: Page, email: string, next = '/credits') {
  await page.goto(`/sign-up?next=${encodeURIComponent(next)}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Create an account' })).toBeVisible();
  await expectNoAxeViolations(page);
  // nothing filled: the fields say what is missing, before any call
  await page.getByRole('button', { name: 'Send code' }).click();
  await expect(page.getByText('Accept the terms and privacy notice')).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByLabel('Email').fill(email);
  // the visible box sits over the hidden input, as React Aria draws it: the click lands on the box
  await page.getByRole('checkbox', { name: /I accept the/ }).check({ force: true });
  await page.getByRole('checkbox', { name: 'I am 18 or older' }).check({ force: true });
  await page.getByRole('button', { name: 'Send code' }).click();
  await expect(page.getByText(`We sent a 6-digit code to ${email}`)).toBeVisible();
  await expectNoAxeViolations(page);
  await expectNoSideScroll(page);
  await page.getByLabel('Code from the email').fill(await codeFor(email));
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(next);
  await expect(accountButton(page, email)).toBeVisible();
}

async function signOut(page: Page, email: string) {
  await accountButton(page, email).click();
  await expect(page.getByRole('menu')).toContainText(email);
  await expectNoAxeViolations(page);
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  // the toast (its live region repeats the text for screen readers)
  await expect(page.getByText('You are signed out.').first()).toBeVisible();
}

async function passwordStep(page: Page, email: string, password: string) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

let email = '';
test.afterEach(async () => {
  if (email !== '') await deleteMailsTo(email);
});

test('signs up with an emailed code, signs out, and signs in again, back where it started', async ({
  page,
}) => {
  email = e2eEmail('sign-up');
  await page.goto('/');
  // signed out: "Sign in" in the header, and no session call at all for an anonymous visit
  const asked: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/iam/me')) asked.push(request.url());
  });
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  await expectNoAxeViolations(page);
  await expectNoSideScroll(page);
  expect(asked).toEqual([]);

  await signUp(page, email);
  await expectNoAxeViolations(page);
  // a new page load keeps the session (one /iam/me, thanks to the hint)
  await page.reload();
  await expect(accountButton(page, email)).toBeVisible();
  // signed in, sign-in sends on to next
  await page.goto('/sign-in?next=%2Fprivacy');
  await expect(page).toHaveURL('/privacy');

  await signOut(page, email);
  await page.getByRole('link', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/sign-in?next=%2Fprivacy');
  await expectNoAxeViolations(page);
  await passwordStep(page, email, 'not the password at all');
  await expect(page.getByRole('alert')).toContainText('The email or password is not right.');
  await expectNoAxeViolations(page);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/privacy');
  await expect(accountButton(page, email)).toBeVisible();
});

test('sets a new password with an emailed code, which signs every device out', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-1280-light', 'one screen size is enough here');
  email = e2eEmail('password');
  await signUp(page, email);
  await page.goto('/forgot-password');
  await expectNoAxeViolations(page);
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Send code' }).click();
  // the second email to this address: sign-up's code was the first
  await page.getByLabel('Code from the email').fill(await codeFor(email, 2));
  await page.getByLabel('Password', { exact: true }).fill(NEW_PASSWORD);
  await page.getByRole('button', { name: 'Set password' }).click();
  await expect(page).toHaveURL('/sign-in');
  await expect(page.getByText('every device was signed out')).toBeVisible();
  // the email is filled in from the page's state, never from the URL
  await expect(page.getByLabel('Email')).toHaveValue(email);
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  await page.getByLabel('Password', { exact: true }).fill(NEW_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/');
  await expect(accountButton(page, email)).toBeVisible();
});

test('signs in with the authenticator, or a recovery code when the phone is lost', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-1280-light', 'one screen size is enough here');
  email = e2eEmail('authenticator');
  await signUp(page, email);
  // the authenticator from the account's settings (identity's routes; its screens come with
  // the account pages), through the same proxy and cookies as the page
  const headers = { 'X-BQ-App': 'customer' };
  const enroll = await page.request.post('/api/v1/auth/authenticator/enroll', { headers });
  expect(enroll.status()).toBe(200);
  const { secret } = ((await enroll.json()) as { data: { secret: string } }).data;
  const at = Date.now();
  const confirmed = await page.request.post('/api/v1/auth/authenticator/confirm', {
    headers,
    data: { code: totpCode(secret, at), password: PASSWORD },
  });
  expect(confirmed.status()).toBe(200);
  const { recoveryCodes } = ((await confirmed.json()) as { data: { recoveryCodes: string[] } })
    .data;

  await signOut(page, email);
  await page.goto('/sign-in');
  await passwordStep(page, email, PASSWORD);
  await expect(page.getByLabel('Authenticator code')).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByRole('button', { name: 'Lost your phone? Use a recovery code' }).click();
  await expectNoAxeViolations(page);
  await page.getByLabel(/Recovery code/).fill(recoveryCodes[0] ?? '');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL('/');
  await expect(accountButton(page, email)).toBeVisible();

  // and with the phone: the next code (the one at set-up never works again)
  await signOut(page, email);
  await page.goto('/sign-in');
  await passwordStep(page, email, PASSWORD);
  await page.getByLabel('Authenticator code').fill(totpCode(secret, at + 30_000));
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL('/');
  await expect(accountButton(page, email)).toBeVisible();
});
