// What the E2E specs share: the password, axe and side-scroll checks (scripts/e2e/checks.ts, every
// app's), and signing up, out and in through the customer app's pages.
import { expect, type Page } from '@playwright/test';

import { expectNoAxeViolations, expectNoSideScroll } from '../../../scripts/e2e/checks';
import { codeFor } from '../../../scripts/e2e/mail';

export { expectNoAxeViolations, expectNoSideScroll };

export const PASSWORD = 'pink lipstick on a rainy day';
export const NEW_PASSWORD = 'rose gold eyeliner at midnight';

/** The header's account control, once the session is known. */
export const accountButton = (page: Page, email: string) =>
  page.getByRole('button', { name: `Account (${email})` });

export async function signUp(page: Page, email: string, next = '/credits') {
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

export async function signOut(page: Page, email: string) {
  await accountButton(page, email).click();
  await expect(page.getByRole('menu')).toContainText(email);
  await expectNoAxeViolations(page);
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  // the toast (its live region repeats the text for screen readers)
  await expect(page.getByText('You are signed out.').first()).toBeVisible();
}

export async function passwordStep(page: Page, email: string, password: string) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}
