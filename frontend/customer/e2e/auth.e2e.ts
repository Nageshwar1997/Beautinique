// The customer app's sign-up and sign-in, end to end (ARCHITECTURE §9.2): the browser, the dev
// server's /api proxy, the gateway, identity, notify and Mailpit. Each test makes its own account.
import { expect, test } from '../../../scripts/e2e/app';
import { codeFor, deleteMailsTo, e2eEmail } from '../../../scripts/e2e/mail';
import { totpCode } from '../../../scripts/e2e/totp';
import {
  accountButton,
  expectNoAxeViolations,
  expectNoSideScroll,
  NEW_PASSWORD,
  PASSWORD,
  passwordStep,
  signOut,
  signUp,
} from './helpers';

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
  // the second email to this address: sign-up's code was the first. Put in as one insert, with
  // the space a copy from the email brings, as a paste is: every digit counts (QA-FE-003)
  const code = await codeFor(email, 2);
  const codeField = page.getByLabel('Code from the email');
  await codeField.focus();
  await page.keyboard.insertText(` ${code}`);
  await expect(codeField).toHaveValue(code);
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
  // each new step takes the focus (QA-FE-008)
  await expect(page.getByLabel('Authenticator code')).toBeFocused();
  await expectNoAxeViolations(page);
  await page.getByRole('button', { name: 'Lost your phone? Use a recovery code' }).click();
  await expect(page.getByLabel(/Recovery code/)).toBeFocused();
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

test('a sign-out the server never got keeps the person signed in, and "Try again" finishes it (QA-FE-004)', async ({
  page,
}, testInfo) => {
  test.skip(
    !['chromium-1280-light', 'chromium-360-dark'].includes(testInfo.project.name),
    'a phone and a desk are enough here',
  );
  email = e2eEmail('sign-out-offline');
  await signUp(page, email);
  const headers = { 'X-BQ-App': 'customer' };
  // the sign-out never reaches the server (offline, a proxy that drops it)
  await page.route('**/api/v1/auth/logout', (route) => route.abort('failed'));
  await accountButton(page, email).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  const toast = page
    .getByRole('region', { name: 'Notifications' })
    .getByRole('listitem')
    .filter({ hasText: 'You are still signed in.' });
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('We could not reach Beautinique.');
  await expectNoAxeViolations(page);
  await expectNoSideScroll(page);
  // what the page says is true: the header still offers the account, the session still works
  await expect(accountButton(page, email)).toBeVisible();
  expect((await page.request.get('/api/v1/iam/me', { headers })).status()).toBe(200);

  // the server is reachable again: "Try again" signs out, there and here
  await page.unroute('**/api/v1/auth/logout');
  await toast.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByText('You are signed out.').first()).toBeVisible();
  await expect(page.getByText('You are still signed in.')).toHaveCount(0);
  expect((await page.request.get('/api/v1/iam/me', { headers })).status()).toBe(401);
});

test('a keyboard sign-up: each step takes the focus and says what happened (QA-FE-008)', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-1280-light', 'one screen size is enough here');
  email = e2eEmail('sign-up-keyboard');
  await page.goto('/sign-up?next=%2Fcredits');
  await expect(page.getByRole('heading', { level: 1, name: 'Create an account' })).toBeVisible();
  await page.getByLabel('Email').focus();
  await page.keyboard.type(email);
  // the boxes, then the button, from the keyboard (Space ticks, Enter sends)
  await page.getByRole('checkbox', { name: /I accept the/ }).focus();
  await page.keyboard.press('Space');
  await page.getByRole('checkbox', { name: 'I am 18 or older' }).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Send code' }).focus();
  await page.keyboard.press('Enter');

  // the code field has the focus, and a screen reader hears where the code went
  const code = page.getByLabel('Code from the email');
  await expect(code).toBeFocused();
  await expect(code).toHaveAccessibleDescription(new RegExp(`^We sent a 6-digit code to ${email}`));
  await expectNoAxeViolations(page);
  await page.keyboard.type(await codeFor(email));
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Password', { exact: true })).toBeFocused();
  await page.keyboard.type(PASSWORD);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/credits');
  await expect(accountButton(page, email)).toBeVisible();
});

test('the consent’s links open the terms and the privacy notice in a new tab, and leave the box alone', async ({
  page,
}, testInfo) => {
  test.skip(
    !['chromium-1280-light', 'chromium-360-dark'].includes(testInfo.project.name),
    'a phone and a desk are enough here',
  );
  await page.goto('/sign-up');
  await expect(page.getByRole('heading', { level: 1, name: 'Create an account' })).toBeVisible();
  const box = page.getByRole('checkbox', { name: /I accept the/ });
  for (const [name, path] of [
    ['terms of use', '/terms'],
    ['privacy notice', '/privacy'],
  ] as const) {
    const opened = page.waitForEvent('popup');
    // the form's link (the footer has its own)
    await page.getByRole('main').getByRole('link', { name, exact: true }).click();
    const tab = await opened;
    await tab.waitForLoadState();
    expect(new URL(tab.url()).pathname).toBe(path);
    await tab.close();
    await expect(box).not.toBeChecked();
  }
  // the words around them still tick it
  // (its first words, top left: the middle of the label is a link)
  await page.getByText('I accept the').click({ position: { x: 4, y: 6 } });
  await expect(box).toBeChecked();
});

test('a next that resolves to another site goes home, signed in or not, with no error page (QA-FE-001)', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-1280-light', 'one screen size is enough here');
  email = e2eEmail('next-dot-segments');
  await signUp(page, email);
  // /..//evil.example resolves to //evil.example: another site, so home instead
  const crafted = `/sign-in?next=${encodeURIComponent('/..//evil.example')}`;
  // signed in: the sign-in page sends straight on
  await page.goto(crafted);
  await expect(page).toHaveURL('/');
  await expect(accountButton(page, email)).toBeVisible();
  // signed out: after the password
  await signOut(page, email);
  await page.goto(crafted);
  await passwordStep(page, email, PASSWORD);
  await expect(page).toHaveURL('/');
  await expect(accountButton(page, email)).toBeVisible();
});

test('a proxy’s 502 page reads as words for people, not "Request failed" (QA-FE-007)', async ({
  page,
}, testInfo) => {
  test.skip(
    !['chromium-1280-light', 'chromium-360-dark'].includes(testInfo.project.name),
    'a phone and a desk are enough here',
  );
  email = e2eEmail('proxy-502');
  await signUp(page, email);
  // the host's edge answers for a server it could not reach: its own page, not ours
  await page.route('**/api/v1/auth/logout', (route) =>
    route.fulfill({
      status: 502,
      contentType: 'text/html',
      body: '<html><body>Bad gateway</body></html>',
    }),
  );
  await accountButton(page, email).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  const toast = page
    .getByRole('region', { name: 'Notifications' })
    .getByRole('listitem')
    .filter({ hasText: 'You are still signed in.' });
  await expect(toast).toContainText('The server did not answer. Please try again in a moment.');
  await expect(page.getByText(/Request failed with status/)).toHaveCount(0);
});

test('every page open to the signed-out fits a phone’s screen', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('chromium-360'), 'only a phone is that narrow');
  for (const path of [
    '/',
    '/credits',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/invitation',
    '/terms',
    '/privacy',
    '/no-such-page',
  ]) {
    await page.goto(path);
    await expect(page.getByRole('banner')).toBeVisible();
    await expectNoSideScroll(page);
  }
});
