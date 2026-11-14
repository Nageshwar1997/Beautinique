// The Master app's Staff pages, end to end (TASKS T3.7): a Master invites someone to a role and
// takes it back, gives a role to someone on the staff and ends it, through the real backend.
import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { expect, test } from '../../../scripts/e2e/app';
import { deleteMailsTo, e2eEmail } from '../../../scripts/e2e/mail';
import { totpCode } from '../../../scripts/e2e/totp';
import {
  expectNoAxeViolations,
  expectNoSideScroll,
  joinTeam,
  passwordStep,
  signOut,
} from './helpers';
import { ADMIN_PORT } from './ports';

const REPO = join(import.meta.dirname, '..', '..', '..');
const staff = (...args: string[]) =>
  promisify(execFile)(
    process.execPath,
    ['--conditions=beautinique-source', 'scripts/e2e/staff.ts', ...args],
    { cwd: REPO, env: process.env },
  );

const emails: string[] = [];
test.afterEach(async () => {
  for (const email of emails.splice(0)) await deleteMailsTo(email);
});

test('a Master invites and takes back, gives a role and ends it', async ({ page }) => {
  const email = e2eEmail('master-staff');
  const invitee = e2eEmail('staff-invitee');
  const agent = e2eEmail('staff-agent');
  emails.push(email, invitee, agent);
  const { secret, at } = await joinTeam(page, email, { check: false });
  // a Head of Operations: nothing to manage here yet, and no Staff in the nav
  await expect(page.getByText('There is nothing to manage here for your role yet.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Staff' })).toHaveCount(0);

  // given the Master seat (db:grant-master), signed in again: the Staff sections open
  await staff('master', email);
  await staff('hold', agent, 'support.l1_agent');
  await signOut(page, email);
  await passwordStep(page, email);
  await page.getByLabel('Authenticator code').fill(totpCode(secret, at + 30_000));
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('link', { name: /^People/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'People' })).toBeVisible();
  await expectNoAxeViolations(page);
  await expectNoSideScroll(page);

  // invite someone to a role, then take it back (the sign-in a moment ago counts as the step-up)
  await page.getByRole('button', { name: 'Invite someone' }).click();
  const form = page.getByRole('dialog', { name: 'Invite someone' });
  await form.getByLabel('Email').fill(invitee);
  await form.getByRole('button', { name: /App/ }).click();
  await page.getByRole('option', { name: 'Support Desk' }).click();
  await form.getByRole('button', { name: /Role/ }).click();
  await page.getByRole('option', { name: /Customer Support Agent \(L1\)/ }).click();
  await expectNoAxeViolations(page);
  await form.getByRole('button', { name: 'Send invitation' }).click();
  await expect(page.getByText(`Invitation sent to ${invitee}.`).first()).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Staff' })
    .getByRole('link', { name: 'Invitations' })
    .click();
  // a table row on a laptop, a card on a phone
  const row = page.locator('main').locator('tr, li').filter({ hasText: invitee });
  await expect(row.getByText('Pending', { exact: true })).toBeVisible();
  await expectNoAxeViolations(page);
  await row.getByRole('button', { name: `Take back the invitation of ${invitee}` }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Take back' }).click();
  await expect(row.getByText('Taken back', { exact: true })).toBeVisible();

  // someone on the staff: found by email, given another role, then that role ended
  await page
    .getByRole('navigation', { name: 'Staff' })
    .getByRole('link', { name: 'People' })
    .click();
  await page.getByLabel('Email').fill(agent);
  await page.getByLabel('Email').press('Enter');
  await expect(page).toHaveURL(new RegExp(`email=${encodeURIComponent(agent)}`));
  await page
    .getByRole('button', { name: new RegExp(`^${agent}, `) })
    .first()
    .click();
  const panel = page.getByRole('dialog', { name: agent });
  await expect(panel.getByText('Customer Support Agent (L1)')).toBeVisible();
  await expectNoAxeViolations(page);
  await panel.getByRole('button', { name: 'Give another role' }).click();
  const give = page.getByRole('dialog', { name: 'Give a role' });
  await give.getByRole('button', { name: /App/ }).click();
  await page.getByRole('option', { name: 'Support Desk' }).click();
  await give.getByRole('button', { name: /Role/ }).click();
  await page.getByRole('option', { name: /Support Lead/ }).click();
  await give.getByRole('button', { name: 'Give role' }).click();
  await expect(page.getByText(`Support Lead given to ${agent}.`).first()).toBeVisible();
  await expect(panel.getByText('Support Lead')).toBeVisible();
  await panel.getByRole('button', { name: `End Support Lead for ${agent}` }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'End role' }).click();
  await expect(page.getByText(`Support Lead ended for ${agent}.`).first()).toBeVisible();
  await expect(panel.getByText('Support Lead')).toHaveCount(0);
  // closed by its own button (Escape goes where the focus is, a toast too)
  await panel.getByRole('button', { name: 'Close' }).click();
  await expect(panel).toBeHidden();

  // Roles: a shipped role reads only; Master makes a sub-role, retires it and brings it back
  await page
    .getByRole('navigation', { name: 'Staff' })
    .getByRole('link', { name: 'Roles' })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: 'Roles' })).toBeVisible();
  await expectNoAxeViolations(page);
  await expectNoSideScroll(page);
  await page.getByRole('button', { name: 'State Admin', exact: true }).click();
  const shipped = page.getByRole('dialog', { name: 'State Admin' });
  await expect(shipped.getByText('Give roles, invite people to them and end them')).toBeVisible();
  await expect(shipped.getByRole('button', { name: 'Change' })).toHaveCount(0);
  await shipped.getByRole('button', { name: 'Close' }).click();
  await expect(shipped).toBeHidden();
  const slug = `e2e_${Date.now().toString(36)}`;
  await page.getByRole('button', { name: 'New sub-role' }).click();
  const editor = page.getByRole('dialog', { name: 'New sub-role' });
  await editor.getByRole('button', { name: /App/ }).click();
  await page.getByRole('option', { name: 'Support Desk' }).click();
  await editor.getByLabel('Key name').fill(slug);
  await editor.getByLabel('Name', { exact: true }).fill(`Night Desk ${slug}`);
  await expectNoAxeViolations(page);
  await editor.getByRole('button', { name: 'Make sub-role' }).click();
  await expect(
    page.getByText(`Night Desk ${slug} is made (support.c_${slug}).`).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: `Night Desk ${slug}`, exact: true }).click();
  const made = page.getByRole('dialog', { name: `Night Desk ${slug}` });
  await made.getByRole('button', { name: 'Retire' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Retire' }).click();
  await expect(page.getByText(`Night Desk ${slug} is retired.`).first()).toBeVisible();
  await made.getByRole('button', { name: 'Bring back' }).click();
  await expect(page.getByText(`Night Desk ${slug} is in use again.`).first()).toBeVisible();
});

