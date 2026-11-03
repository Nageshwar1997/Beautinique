import {
  errorMessage,
  isApiError,
  queryKey,
  useApiMutation,
} from '@beautinique/frontend-api-client';
import { Button, Dialog, toast } from '@beautinique/frontend-components';
import {
  disableAuthenticator,
  getMe,
  newRecoveryCodes,
  type RouteOutput,
} from '@beautinique/shared-contracts';
import { plural } from '@beautinique/shared-utils';
import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import { AccountCard, LinkButton, StatusBadge } from './account-parts';
import { ACCOUNT_PATHS, AUTH_PATHS, authHref } from './next';
import { RecoveryCodes } from './recovery-codes';
import { useSession } from './session';
import { FEW_RECOVERY_CODES } from './sign-in';

type User = RouteOutput<typeof getMe>['user'];

/** The link to set (or change) the password: the emailed-code page, with the email handed over. */
function passwordLink(email: string) {
  return {
    to: authHref(AUTH_PATHS.forgotPassword, ACCOUNT_PATHS.security),
    state: { email },
  };
}

/**
 * The account's security page (ARCHITECTURE §9.2): the password (changed with an emailed code,
 * which signs every device out) and the authenticator app (set up, a new phone, new recovery
 * codes, turn off; the last three ask a step-up). Inside RequireSignIn and a StepUpProvider.
 */
export function SecuritySettings() {
  const { state } = useSession();
  const [codes, setCodes] = useState<string[] | null>(null);
  const [back, setBack] = useState(false);
  if (state.status !== 'signed-in') return null;
  const { user } = state;
  if (codes !== null) {
    return (
      <AccountCard title="Your new recovery codes" focusTitle>
        <RecoveryCodes
          codes={codes}
          email={user.email}
          onDone={() => {
            setCodes(null);
            setBack(true);
            toast({ tone: 'success', title: 'Your new recovery codes are ready to use.' });
          }}
        />
      </AccountCard>
    );
  }
  return (
    <div className="space-y-6">
      <PasswordCard user={user} />
      <AuthenticatorCard
        user={user}
        focusTitle={back}
        onCodes={(made) => {
          setCodes(made);
        }}
      />
    </div>
  );
}

function PasswordCard({ user }: { user: User }) {
  const hasPassword = user.providers.includes('password');
  return (
    <AccountCard
      title="Password"
      description={
        hasPassword
          ? 'We email you a code to set a new password. A new password signs you out on every device.'
          : 'Your account has no password yet. Set one to sign in with your email.'
      }
    >
      <LinkButton {...passwordLink(user.email)}>
        {hasPassword ? 'Change password' : 'Set a password'}
      </LinkButton>
    </AccountCard>
  );
}

type Asking = 'codes' | 'off' | null;

function AuthenticatorCard({
  user,
  focusTitle,
  onCodes,
}: {
  user: User;
  focusTitle: boolean;
  onCodes: (codes: string[]) => void;
}) {
  const queryClient = useQueryClient();
  const [asking, setAsking] = useState<Asking>(null);
  const newCodes = useApiMutation(newRecoveryCodes);
  const turnOff = useApiMutation(disableAuthenticator);
  const refreshMe = () => queryClient.invalidateQueries({ queryKey: queryKey(getMe) });
  // a cancelled step-up is the person changing their mind: nothing to say
  const quietly = (error: unknown) => {
    if (isApiError(error, 'STEP_UP_REQUIRED')) setAsking(null);
  };
  const ask = (what: Asking) => {
    newCodes.reset();
    turnOff.reset();
    setAsking(what);
  };

  if (!user.authenticator) {
    return (
      <AccountCard
        title="Authenticator app"
        status={<StatusBadge tone="neutral">Off</StatusBadge>}
        description="Sign in with a code from an app on your phone as well as your password, so a stolen password alone is not enough."
        focusTitle={focusTitle}
      >
        <LinkButton to={ACCOUNT_PATHS.authenticator} variant="solid">
          Set up
        </LinkButton>
      </AccountCard>
    );
  }

  const left = user.recoveryCodesLeft ?? 0;
  const few = left <= FEW_RECOVERY_CODES;
  // what went wrong in the open question (a cancelled step-up is not shown)
  const shown = (error: unknown) =>
    error === null || isApiError(error, 'STEP_UP_REQUIRED') ? undefined : error;
  const codesFailed = shown(newCodes.error);
  const offFailed = shown(turnOff.error);
  return (
    <AccountCard
      title="Authenticator app"
      status={<StatusBadge tone="success">On</StatusBadge>}
      description="Signing in asks for a code from your authenticator app after your password."
      focusTitle={focusTitle}
    >
      <p
        className={
          few
            ? 'bg-warning-subtle text-warning-subtle-foreground rounded-lg px-4 py-3 text-sm'
            : 'text-sm'
        }
      >
        {plural(left, 'recovery code')} of 10 left.
        {few && ' Get new ones before you run out.'}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => {
            ask('codes');
          }}
        >
          Get new recovery codes
        </Button>
        <LinkButton to={ACCOUNT_PATHS.authenticator}>Set up on a new phone</LinkButton>
        <Button
          variant="outline"
          tone="error"
          onClick={() => {
            ask('off');
          }}
        >
          Turn off
        </Button>
      </div>
      <Confirm
        open={asking === 'codes'}
        onClose={() => {
          setAsking(null);
        }}
        title="Get new recovery codes?"
        description="Your current recovery codes stop working. First you confirm it’s you."
        action="Get new codes"
        busy={newCodes.isPending}
        error={codesFailed}
        onConfirm={() => {
          newCodes.mutate(undefined, {
            onSuccess: ({ recoveryCodes }) => {
              setAsking(null);
              void refreshMe();
              onCodes(recoveryCodes);
            },
            onError: quietly,
          });
        }}
      />
      <Confirm
        open={asking === 'off'}
        onClose={() => {
          setAsking(null);
        }}
        title="Turn off the authenticator?"
        description="Signing in will ask for your password only, and your recovery codes stop working. First you confirm it’s you."
        action="Turn off"
        tone="error"
        busy={turnOff.isPending}
        error={offFailed}
        onConfirm={() => {
          turnOff.mutate(undefined, {
            onSuccess: () => {
              setAsking(null);
              void refreshMe();
              toast({ tone: 'success', title: 'The authenticator is off.' });
            },
            onError: quietly,
          });
        }}
      />
    </AccountCard>
  );
}

function Confirm({
  open,
  onClose,
  title,
  description,
  action,
  tone = 'brand',
  busy,
  error,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  action: string;
  tone?: 'brand' | 'error';
  busy: boolean;
  error: unknown;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !busy) onClose();
      }}
      role="alertdialog"
      size="sm"
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline" tone="neutral" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button tone={tone} loading={busy} onClick={onConfirm}>
            {action}
          </Button>
        </>
      }
    >
      {error === undefined ? undefined : (
        <p
          role="alert"
          className="bg-error-subtle text-error-subtle-foreground rounded-lg px-4 py-3 text-sm"
        >
          {errorMessage(error)}
        </p>
      )}
    </Dialog>
  );
}
