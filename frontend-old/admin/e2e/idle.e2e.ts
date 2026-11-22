// The internal apps' idle sign-out, end to end (ARCHITECTURE §9.2): the page's clock is moved
// (Playwright's clock), the server's is not; "Stay signed in" renews the real session.
import { expect, test } from '../../../scripts/e2e/app';
import { deleteMailsTo, e2eEmail } from '../../../scripts/e2e/mail';
import { expectNoAxeViolations, joinTeam } from './helpers';

let email = '';
test.afterEach(async () => {
  if (email !== '') await deleteMailsTo(email);
});

test('asks after 28 idle minutes, stays signed in, and signs out at 30 with why', async ({
  page,
}, testInfo) => {
  test.skip(
    !['chromium-1280-light', 'chromium-360-dark'].includes(testInfo.project.name),
    'a phone and a desk are enough here',
  );
  // the page's timers and Date, from the first load on; time flows as usual until moved
  await page.clock.install();
  email = e2eEmail('admin-idle');
  await joinTeam(page, email, { check: false });

  await page.clock.fastForward('28:05');
  const dialog = page.getByRole('alertdialog', { name: 'Are you still there?' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('For your security, you will be signed out at');
  await expectNoAxeViolations(page);
  const renewed = page.waitForResponse(
    (response) => response.url().endsWith('/api/v1/auth/refresh') && response.status() === 200,
  );
  await dialog.getByRole('button', { name: 'Stay signed in' }).click();
  await renewed;
  await expect(dialog).toBeHidden();

  // nobody does anything now: signed out at 30 minutes, and the sign-in page says why
  await page.clock.fastForward('30:05');
  await expect(
    page.getByText('You were signed out after 30 minutes without activity. Please sign in again.'),
  ).toBeVisible();
  await expect(page).toHaveURL('/sign-in');
  await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();
  // the session is gone on the server too
  const me = await page.request.get('/api/v1/iam/me', { headers: { 'X-BQ-App': 'admin' } });
  expect(me.status()).toBe(401);
});

test('with a second tab open, both tabs say why after the idle sign-out (QA-FE-010)', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-1280-light', 'one screen size is enough here');
  // one clock for every tab of the browser context
  await page.clock.install();
  email = e2eEmail('admin-idle-tabs');
  await joinTeam(page, email, { check: false });
  // the second tab opens a minute later: opening it is activity in both (Q-009), so both reach the
  // limit 30 minutes after that, and the first to see it tells the other
  await page.clock.fastForward('01:00');
  const other = await page.context().newPage();
  await other.goto('/');
  await expect(other.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();

  await page.clock.fastForward('30:10');
  const notice = 'You were signed out after 30 minutes without activity. Please sign in again.';
  for (const tab of [page, other]) {
    await expect(tab.getByText(notice)).toBeVisible();
    await expect(tab).toHaveURL('/sign-in');
  }
  // one sign-out on the server for both
  const me = await page.request.get('/api/v1/iam/me', { headers: { 'X-BQ-App': 'admin' } });
  expect(me.status()).toBe(401);
});

test('opening the app in a new tab keeps an idle tab signed in (Q-009)', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-1280-light', 'one screen size is enough here');
  await page.clock.install();
  email = e2eEmail('admin-idle-new-tab');
  await joinTeam(page, email, { check: false });
  // the first tab sits idle and asks; at 29 minutes the person opens the app in a new tab and reads
  await page.clock.fastForward('29:00');
  await expect(page.getByRole('alertdialog', { name: 'Are you still there?' })).toBeVisible();
  const other = await page.context().newPage();
  await other.goto('/');
  await expect(other.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  // the question closes, and 30 minutes from the start nobody is signed out
  await expect(page.getByRole('alertdialog')).toBeHidden();
  await page.clock.fastForward('01:30');
  for (const tab of [page, other]) {
    await expect(tab.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
    await expect(tab).toHaveURL('/');
  }
  const me = await page.request.get('/api/v1/iam/me', { headers: { 'X-BQ-App': 'admin' } });
  expect(me.status()).toBe(200);
});
