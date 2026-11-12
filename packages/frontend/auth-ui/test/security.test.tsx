import { isApiError, useApiClient } from '@beautinique/frontend-api-client';
import { newRecoveryCodes } from '@beautinique/shared-contracts';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ACCOUNT_PATHS,
  AuthenticatorSetup,
  ForgotPasswordForm,
  RECOVERY_CODES_FILE,
  RecoveryCodes,
  recoveryCodesText,
  SecuritySettings,
} from '../src/index';
import { expectNoAxeViolations } from './axe';
import {
  dropHint,
  EMAIL,
  failure,
  fakeIdentity,
  GOOD_CODE,
  OTP_URI,
  PASSWORD,
  RECOVERY_CODES,
  setHint,
} from './fake-identity';
import { renderApp, where } from './render';

afterEach(() => {
  cleanup();
  dropHint('customer');
  vi.restoreAllMocks();
});

type User = ReturnType<typeof userEvent.setup>;

/** The set-up page of an app: back to the security page once the codes are saved. */
function SetupPage() {
  const navigate = useNavigate();
  return <AuthenticatorSetup onDone={() => void navigate(ACCOUNT_PATHS.security)} />;
}

const pages = {
  [ACCOUNT_PATHS.security]: <SecuritySettings />,
  [ACCOUNT_PATHS.authenticator]: <SetupPage />,
  '/forgot-password': <ForgotPasswordForm />,
};

function signedIn({ authenticator = false } = {}) {
  setHint('customer');
  return fakeIdentity('customer', { signedIn: true, authenticator });
}

/** The step-up dialog is open: answer it with `code` (an authenticator code). */
async function stepUpWith(user: User, code: string) {
  const dialog = await screen.findByRole('dialog', { name: 'Confirm it’s you' });
  await user.type(within(dialog).getByLabelText('Authenticator code'), code);
  await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
  return dialog;
}

async function tickAndFinish(user: User, done = 'Done') {
  await user.click(screen.getByRole('checkbox', { name: 'I’ve saved my recovery codes' }));
  await user.click(screen.getByRole('button', { name: done }));
}

