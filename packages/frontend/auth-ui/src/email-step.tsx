import {
  CheckboxField,
  Form,
  SubmitButton,
  TextField,
  useZodForm,
} from '@beautinique/frontend-forms';
import { type AppId, consentProblems } from '@beautinique/shared-contracts';
import { emailZod, literal, object, type ZodType } from '@beautinique/shared-zod';
import type { ReactNode } from 'react';

import { TEXT_LINK } from './layout';

/** Where the legal pages are (dummy ones in the customer app, ARCHITECTURE §9.2). */
export interface LegalLinks {
  terms: string;
  privacy: string;
}

/** The customer app's pages (the sign-up apps link there). */
export const LEGAL_LINKS: LegalLinks = { terms: '/terms', privacy: '/privacy' };

export interface EmailStepValues {
  email: string;
  /** Only in the sign-up apps (contracts consentProblems) */
  consent?: { terms: true; adult?: true };
}

/**
 * The consent this app asks with a code (contracts consentProblems): none, terms, or terms + 18+.
 * A password code asks none (`consent` false).
 */
function consentOf(app: AppId, consent: boolean) {
  return {
    terms: consent && consentProblems(app, undefined).length > 0,
    adult: consent && consentProblems(app, { terms: true }).length > 0,
  };
}

const termsZod = literal(true, 'Accept the terms and privacy notice');
const adultZod = literal(true, 'Confirm that you are 18 or older');

/** What the email step's fields hold: the checkboxes start unticked. */
interface EmailStepFields {
  email: string;
  consent?: { terms?: boolean; adult?: boolean };
}

/**
 * The email step's schema for the app: the email, and the consent the app asks. Three shapes, one
 * form: typed as the fields it has and the values it gives, so the one form takes any of them.
 */
function emailStepZod(asks: {
  terms: boolean;
  adult: boolean;
}): ZodType<EmailStepValues, EmailStepFields> {
  if (!asks.terms) return object({ email: emailZod });
  return object({
    email: emailZod,
    consent: asks.adult
      ? object({ terms: termsZod, adult: adultZod })
      : object({ terms: termsZod }),
  });
}

export interface EmailStepProps {
  app: AppId;
  email?: string;
  /** The button: "Send code". */
  submitLabel: string;
  /** The dummy legal pages, for the consent's links (sign-up apps). */
  legal?: LegalLinks;
  onSubmit: (values: EmailStepValues) => unknown;
  /** Under the email field. */
  hint?: ReactNode;
  /** Ask the app's consent (sign-up, invitation); a password code asks none. @default true */
  consent?: boolean;
}

/**
 * Step 1 of an email-code page: the email, and in the sign-up apps the terms and privacy notice
 * (and in the customer app 18 or older), which every code request asks, account or not.
 */
export function EmailStep({
  app,
  email = '',
  submitLabel,
  legal = LEGAL_LINKS,
  onSubmit,
  hint,
  consent = true,
}: EmailStepProps) {
  const asks = consentOf(app, consent);
  const form = useZodForm(emailStepZod(asks), { defaultValues: { email } });
  return (
    <Form
      form={form}
      className="space-y-4"
      onSubmit={async (values) => {
        await onSubmit(values);
      }}
    >
      <TextField
        control={form.control}
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        hint={hint}
      />
      {asks.terms && (
        <CheckboxField control={form.control} name="consent.terms">
          I accept the{' '}
          <a href={legal.terms} target="_blank" rel="noreferrer" className={TEXT_LINK}>
            terms of use
          </a>{' '}
          and the{' '}
          <a href={legal.privacy} target="_blank" rel="noreferrer" className={TEXT_LINK}>
            privacy notice
          </a>
        </CheckboxField>
      )}
      {asks.adult && (
        <CheckboxField control={form.control} name="consent.adult">
          I am 18 or older
        </CheckboxField>
      )}
      <SubmitButton fullWidth>{submitLabel}</SubmitButton>
    </Form>
  );
}
