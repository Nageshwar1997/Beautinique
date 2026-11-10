import { errorMessage, useApiClient } from '@beautinique/frontend-api-client';
import { Button } from '@beautinique/frontend-components';
import {
  CodeField,
  Form,
  PasswordField,
  SubmitButton,
  useZodForm,
} from '@beautinique/frontend-forms';
import { useCountdown } from '@beautinique/frontend-hooks';
import { resendOtp, type RouteOutput, verifyOtp } from '@beautinique/shared-contracts';
import { formatTime } from '@beautinique/shared-utils';
import { type ReactNode, useId, useState } from 'react';

/** An emailed code waiting for its check (contracts otpChallengeZod). */
export type Challenge = RouteOutput<typeof resendOtp>;

/** What a checked code gave (contracts verifyOtp): the outcome, and whether it signed in. */
export type Verified = RouteOutput<typeof verifyOtp>;

export interface CodeStepProps {
  email: string;
  challenge: Challenge;
  /** The button: "Create account", "Set password", "Accept invitation". */
  submitLabel: string;
  /** Under the password field: what the password is for here. */
  passwordHint?: ReactNode;
  onVerified: (verified: Verified) => unknown;
  /** Back to the email (a typo). */
  onBack: () => void;
}

/**
 * Step 2 of every email-code page (sign-up, a new password, an invitation): the code from the
 * email and the password, checked together (a code works once). A new code after the wait the
 * server gave, as long as the challenge has resends left.
 */
export function CodeStep({
  email,
  challenge: first,
  submitLabel,
  passwordHint = 'At least 12 characters. A sentence you will remember works well.',
  onVerified,
  onBack,
}: CodeStepProps) {
  const client = useApiClient();
  const [challenge, setChallenge] = useState(first);
  const [resendNote, setResendNote] = useState('');
  const [resending, setResending] = useState(false);
  const wait = useCountdown(challenge.resendAfter);
  const form = useZodForm(verifyOtp.input.body, { defaultValues: { code: '', password: '' } });
  const sentId = useId();

  const resend = async () => {
    setResending(true);
    try {
      const next = await client.call(resendOtp, { params: { challengeId: challenge.challengeId } });
      setChallenge(next);
      form.resetField('code');
      setResendNote(`We sent a new code to ${email}.`);
    } catch (error) {
      setResendNote(errorMessage(error));
    } finally {
      setResending(false);
    }
  };

  const canResend = challenge.resendsLeft > 0 && wait === 0;
  return (
    <div className="space-y-5">
      <p id={sentId} className="text-sm">
        We sent a 6-digit code to <strong className="font-semibold break-all">{email}</strong>. It
        works until {formatTime(challenge.expiresAt)}. Can&apos;t find it? Check your spam folder
        too.
      </p>
      <Form
        form={form}
        className="space-y-4"
        errorFields={{ OTP_INVALID: 'code', OTP_EXPIRED: 'code' }}
        onSubmit={async (body) => {
          const verified = await client.call(verifyOtp, {
            params: { challengeId: challenge.challengeId },
            body,
          });
          await onVerified(verified);
        }}
      >
        {/* a new step: focus on its first field, which says where the code went (QA-FE-008) */}
        <CodeField
          control={form.control}
          name="code"
          label="Code from the email"
          autoFocus
          aria-describedby={sentId}
        />
        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          autoComplete="new-password"
          hint={passwordHint}
        />
        <SubmitButton fullWidth>{submitLabel}</SubmitButton>
      </Form>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Use another email
        </Button>
        {challenge.resendsLeft > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={!canResend}
            loading={resending}
            onClick={() => {
              void resend();
            }}
          >
            {canResend || wait === null
              ? 'Send a new code'
              : `Send a new code in ${String(wait)} s`}
          </Button>
        ) : (
          <p className="text-foreground-muted text-sm">No more new codes for this request.</p>
        )}
      </div>
      <p role="status" className="text-foreground-muted text-sm empty:hidden">
        {resendNote}
      </p>
    </div>
  );
}
