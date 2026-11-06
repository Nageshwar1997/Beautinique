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
