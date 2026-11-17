import { errorMessage, isApiError } from '@beautinique/frontend-api-client';
import { type FieldPath, type FieldValues, get, type UseFormReturn } from 'react-hook-form';

/** Where a server error code belongs: `{ OTP_INVALID: 'code', PASSWORD_BREACHED: 'password' }`. */
export type ErrorFields<Values extends FieldValues> = Partial<Record<string, FieldPath<Values>>>;

/** The form-wide error, shown by FormError (react-hook-form's `root` namespace). */
export const FORM_ERROR = 'root.server';

/**
 * Puts a failed submit where the person can fix it: a code named in `errorFields` on its field,
 * each `details` entry (VALIDATION_FAILED, consent) on the field of its path when the form has
 * one, and the rest, with the sentence for the error (errorMessage), above the form.
 */
export function showServerError<Values extends FieldValues>(
  form: Pick<UseFormReturn<Values, unknown, unknown>, 'getValues' | 'setError'>,
  error: unknown,
  errorFields: ErrorFields<Values> = {},
): void {
  const values = form.getValues();
  const hasField = (name: string) => get(values, name) !== undefined;
  if (isApiError(error)) {
    const field = errorFields[error.code];
    if (field !== undefined) {
      form.setError(field, { type: error.code, message: error.message }, { shouldFocus: true });
      return;
    }
    let placed = 0;
    for (const detail of error.details) {
      const name = detail.path.map(String).join('.');
      if (name !== '' && hasField(name)) {
        form.setError(
          name as FieldPath<Values>,
          { type: 'server', message: detail.message },
          // the first one gets the focus, so the person starts there
          { shouldFocus: placed === 0 },
        );
        placed += 1;
      }
    }
    if (placed > 0 && placed === error.details.length) return;
  }
  form.setError(FORM_ERROR, { type: 'server', message: errorMessage(error) });
}
