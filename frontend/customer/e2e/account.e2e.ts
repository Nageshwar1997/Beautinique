// The customer app's account pages, end to end (ARCHITECTURE §9.2, owner 2026-11-03): Security
// (the authenticator set up from the QR page's key, recovery codes shown once, new codes after a
// step-up, turned off) and My Devices (another browser signed out from here).
import type { Page } from '@playwright/test';

import { expect, test, waitForAppAfterLoads } from '../../../scripts/e2e/app';
import { deleteMailsTo, e2eEmail } from '../../../scripts/e2e/mail';
import { totpCode } from '../../../scripts/e2e/totp';
import {
  accountButton,
  expectNoAxeViolations,
  expectNoSideScroll,
  PASSWORD,
  passwordStep,
  signUp,
} from './helpers';

let email = '';
test.afterEach(async () => {
  if (email !== '') await deleteMailsTo(email);
});

/** The recovery codes on screen, then "I've saved them" and Done (back to the security page). */
async function saveCodes(page: Page): Promise<string[]> {
  const codes = await page
    .getByRole('list', { name: 'Recovery codes' })
    .getByRole('listitem')
    .allTextContents();
  expect(codes).toHaveLength(10);
  await expectNoAxeViolations(page);
  await expectNoSideScroll(page);
  // the visible box sits over the hidden input, as React Aria draws it: the click lands on the box
  await page.getByRole('checkbox', { name: 'I’ve saved my recovery codes' }).check({ force: true });
  await page.getByRole('button', { name: 'Done' }).click();
  return codes;
}

test('the account pages, every size and theme', async ({ page }) => {
  email = e2eEmail('account-pages');
  await signUp(page, email, '/account/security');
  await expect(page.getByRole('heading', { level: 1, name: 'Security' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Authenticator app' })).toBeVisible();
  await expectNoAxeViolations(page);
  await expectNoSideScroll(page);

  // the account menu's link, through the app's router
  await accountButton(page, email).click();
  await page.getByRole('menuitem', { name: 'My Devices' }).click();
  await expect(page).toHaveURL('/account/devices');
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1, name: 'My Devices' })).toBeVisible();
  await expect(page.getByText('This device')).toBeVisible();
  await expectNoAxeViolations(page);
  await expectNoSideScroll(page);

  await page.getByRole('link', { name: 'Security' }).click();
  await page.getByRole('link', { name: 'Set up' }).click();
  await expect(page.getByRole('img', { name: /QR code/ })).toBeVisible();
  await expectNoAxeViolations(page);
  await expectNoSideScroll(page);
});

test('sets up the authenticator, gets new codes after a step-up, and turns it off', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-1280-light', 'one screen size is enough here');
  email = e2eEmail('account-authenticator');
  await signUp(page, email, '/account/security');
  await page.getByRole('link', { name: 'Set up' }).click();
  await expect(page).toHaveURL('/account/security/authenticator');

  // the key the page shows, typed into "the phone" (spaces only make it easier to read)
  const key = await page.getByText(/^([A-Z2-7]{4} )+[A-Z2-7]{1,4}$/).textContent();
  const secret = (key ?? '').replaceAll(' ', '');
  expect(secret.length).toBeGreaterThanOrEqual(16);
  await page.getByRole('button', { name: 'Next' }).click();
  const at = Date.now();
  await page.getByLabel('Authenticator code').fill(totpCode(secret, at));
  await page.getByLabel('Your password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Turn on' }).click();
  await expect(page.getByRole('heading', { name: 'Save your recovery codes' })).toBeVisible();
  await saveCodes(page);
  await expect(page).toHaveURL('/account/security');
  await expect(page.getByText('10 recovery codes of 10 left.')).toBeVisible();

  // new codes: the step-up dialog asks the next code (the set-up's code never works again)
  await page.getByRole('button', { name: 'Get new recovery codes' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Get new codes' }).click();
  const stepUp = page.getByRole('dialog', { name: 'Confirm it’s you' });
  await expect(stepUp).toBeVisible();
  await expectNoAxeViolations(page);
  await stepUp.getByLabel('Authenticator code').fill(totpCode(secret, at + 30_000));
  await stepUp.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Your new recovery codes' })).toBeVisible();
  await saveCodes(page);
  await expect(page.getByText('Your new recovery codes are ready to use.').first()).toBeVisible();

  // off: the step-up still counts (5 minutes), so no second dialog
  await page.getByRole('button', { name: 'Turn off' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Turn off' }).click();
  await expect(page.getByText('The authenticator is off.').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Set up' })).toBeVisible();
});

test('signs another browser out from My Devices', async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-1280-light', 'one screen size is enough here');
  email = e2eEmail('account-devices');
  await signUp(page, email, '/account/devices');
  await expect(page.getByText('This is the only device signed in to your account.')).toBeVisible();

  const other = await browser.newContext();
  const phone = waitForAppAfterLoads(await other.newPage());
  await phone.goto('/sign-in?next=%2Faccount%2Fsecurity');
  await passwordStep(phone, email, PASSWORD);
  await expect(phone).toHaveURL('/account/security');

  await page.reload();
  const devices = page.getByRole('list', { name: 'Devices' }).getByRole('listitem');
  await expect(devices).toHaveCount(2);
  // the other device's button: its name ends with the app (this one's with "(this device)")
  await page.getByRole('button', { name: /^Sign out .+, Beautinique$/ }).click();
  await expect(page.getByText(/is signed out\.$/).first()).toBeVisible();
  await expect(devices).toHaveCount(1);

  // the other browser's session is gone: its next page asks to sign in again
  await phone.reload();
  await expect(phone).toHaveURL('/sign-in?next=%2Faccount%2Fsecurity');
  await other.close();
});