describe('SecuritySettings', () => {
  it('shows the password and an authenticator that is off, with where to set it up', async () => {
    const identity = signedIn();
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.security });
    expect(await screen.findByRole('heading', { name: 'Authenticator app' })).toBeTruthy();
    expect(screen.getByText('Off')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Set up' }).getAttribute('href')).toBe(
      ACCOUNT_PATHS.authenticator,
    );
    await expectNoAxeViolations();
    // the password: the emailed-code page, with the email filled in (never in the URL)
    await user.click(screen.getByRole('link', { name: 'Change password' }));
    expect(where()).toBe('/forgot-password?next=%2Faccount%2Fsecurity');
    expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe(EMAIL);
  });

  it('gets new recovery codes after a step-up: a wrong code first, then the right one', async () => {
    const identity = signedIn({ authenticator: true });
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.security });
    expect(await screen.findByText('10 recovery codes of 10 left.')).toBeTruthy();
    expect(screen.getByText('On')).toBeTruthy();
    await expectNoAxeViolations();

    await user.click(screen.getByRole('button', { name: 'Get new recovery codes' }));
    const ask = screen.getByRole('alertdialog', { name: 'Get new recovery codes?' });
    await user.click(within(ask).getByRole('button', { name: 'Get new codes' }));
    const dialog = await stepUpWith(user, '000000');
    expect(await within(dialog).findByText('That authenticator code is not right.')).toBeTruthy();
    await expectNoAxeViolations();
    await user.clear(within(dialog).getByLabelText('Authenticator code'));
    await stepUpWith(user, GOOD_CODE);

    // the call went again after the step-up, and the codes show once
    expect(await screen.findByRole('heading', { name: 'Your new recovery codes' })).toBe(
      document.activeElement,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    const list = screen.getByRole('list', { name: 'Recovery codes' });
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(RECOVERY_CODES);
    expect(identity.paths().filter((path) => path !== 'GET /iam/me')).toEqual([
      'POST /auth/authenticator/recovery-codes',
      'POST /auth/step-up',
      'POST /auth/step-up',
      'POST /auth/authenticator/recovery-codes',
    ]);
    await expectNoAxeViolations();

    // not on without the tick
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByText('Tick this once your codes are saved.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('checkbox'));
    await tickAndFinish(user);
    expect(await screen.findByText('Your new recovery codes are ready to use.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Authenticator app' })).toBe(document.activeElement);
  });

  it('turns the authenticator off with a recovery code (a lost phone)', async () => {
    const identity = signedIn({ authenticator: true });
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.security });
    await user.click(await screen.findByRole('button', { name: 'Turn off' }));
    const ask = screen.getByRole('alertdialog', { name: 'Turn off the authenticator?' });
    await user.click(within(ask).getByRole('button', { name: 'Turn off' }));
    const dialog = await screen.findByRole('dialog', { name: 'Confirm it’s you' });
    await user.click(
      within(dialog).getByRole('button', { name: 'Lost your phone? Use a recovery code' }),
    );
    await user.type(within(dialog).getByLabelText('Recovery code'), 'abcde-fgh23');
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('The authenticator is off.')).toBeTruthy();
    // the code is for turning it off alone (QA DR-010)
    expect(identity.sent.find((sent) => sent.path === '/auth/step-up')?.body).toEqual({
      recoveryCode: 'ABCDE-FGH23',
      for: 'authenticator.disable',
    });
    expect(await screen.findByText('Off')).toBeTruthy();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('says nothing when the step-up is cancelled', async () => {
    const identity = signedIn({ authenticator: true });
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.security });
    await user.click(await screen.findByRole('button', { name: 'Turn off' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Turn off' }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Confirm it’s you' });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('On')).toBeTruthy();
    expect(identity.paths().filter((path) => path === 'DELETE /auth/authenticator')).toHaveLength(
      1,
    );
  });

  it('names the roles that need the authenticator when it cannot be turned off', async () => {
    const identity = signedIn({ authenticator: true });
    const message =
      'Your Seller Account Owner role in the seller app needs an authenticator, so it can’t be turned off.';
    identity.on('DELETE /auth/authenticator', () =>
      failure(409, 'AUTHENTICATOR_REQUIRED_BY_ROLE', message, [
        { path: ['roles', 'seller'], message: 'Seller Account Owner' },
      ]),
    );
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.security });
    await user.click(await screen.findByRole('button', { name: 'Turn off' }));
    const ask = screen.getByRole('alertdialog');
    await user.click(within(ask).getByRole('button', { name: 'Turn off' }));
    expect((await within(ask).findByRole('alert')).textContent).toBe(message);
    await expectNoAxeViolations();
  });
});

