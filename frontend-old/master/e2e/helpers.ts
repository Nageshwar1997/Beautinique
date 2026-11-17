// What the Master app E2E specs share: the password, an invitation (scripts/e2e/invite.ts, as a Master
// sends one), joining the team through the app's pages, and the account control.
import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { expect, type Page } from '@playwright/test';

import { expectNoAxeViolations, expectNoSideScroll } from '../../../scripts/e2e/checks';
import { codeFor, mailsTo } from '../../../scripts/e2e/mail';
import { totpCode } from '../../../scripts/e2e/totp';

export { expectNoAxeViolations, expectNoSideScroll };

export const PASSWORD = 'pink lipstick on a rainy day';

const REPO = join(import.meta.dirname, '..', '..', '..');

/** An invitation to a role in the Master app for `email`, emailed by notify as a live one is. */
export async function invite(email: string, role = 'master.head_of_operations'): Promise<void> {
  await promisify(execFile)(
    process.execPath,
    ['--conditions=beautinique-source', 'scripts/e2e/invite.ts', email, role],
    { cwd: REPO, env: process.env },
  );
}

/** The header's account control, once the session is known. */
export const accountButton = (page: Page, email: string) =>
  page.getByRole('button', { name: `Account (${email})` });

export async function passwordStep(page: Page, email: string, password = PASSWORD) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

/** What joining left: the authenticator's key, when its first code was used, the recovery codes. */
export interface Joined {
  secret: string;
  at: number;
  recoveryCodes: string[];
}

/**
 * Joins the team as a new person: the invitation's email, the invitation page (the emailed code and
 * a password), then the first sign-in, which sets up the authenticator (the QR page's key, the first
 * code, the recovery codes) and lands on the home page. `check` runs axe on each screen.
 */
export async function joinTeam(
  page: Page,
  email: string,
  {
    check = true,
    invited = false,
    home = 'Beautinique Master',
  }: { check?: boolean; invited?: boolean; home?: string } = {},
): Promise<Joined> {
  const look = async () => {
    if (!check) return;
    await expectNoAxeViolations(page);
    await expectNoSideScroll(page);
  };
  if (!invited) await invite(email);
  const [invitation] = await mailsTo(email);
  expect(invitation?.Subject).toMatch(/invit/i);

  // the app is the team's only: signed out, every page is the sign-in
  await page.goto('/');
  await expect(page).toHaveURL('/sign-in');
  await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();
  await look();
  await page.getByRole('link', { name: 'Accept your invitation' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Accept an invitation' })).toBeVisible();
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Send code' }).click();
  await expect(page.getByText(`We sent a 6-digit code to ${email}`)).toBeVisible();
  await look();
  // the second email: the invitation came first
  await page.getByLabel('Code from the email').fill(await codeFor(email, 2));
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Accept invitation' }).click();

  // back on sign-in with the email filled in and why
  await expect(page.getByText('Invitation accepted. Sign in to start.')).toBeVisible();
  await expect(page.getByLabel('Email')).toHaveValue(email);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // the authenticator this app needs: 1. the key (as an authenticator app would scan it)
  await expect(page.getByText('Step 1 of 3')).toBeVisible();
  // each step takes the focus: its heading where it has no field (QA-FE-008)
  await expect(
    page.getByRole('heading', { name: 'Add Beautinique to your authenticator app' }),
  ).toBeFocused();
  await expect(
    page.getByRole('img', { name: 'QR code to add Beautinique to your authenticator app' }),
  ).toBeVisible();
  await look();
  const secret = ((await page.locator('code').first().textContent()) ?? '').replace(/\s/g, '');
  expect(secret).toMatch(/^[A-Z2-7]{16,}$/);
  await page.getByRole('button', { name: 'Next' }).click();
  // 2. its first code
  await expect(page.getByLabel('Authenticator code')).toBeFocused();
  const at = Date.now();
  await page.getByLabel('Authenticator code').fill(totpCode(secret, at));
  await page.getByRole('button', { name: 'Turn on' }).click();
  // 3. the recovery codes, before anything else
  const codes = page.getByRole('list', { name: 'Recovery codes' }).getByRole('listitem');
  await expect(codes).toHaveCount(10);
  await expect(page.getByRole('heading', { name: 'Save your recovery codes' })).toBeFocused();
  await look();
  const recoveryCodes = await codes.allTextContents();
  await expect(page).toHaveURL('/sign-in');
  // the visible box sits over the hidden input, as React Aria draws it: the click lands on the box
  await page.getByRole('checkbox', { name: 'I’ve saved my recovery codes' }).check({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1, name: home })).toBeVisible();
  if (home === 'Beautinique Master')
    await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
  await expect(accountButton(page, email)).toBeVisible();
  await look();
  return { secret, at, recoveryCodes };
}

export async function signOut(page: Page, email: string) {
  await accountButton(page, email).click();
  await expect(page.getByRole('menu')).toContainText(email);
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();
  // the toast (its live region repeats the text for screen readers)
  await expect(page.getByText('You are signed out.').first()).toBeVisible();
}
