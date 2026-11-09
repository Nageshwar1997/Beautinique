// The admin app's sign-in, end to end (ARCHITECTURE §9.2): the browser, the dev server's /api
// proxy, the gateway, identity, notify and Mailpit. Each test invites its own person.
import { expect, test } from '../../../scripts/e2e/app';
import { deleteMailsTo, e2eEmail } from '../../../scripts/e2e/mail';
import { totpCode } from '../../../scripts/e2e/totp';
import {
  accountButton,
  expectNoAxeViolations,
  expectNoSideScroll,
  joinTeam,
  passwordStep,
  signOut,
} from './helpers';

let email = '';
test.afterEach(async () => {
  if (email !== '') await deleteMailsTo(email);
});

test('joins the team: the invitation, the authenticator at the first sign-in, then signs in with it', async ({
  page,
}) => {
  email = e2eEmail('admin-join');
  const { secret, at } = await joinTeam(page, email);

  // the account's pages, from the menu
  await accountButton(page, email).click();
  await page.getByRole('menuitem', { name: 'Security' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Security' })).toBeVisible();
  await expectNoAxeViolations(page);
  await expectNoSideScroll(page);
  await page.getByRole('link', { name: 'My Devices' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'My Devices' })).toBeVisible();
  await expectNoAxeViolations(page);

  // signed out, then in again: the password, then the authenticator's next code (the first
  // one never works again), back to the page that asked
  await signOut(page, email);
  await page.goto('/account/devices');
  await expect(page).toHaveURL('/sign-in?next=%2Faccount%2Fdevices');
  await passwordStep(page, email);
  await expect(page.getByLabel('Authenticator code')).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByLabel('Authenticator code').fill(totpCode(secret, at + 30_000));
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL('/account/devices');
  await expect(accountButton(page, email)).toBeVisible();
});

test('signs in with a recovery code when the phone is lost', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-1280-light', 'one screen size is enough here');
  email = e2eEmail('admin-recovery');
  const { recoveryCodes } = await joinTeam(page, email, { check: false });
  await signOut(page, email);
  await passwordStep(page, email);
  await page.getByRole('button', { name: 'Lost your phone? Use a recovery code' }).click();
  await page.getByLabel(/Recovery code/).fill(recoveryCodes[0] ?? '');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL('/');
  await expect(accountButton(page, email)).toBeVisible();
});

test('every page open to the signed-out fits a phone’s screen (QA-ADM-001)', async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('chromium-360'), 'only a phone is that narrow');
  for (const path of ['/sign-in', '/forgot-password', '/invitation', '/credits', '/no-such-page']) {
    await page.goto(path);
    await expect(page.getByRole('link', { name: 'Beautinique Admin home' })).toBeVisible();
    await expectNoSideScroll(page);
  }
});
