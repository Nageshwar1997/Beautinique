// Social sign-in in the customer app (TASKS T3.1 PR 4), end to end: the browser, the dev server's
// /api proxy, the gateway's navigation routes, identity, notify and Mailpit, and the stand-in
// Google, LinkedIn and GitHub (scripts/e2e/fake-oauth.ts), never the real ones.
import type { Page } from '@playwright/test';

import { appReady, expect, test } from '../../../scripts/e2e/app';
import type { FakePerson, FakeProvider } from '../../../scripts/e2e/fake-oauth';
import { deleteMailsTo, e2eEmail, mailsTo } from '../../../scripts/e2e/mail';
import {
  accountButton,
  expectNoAxeViolations,
  expectNoSideScroll,
  PASSWORD,
  passwordStep,
  signOut,
  signUp,
} from './helpers';

const FAKE_URL = `http://127.0.0.1:${process.env.BQ_E2E_OAUTH_PORT ?? '8096'}`;

/** Who signs in at `provider` next (or a cancel there). */
async function atProviderNext(provider: FakeProvider, person: FakePerson | 'cancel') {
  const answer = await fetch(`${FAKE_URL}/fake/next`, {
    method: 'POST',
    body: JSON.stringify({ provider, person }),
  });
  expect(answer.status).toBe(200);
}

/** A provider's own id for a new person of this run. */
const subject = () => String(Date.now() + Math.floor(Math.random() * 1000));

/** "Continue with …" on the sign-in page, and the round trip it starts. */
async function continueWith(page: Page, name: string, next?: string) {
  await page.goto(next === undefined ? '/sign-in' : `/sign-in?next=${encodeURIComponent(next)}`);
  await page.getByRole('link', { name: `Continue with ${name}` }).click();
}

let email = '';
test.afterEach(async () => {
  if (email !== '') await deleteMailsTo(email);
});

test('signs up with Google: the consent, then signed in; the next time straight in', async ({
  page,
}) => {
  email = e2eEmail('social-new');
  const person = { subject: subject(), email };
  await atProviderNext('google', person);
  await page.goto('/sign-in?next=%2Fcredits');
  await expect(page.getByRole('link', { name: 'Continue with Google' })).toBeVisible();
  await expectNoAxeViolations(page);
  await expectNoSideScroll(page);
  await page.getByRole('link', { name: 'Continue with Google' }).click();

  // a new account: its consent first
  await expect(page).toHaveURL('/sign-up/finish?next=%2Fcredits');
  // back from the provider is a new page load: wait for the app before the forced clicks below
  await appReady(page);
  await expect(page.getByRole('heading', { level: 1, name: 'Finish signing up' })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expectNoAxeViolations(page);
  await expectNoSideScroll(page);
  // the visible box sits over the hidden input, as React Aria draws it: the click lands on the box
  await page.getByRole('checkbox', { name: /I accept the/ }).check({ force: true });
  await page.getByRole('checkbox', { name: 'I am 18 or older' }).check({ force: true });
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL('/credits');
  await expect(accountButton(page, email)).toBeVisible();

  await signOut(page, email);
  await atProviderNext('google', person);
  await continueWith(page, 'Google');
  await expect(page).toHaveURL('/');
  await expect(accountButton(page, email)).toBeVisible();
});

test('links GitHub to an account made with email, emails it, and takes it off in Security', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-1280-light', 'one screen size is enough here');
  email = e2eEmail('social-link');
  await signUp(page, email, '/');
  await signOut(page, email);
  await atProviderNext('github', { subject: subject(), email });
  await continueWith(page, 'GitHub', '/account/security');
  await expect(page).toHaveURL('/account/security');
  await expect(accountButton(page, email)).toBeVisible();
  // the account's email hears of it (the code email came first)
  const mails = await mailsTo(email, 2);
  expect(mails.map((mail) => mail.Subject)).toContain(
    'GitHub sign-in was added to your Beautinique account',
  );

  const methods = page.getByRole('region', { name: 'Sign-in methods' });
  await expect(methods.getByText('Connected', { exact: true })).toBeVisible();
  await expectNoAxeViolations(page);
  await methods.getByRole('button', { name: 'Remove GitHub sign-in' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Remove GitHub sign-in?' });
  await expectNoAxeViolations(page);
  await dialog.getByRole('button', { name: 'Remove' }).click();
  // a GitHub sign-in is not proof enough to take a way in off (QA DR-006): sign in again first
  await expect(
    dialog.getByText('For your security, please sign in again with your password, then remove it.'),
  ).toBeVisible();
  await expectNoAxeViolations(page);
  await dialog.getByRole('button', { name: 'Sign in again' }).click();
  await expect(page).toHaveURL('/sign-in?next=%2Faccount%2Fsecurity');
  await passwordStep(page, email, PASSWORD);
  await expect(page).toHaveURL('/account/security');
  await methods.getByRole('button', { name: 'Remove GitHub sign-in' }).click();
  await dialog.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('GitHub sign-in was removed.').first()).toBeVisible();
  await expect(methods.getByText('Not connected')).toHaveCount(3);
});

test('comes back to sign-in, saying why, when the person cancels at the provider', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-1280-light', 'one screen size is enough here');
  email = '';
  await atProviderNext('linkedin', 'cancel');
  await continueWith(page, 'LinkedIn');
  await expect(page).toHaveURL('/sign-in?oauth=cancelled');
  await expect(page.getByText('Signing in was cancelled.')).toBeVisible();
  await expectNoAxeViolations(page);
});
