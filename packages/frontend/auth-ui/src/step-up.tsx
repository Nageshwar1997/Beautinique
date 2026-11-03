import { queryKey, useApiClient } from '@beautinique/frontend-api-client';
import { Button, Dialog, toast } from '@beautinique/frontend-components';
import { CodeField, Form, SubmitButton, TextField, useZodForm } from '@beautinique/frontend-forms';
import { getMe, loginRecovery, loginTotp, stepUp } from '@beautinique/shared-contracts';
import { plural } from '@beautinique/shared-utils';
import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useEffect, useState } from 'react';

import { TextLink } from './layout';
import { ACCOUNT_PATHS } from './next';
import { useSession } from './session';
import { FEW_RECOVERY_CODES } from './sign-in';

/** The step-up the dialog is answering: settles the API client's wait once. */
interface Asking {
  settle: (proved: boolean) => void;
}

/**
 * Answers the API client's step-ups (STEP_UP_REQUIRED, ARCHITECTURE §7.1) with one dialog: the
 * authenticator code, or one of the recovery codes (a lost phone). Proved, the client sends the
 * call again, and the step-up counts 5 minutes; cancelled, the call fails with STEP_UP_REQUIRED,
 * which a page treats as "nothing happened" (`isApiError(error, 'STEP_UP_REQUIRED')`). Put it
 * inside the router and the SessionProvider, once per app.
 */
export function StepUpProvider({ children }: { children: ReactNode }) {
  const client = useApiClient();
  const [asking, setAsking] = useState<Asking | null>(null);

  useEffect(
    () =>
      client.setStepUpHandler(
        () =>
          new Promise<boolean>((resolve) => {
            let settled = false;
            setAsking({
              settle: (proved) => {
                if (settled) return;
                settled = true;
                setAsking(null);
                resolve(proved);
              },
            });
          }),
      ),
    [client],
  );

  return (
    <>
      {children}
      <Dialog
        open={asking !== null}
        onOpenChange={(open) => {
          if (!open) asking?.settle(false);
        }}
        title="Confirm it’s you"
        size="sm"
      >
        {asking !== null && <StepUpForms asking={asking} />}
      </Dialog>
    </>
  );
}

function StepUpForms({ asking }: { asking: Asking }) {
  const { state } = useSession();
  const [mode, setMode] = useState<'code' | 'recovery'>('code');
  const cancel = (
    <Button
      variant="outline"
      tone="neutral"
      onClick={() => {
        asking.settle(false);
      }}
    >
      Cancel
    </Button>
  );
  if (state.status === 'signed-in' && !state.user.authenticator) {
    return (
      <div className="space-y-4">
        <p className="text-sm">
          This needs a code from an authenticator app. Set one up in{' '}
          <TextLink
            to={ACCOUNT_PATHS.security}
            onClick={() => {
              asking.settle(false);
            }}
          >
            your security settings
          </TextLink>
          , then try again.
        </p>
        <div className="flex justify-end">{cancel}</div>
      </div>
    );
  }
  return mode === 'code' ? (
    <CodeForm
      asking={asking}
      cancel={cancel}
      onRecovery={() => {
        setMode('recovery');
      }}
    />
  ) : (
    <RecoveryForm
      asking={asking}
      cancel={cancel}
      onCode={() => {
        setMode('code');
      }}
    />
  );
}

interface FormProps {
  asking: Asking;
  cancel: ReactNode;
}

function Actions({ cancel, other }: { cancel: ReactNode; other: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {cancel}
        <SubmitButton>Continue</SubmitButton>
      </div>
      <div className="flex justify-center">{other}</div>
    </div>
  );
}

function CodeForm({ asking, cancel, onRecovery }: FormProps & { onRecovery: () => void }) {
  const client = useApiClient();
  const form = useZodForm(loginTotp.input.body, { defaultValues: { code: '' } });
  return (
    <Form
      form={form}
      className="space-y-4"
      errorFields={{ TOTP_INVALID: 'code' }}
      onSubmit={async ({ code }) => {
        await client.call(stepUp, { body: { code } });
        asking.settle(true);
      }}
    >
      <p className="text-sm">Enter the 6-digit code from your authenticator app.</p>
      <CodeField control={form.control} name="code" label="Authenticator code" autoFocus />
      <Actions
        cancel={cancel}
        other={
          <Button variant="ghost" size="sm" onClick={onRecovery}>
            Lost your phone? Use a recovery code
          </Button>
        }
      />
    </Form>
  );
}

function RecoveryForm({ asking, cancel, onCode }: FormProps & { onCode: () => void }) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const form = useZodForm(loginRecovery.input.body, { defaultValues: { code: '' } });
  return (
    <Form
      form={form}
      className="space-y-4"
      errorFields={{ RECOVERY_CODE_INVALID: 'code' }}
      onSubmit={async ({ code }) => {
        const { recoveryCodesLeft } = await client.call(stepUp, { body: { recoveryCode: code } });
        // the count on the security page is one less now
        void queryClient.invalidateQueries({ queryKey: queryKey(getMe) });
        if (recoveryCodesLeft !== null && recoveryCodesLeft <= FEW_RECOVERY_CODES) {
          toast({
            tone: 'warning',
            title: `${plural(recoveryCodesLeft, 'recovery code')} left`,
            description: 'Get new recovery codes in your security settings.',
          });
        }
        asking.settle(true);
      }}
    >
      <p className="text-sm">
        Enter one of the recovery codes you saved when you set up the authenticator. Each code works
        once.
      </p>
      <TextField
        control={form.control}
        name="code"
        label="Recovery code"
        hint="Like ABCDE-FGH23"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        autoFocus
      />
      <Actions
        cancel={cancel}
        other={
          <Button variant="ghost" size="sm" onClick={onCode}>
            Use the authenticator code
          </Button>
        }
      />
    </Form>
  );
}