test('an invitation from the Staff pages is accepted in the admin app; ending the role signs them out there', async ({
  page,
  browser,
}, testInfo) => {
  // two apps and two people: one size is enough for the path between them
  test.skip(
    testInfo.project.name !== 'chromium-1280-light',
    'the cross-app path runs at 1280 light',
  );
  const email = e2eEmail('master-cross');
  const invitee = e2eEmail('admin-invitee');
  emails.push(email, invitee);
  const { secret, at } = await joinTeam(page, email, { check: false });
  await staff('master', email);
  await signOut(page, email);
  await passwordStep(page, email);
  await page.getByLabel('Authenticator code').fill(totpCode(secret, at + 30_000));
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('link', { name: /^Invitations/ }).click();

  // Master invites them to an admin role, from the Staff pages
  await page.getByRole('button', { name: 'Invite someone' }).click();
  const form = page.getByRole('dialog', { name: 'Invite someone' });
  await form.getByLabel('Email').fill(invitee);
  await form.getByRole('button', { name: /App/ }).click();
  await page.getByRole('option', { name: 'Admin', exact: true }).click();
  await form.getByRole('button', { name: /Role/ }).click();
  await page.getByRole('option', { name: /Fraud & Risk Analyst/ }).click();
  await form.getByRole('button', { name: 'Send invitation' }).click();
  await expect(page.getByText(`Invitation sent to ${invitee}.`).first()).toBeVisible();

  // they accept it in the admin app, set up the authenticator and land on its dashboard
  const adminContext = await browser.newContext({
    baseURL: `http://localhost:${String(ADMIN_PORT)}`,
  });
  const admin = await adminContext.newPage();
  try {
    await joinTeam(admin, invitee, { check: false, invited: true, home: 'Dashboard' });
    await page.reload();
    const row = page.locator('main').locator('tr, li').filter({ hasText: invitee });
    await expect(row.getByText('Accepted', { exact: true })).toBeVisible();

    // Master ends the role: their next call in the admin app finds them signed out
    await page
      .getByRole('navigation', { name: 'Staff' })
      .getByRole('link', { name: 'People' })
      .click();
    await page.getByLabel('Email').fill(invitee);
    await page.getByLabel('Email').press('Enter');
    await page.getByRole('button', { name: new RegExp(`^${invitee}, Fraud`) }).click();
    const panel = page.getByRole('dialog', { name: invitee });
    await panel.getByRole('button', { name: `End Fraud & Risk Analyst for ${invitee}` }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'End role' }).click();
    await expect(
      page.getByText(`Fraud & Risk Analyst ended for ${invitee}.`).first(),
    ).toBeVisible();
    await admin.reload();
    await expect(admin.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();
  } finally {
    await adminContext.close();
  }
});
