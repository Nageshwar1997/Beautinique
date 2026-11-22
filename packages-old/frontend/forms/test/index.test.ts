import { object, string } from '@beautinique/shared-zod';
import { describe, expect, it } from 'vitest';

import * as forms from '../src/index';

describe('@beautinique/frontend-forms', () => {
  it('exports the form, the fields and the helpers', () => {
    expect(Object.keys(forms).toSorted()).toEqual(
      [
        'CheckboxField',
        'CodeField',
        'FORM_ERROR',
        'Form',
        'FormError',
        'PasswordField',
        'RadioGroupField',
        'SelectField',
        'SubmitButton',
        'TextField',
        'showServerError',
        'useZodForm',
        'zodResolver',
      ].toSorted(),
    );
  });
});

describe('zodResolver', () => {
  const schema = object({
    name: string().trim().min(2, 'Too short').max(3, 'Too long'),
    address: object({ pin: string().regex(/^\d{6}$/, 'Enter the 6-digit PIN code') }),
  }).refine((value) => value.name !== 'bad', 'Not this one');
  const resolve = (values: unknown) =>
    forms.zodResolver(schema)(values as never, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    });

  it('gives the schema’s output when every field is right', async () => {
    expect(await resolve({ name: ' Ash ', address: { pin: '411001' } })).toEqual({
      values: { name: 'Ash', address: { pin: '411001' } },
      errors: {},
    });
  });

  it('gives each field its first message, nested fields under their parent', async () => {
    const result = await resolve({ name: 'a', address: { pin: '41' } });
    expect(result.values).toEqual({});
    expect(result.errors).toEqual({
      name: { type: 'too_small', message: 'Too short' },
      address: { pin: { type: 'invalid_format', message: 'Enter the 6-digit PIN code' } },
    });
  });

  it('puts a problem of the whole form on root', async () => {
    const result = await resolve({ name: 'bad', address: { pin: '411001' } });
    expect(result.errors).toEqual({ root: { type: 'custom', message: 'Not this one' } });
  });
});