describe('AuthenticatorSetup', () => {
  it('sets one up: the QR code and the key, the code and the password, the codes', async () => {
    const identity = signedIn();
    const user = userEvent.setup();
    // StrictMode runs the effect twice: still one key asked for
    renderApp(pages, { identity, at: ACCOUNT_PATHS.authenticator, strict: true });
    const qr = await screen.findByRole('img', {
      name: 'QR code to add Beautinique to your authenticator app',
    });
    expect(qr.tagName.toLowerCase()).toBe('svg');
    expect(screen.getByText('JBSW Y3DP EHPK 3PXP JBSW Y3DP EHPK 3PXP')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Open in your authenticator app' }).getAttribute('href'),
    ).toBe(OTP_URI);
    expect(identity.paths().filter((path) => path.includes('enroll'))).toHaveLength(1);
    await expectNoAxeViolations();

    await user.click(screen.getByRole('button', { name: 'Copy key' }));
    expect(await navigator.clipboard.readText()).toBe('JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP');

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Enter the code from the app' })).toBeTruthy();
    identity.on('POST /auth/authenticator/confirm', () =>
      failure(400, 'PASSWORD_INVALID', 'That password is not right.'),
    );
    await user.type(screen.getByLabelText('Authenticator code'), GOOD_CODE);
    await user.type(screen.getByLabelText('Your password'), 'not my password at all');
    await user.click(screen.getByRole('button', { name: 'Turn on' }));
    expect(await screen.findByText('That password is not right.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Your password'));
    await expectNoAxeViolations();

    identity.off('POST /auth/authenticator/confirm');
    await user.clear(screen.getByLabelText('Your password'));
    await user.type(screen.getByLabelText('Your password'), PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Turn on' }));
    expect(await screen.findByRole('heading', { name: 'Save your recovery codes' })).toBeTruthy();
    expect(
      identity.sent.findLast((sent) => sent.path === '/auth/authenticator/confirm')?.body,
    ).toEqual({ code: GOOD_CODE, password: PASSWORD });
    await tickAndFinish(user);
    await waitFor(() => {
      expect(where()).toBe(ACCOUNT_PATHS.security);
    });
    // the security page knows: /iam/me was read again
    expect(await screen.findByText('10 recovery codes of 10 left.')).toBeTruthy();
  });

  it('moves focus between its steps, but not on the page that just opened (QA-FE-008)', async () => {
    const identity = signedIn();
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.authenticator });
    const scan = await screen.findByRole('heading', {
      name: 'Add Beautinique to your authenticator app',
    });
    expect(document.activeElement).not.toBe(scan);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Authenticator code'));
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(document.activeElement).toBe(
      screen.getByRole('heading', { name: 'Add Beautinique to your authenticator app' }),
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByLabelText('Authenticator code'), GOOD_CODE);
    await user.type(screen.getByLabelText('Your password'), PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Turn on' }));
    const codes = await screen.findByRole('heading', { name: 'Save your recovery codes' });
    await waitFor(() => {
      expect(document.activeElement).toBe(codes);
    });
  });

  it('starts again with a new key when the set-up expired', async () => {
    const identity = signedIn();
    identity.on('POST /auth/authenticator/confirm', () =>
      failure(400, 'AUTHENTICATOR_SETUP_EXPIRED', 'This authenticator set-up has expired.'),
    );
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.authenticator });
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    await user.type(screen.getByLabelText('Authenticator code'), GOOD_CODE);
    await user.type(screen.getByLabelText('Your password'), PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Turn on' }));
    expect(await screen.findByText('This authenticator set-up has expired.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Add Beautinique to your authenticator app' }));
    expect(identity.paths().filter((path) => path.includes('enroll'))).toHaveLength(2);
  });

  it('replaces one on a new phone after a step-up', async () => {
    const identity = signedIn({ authenticator: true });
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.authenticator });
    await stepUpWith(user, GOOD_CODE);
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: 'Replace authenticator' })).toBeTruthy();
    // the code is for the new phone alone (QA DR-010)
    expect(identity.sent.find((sent) => sent.path === '/auth/step-up')?.body).toEqual({
      code: GOOD_CODE,
      for: 'authenticator.replace',
    });
  });

  it('asks to confirm it is you again when the step-up was cancelled', async () => {
    const identity = signedIn({ authenticator: true });
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.authenticator });
    const dialog = await screen.findByRole('dialog', { name: 'Confirm it’s you' });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect((await screen.findByRole('alert')).textContent).toContain('first confirm it’s you');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await stepUpWith(user, GOOD_CODE);
    expect(await screen.findByRole('button', { name: 'Next' })).toBeTruthy();
  });

  it('sends an account without a password to set one first', async () => {
    const identity = signedIn();
    identity.on('POST /auth/authenticator/enroll', () =>
      failure(
        400,
        'PASSWORD_REQUIRED',
        'Set a password for your account first, then set up the authenticator.',
      ),
    );
    renderApp(pages, { identity, at: ACCOUNT_PATHS.authenticator });
    expect((await screen.findByRole('alert')).textContent).toContain('Set a password');
    expect(screen.getByRole('link', { name: 'Set a password' }).getAttribute('href')).toBe(
      '/forgot-password?next=%2Faccount%2Fsecurity%2Fauthenticator',
    );
  });
});

