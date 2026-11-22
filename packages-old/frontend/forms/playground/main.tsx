// Playground: the form fields and the server's answers in working forms, inside the shell (theme
// switcher for light and dark). `npm run playground --workspace @beautinique/frontend-forms`,
// http://localhost:5185.
import './playground.css';

import { ApiError } from '@beautinique/frontend-api-client';
import { AppFrame, THEME_SCRIPT, ThemeSwitcher } from '@beautinique/frontend-app-shell';
import { Radio, RadioGroup, toast, Toaster } from '@beautinique/frontend-components';
import {
  array,
  boolean,
  emailZod,
  enum as zodEnum,
  object,
  otpZod,
  passwordZod,
  string,
} from '@beautinique/shared-zod';
import { type ReactNode, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import {
  CheckboxField,
  CodeField,
  Form,
  PasswordField,
  RadioGroupField,
  SelectField,
  SubmitButton,
  TextField,
  useZodForm,
} from '../src/index';

function Card({ title, id, children }: { title: string; id: string; children: ReactNode }) {
  return (
    <section className="border-border bg-surface rounded-2xl border p-5" aria-labelledby={id}>
      <h2 id={id} className="font-display text-xl font-medium">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

const pause = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/** What the pretend server answers to the next submit. */
const ANSWERS = {
  ok: 'Success',
  field: 'A problem with the email (VALIDATION_FAILED)',
  code: 'Wrong code (OTP_INVALID)',
  form: 'Wrong email or password (INVALID_CREDENTIALS)',
  offline: 'No answer (NETWORK_ERROR)',
} as const;
type Answer = keyof typeof ANSWERS;

const failureOf: Record<Exclude<Answer, 'ok'>, ApiError> = {
  field: new ApiError({
    code: 'VALIDATION_FAILED',
    message: 'Some fields are not valid.',
    status: 400,
    details: [{ path: ['email'], message: 'This email cannot be used here' }],
  }),
  code: new ApiError({ code: 'OTP_INVALID', message: 'That code is not right.', status: 400 }),
  form: new ApiError({
    code: 'INVALID_CREDENTIALS',
    message: 'The email or password is not right.',
    status: 401,
  }),
  offline: new ApiError({
    code: 'NETWORK_ERROR',
    message: 'The server could not be reached',
    status: 0,
  }),
};

const signUpZod = object({
  email: emailZod,
  password: passwordZod,
  code: otpZod,
  consent: object({
    terms: boolean().refine((accepted) => accepted, 'Accept the terms and privacy notice'),
    adult: boolean().refine((adult) => adult, 'Confirm that you are 18 or older'),
  }),
});

function SignUp() {
  const [answer, setAnswer] = useState<Answer>('ok');
  const form = useZodForm(signUpZod, {
    defaultValues: {
      email: '',
      password: '',
      code: '',
      consent: { terms: false, adult: false },
    },
  });
  return (
    <Card title="Create an account" id="sign-up">
      <RadioGroup
        label="The pretend server answers"
        value={answer}
        onChange={(value) => {
          setAnswer(value as Answer);
        }}
      >
        {Object.entries(ANSWERS).map(([value, label]) => (
          <Radio key={value} value={value}>
            {label}
          </Radio>
        ))}
      </RadioGroup>
      <Form
        form={form}
        aria-labelledby="sign-up"
        className="space-y-4"
        errorFields={{ OTP_INVALID: 'code' }}
        onSubmit={async (values) => {
          await pause(800);
          if (answer !== 'ok') throw failureOf[answer];
          toast({ tone: 'success', title: 'Account made', description: values.email });
        }}
      >
        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
        />
        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          autoComplete="new-password"
          hint="At least 12 characters"
          required
        />
        <CodeField control={form.control} name="code" label="Code from the email" />
        <CheckboxField control={form.control} name="consent.terms">
          I accept the terms and privacy notice
        </CheckboxField>
        <CheckboxField control={form.control} name="consent.adult">
          I am 18 or older
        </CheckboxField>
        <SubmitButton fullWidth>Create account</SubmitButton>
      </Form>
    </Card>
  );
}

const profileZod = object({
  skin: zodEnum(['dry', 'oily', 'combination', 'sensitive'], 'Choose your skin type'),
  delivery: zodEnum(['standard', 'express'], 'Choose a delivery speed'),
  concerns: array(string()).min(1, 'Choose at least one concern'),
});

function Profile() {
  const form = useZodForm(profileZod, {
    defaultValues: { skin: undefined, delivery: undefined, concerns: [] },
  });
  return (
    <Card title="Beauty profile" id="profile">
      <Form
        form={form}
        aria-labelledby="profile"
        className="space-y-4"
        onSubmit={async (values) => {
          await pause(500);
          toast({ tone: 'success', title: 'Saved', description: JSON.stringify(values) });
        }}
      >
        <SelectField
          control={form.control}
          name="skin"
          label="Skin type"
          options={[
            { value: 'dry', label: 'Dry' },
            { value: 'oily', label: 'Oily' },
            { value: 'combination', label: 'Combination' },
            { value: 'sensitive', label: 'Sensitive' },
          ]}
        />
        <RadioGroupField control={form.control} name="delivery" label="Delivery">
          <Radio value="standard" hint="3–5 days">
            Standard
          </Radio>
          <Radio value="express" hint="1–2 days">
            Express
          </Radio>
        </RadioGroupField>
        <SelectField
          control={form.control}
          name="concerns"
          label="Concerns"
          selectionMode="multiple"
          options={[
            { value: 'acne', label: 'Acne' },
            { value: 'dullness', label: 'Dullness' },
            { value: 'pigmentation', label: 'Pigmentation' },
          ]}
        />
        <SubmitButton>Save</SubmitButton>
      </Form>
    </Card>
  );
}

function Page() {
  return (
    <AppFrame
      header={
        <header className="border-border border-b">
          <div className="container-page flex min-h-16 items-center gap-4">
            <h1 className="font-display text-brand-gradient mr-auto text-2xl font-medium">Forms</h1>
            <ThemeSwitcher />
          </div>
        </header>
      }
    >
      <div className="container-page grid grid-cols-1 gap-5 py-8 lg:grid-cols-2">
        <SignUp />
        <Profile />
      </div>
      <Toaster />
    </AppFrame>
  );
}

const router = createBrowserRouter([{ path: '/', Component: Page }]);

// what a server-rendered app puts in <head> (ThemeScript)
const themeScript = document.createElement('script');
themeScript.textContent = THEME_SCRIPT;
document.head.prepend(themeScript);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