describe('RecoveryCodes', () => {
  const codesPage = {
    '/codes': (
      <>
        <RecoveryCodes codes={RECOVERY_CODES} email={EMAIL} onDone={() => undefined} />
        <Link to="/">Home</Link>
      </>
    ),
    '/': <p>Home page</p>,
  };

  it('downloads them as a .txt file', async () => {
    const identity = signedIn();
    const user = userEvent.setup();
    const made: Blob[] = [];
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      made.push(blob as Blob);
      return 'blob:codes';
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      // jsdom does not download
    });
    renderApp(codesPage, { identity, at: '/codes' });
    await user.click(screen.getByRole('button', { name: 'Download .txt' }));
    expect(click).toHaveBeenCalledTimes(1);
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe(RECOVERY_CODES_FILE);
    const text = await made[0]?.text();
    expect(text).toContain(`Account: ${EMAIL}`);
    for (const code of RECOVERY_CODES) expect(text).toContain(`\n${code}\n`);
  });

  it('copies them', async () => {
    const identity = signedIn();
    const user = userEvent.setup();
    renderApp(codesPage, { identity, at: '/codes' });
    await user.click(screen.getByRole('button', { name: 'Copy codes' }));
    expect(await navigator.clipboard.readText()).toBe(RECOVERY_CODES.join('\n'));
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
  });

  it('asks before leaving the page until they are saved', async () => {
    const identity = signedIn();
    const user = userEvent.setup();
    renderApp(codesPage, { identity, at: '/codes' });
    await user.click(screen.getByRole('link', { name: 'Home' }));
    const ask = await screen.findByRole('alertdialog', {
      name: 'Leave without saving your codes?',
    });
    await expectNoAxeViolations();
    await user.click(within(ask).getByRole('button', { name: 'Stay' }));
    expect(where()).toBe('/codes');
    await user.click(screen.getByRole('link', { name: 'Home' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Leave' }),
    );
    expect(await screen.findByText('Home page')).toBeTruthy();
  });

  it('lets the page go once they are saved', async () => {
    const identity = signedIn();
    const user = userEvent.setup();
    renderApp(codesPage, { identity, at: '/codes' });
    await user.click(screen.getByRole('checkbox', { name: 'I’ve saved my recovery codes' }));
    await user.click(screen.getByRole('link', { name: 'Home' }));
    expect(await screen.findByText('Home page')).toBeTruthy();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('writes the file with the account and the codes', () => {
    const text = recoveryCodesText(['ABCDE-FGH23'], EMAIL, new Date('2026-11-03T06:00:00.000Z'));
    expect(text).toContain('Made: 3 Nov 2026, 11:30 am (India time)');
    expect(text.endsWith('ABCDE-FGH23\n')).toBe(true);
  });
});

describe('StepUpProvider', () => {
  /** Asks for new recovery codes `times` times at once. */
  function Act({ times = 1 }: { times?: number }) {
    const client = useApiClient();
    const [answer, setAnswer] = useState('');
    return (
      <>
        <button
          type="button"
          onClick={() => {
            Promise.all(Array.from({ length: times }, () => client.call(newRecoveryCodes))).then(
              (answers) => {
                setAnswer(`done ${String(answers.length)}`);
              },
              (error: unknown) => {
                setAnswer(isApiError(error) ? error.code : 'failed');
              },
            );
          }}
        >
          Act
        </button>
        <p>{answer}</p>
      </>
    );
  }

  it('asks one step-up for calls that want it together', async () => {
    const identity = signedIn({ authenticator: true });
    const user = userEvent.setup();
    renderApp({ '/': <Act times={2} /> }, { identity });
    await user.click(screen.getByRole('button', { name: 'Act' }));
    await stepUpWith(user, GOOD_CODE);
    expect(await screen.findByText('done 2')).toBeTruthy();
    expect(
      identity.paths().filter((path) => path === 'POST /auth/authenticator/recovery-codes'),
    ).toHaveLength(4);
    expect(identity.paths().filter((path) => path === 'POST /auth/step-up')).toHaveLength(1);
  });

  it('sends an account without an authenticator to set one up', async () => {
    const identity = signedIn();
    const user = userEvent.setup();
    renderApp({ '/': <Act />, [ACCOUNT_PATHS.security]: <SecuritySettings /> }, { identity });
    await user.click(screen.getByRole('button', { name: 'Act' }));
    const dialog = await screen.findByRole('dialog', { name: 'Confirm it’s you' });
    await expectNoAxeViolations();
    await user.click(within(dialog).getByRole('link', { name: 'your security settings' }));
    expect(await screen.findByRole('heading', { name: 'Authenticator app' })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
