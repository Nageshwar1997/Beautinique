# @beautinique/frontend-forms

Har Beautinique app ke **forms** (ARCHITECTURE §9.2): react-hook-form + hamare zod schemas (`@beautinique/shared-zod` ke `...Zod`), components package ke controls se jude fields, aur server ki galti sahi jagah (field ke neeche ya form ke upar). auth-ui ke saare forms (sign-in, sign-up, password, invitation) isi pe bante hain.

## Install

```bash
npm install @beautinique/frontend-forms
```

Peers: `react` + `react-dom` 19, `@tanstack/react-query` 5 (api-client ka). Dependencies: `react-hook-form`, `@beautinique/frontend-components`, `@beautinique/frontend-api-client` (`errorMessage`), `@beautinique/frontend-hooks` (online status), `@beautinique/shared-zod`.

App ki CSS me, components ki line ke **baad**:

```css
@import '@beautinique/frontend-components/tailwind.css';
@import '@beautinique/frontend-forms/tailwind.css';
```

## Example

```tsx
import { emailZod, object, string } from '@beautinique/shared-zod';
import {
  Form,
  PasswordField,
  SubmitButton,
  TextField,
  useZodForm,
} from '@beautinique/frontend-forms';

// sign-in checks only that a password is there; length rules (passwordZod) are for new ones
const signInZod = object({
  email: emailZod,
  password: string().trim().nonempty('Enter your password'),
});

function SignIn() {
  const form = useZodForm(signInZod, { defaultValues: { email: '', password: '' } });
  return (
    <Form
      form={form}
      onSubmit={(values) => api.call(passwordLogin, { body: values })}
      aria-label="Sign in"
    >
      <TextField
        control={form.control}
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
      />
      <PasswordField
        control={form.control}
        name="password"
        label="Password"
        autoComplete="current-password"
      />
      <SubmitButton fullWidth>Sign in</SubmitButton>
    </Form>
  );
}
```

## API

| Export                                      | Kaam                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useZodForm(schema, options)`               | `useForm` zod schema ke saath: values schema ke input se typed, submit ko schema ka **output** milta hai (trim, lower-case ... jo schema kare). `defaultValues` zaroori (fields controlled rahen aur server ki galti apna field dhoondh sake). Mode `onTouched`: field chhodne pe pehli jaanch, phir har badlav pe.                      |
| `zodResolver(schema)`                       | Wahi resolver alag se: har field ka pehla sandesh, nested path (`consent.terms`) apne parent ke neeche, poore form ki galti (khaali path) `root` pe. Apna hai, `@hookform/resolvers` nahi: zod sirf shared-zod se aata hai.                                                                                                              |
| `Form`                                      | `form`, `onSubmit(values)`, `errorFields`. `noValidate` (browser ke bubbles nahi: unka text browser ka hota hai, hamara field pe). `onSubmit` jo phenke, `showServerError` use sahi jagah dikhata hai. Upar `FormError` khud.                                                                                                            |
| `FormError`                                 | Pichhle submit ki form-wide galti (galat email/password, connection nahi): form ke upar box, `role="alert"` (screen reader turant padhta hai). Agle submit pe saaf.                                                                                                                                                                      |
| `showServerError(form, error, errorFields)` | Galti ki jagah: `errorFields` me naam diya code (`{ OTP_INVALID: 'code' }`) us field pe aur focus wahan; `details` ke har path (`['email']`, `['consent', 'terms']`) ka field ho to wahan, pehle wale pe focus; baaki sab (aur bina field wale details) `errorMessage` ke sentence ke saath form ke upar (`FORM_ERROR` = `root.server`). |
| `TextField`, `PasswordField`, `CodeField`   | `Input` / `PasswordInput` / `CodeInput` field se jude: `control` + `name` (TypeScript schema ke naam hi maanta hai), baaki props control ke. Galti field ke neeche, `aria-invalid` aur `aria-describedby` ke saath.                                                                                                                      |
| `CheckboxField`                             | `Checkbox` ek true/false field se (terms, 18+). Focus andar ke input pe.                                                                                                                                                                                                                                                                 |
| `RadioGroupField`                           | `RadioGroup` (children = `Radio`) chune hue value ke field se. Galat ho to focus chune (ya pehle) radio pe.                                                                                                                                                                                                                              |
| `SelectField`                               | `Select` ek value (`string \| null`) ya `selectionMode="multiple"` me list (`string[]`). List band hona = field chhodna (Select ka apna blur nahi). Focus uske button pe.                                                                                                                                                                |
| `SubmitButton`                              | Submit ke dauran busy (spinner, doosra press kuch nahi bhejta; Enter bhi nahi). Device offline ho to neeche "You are offline. This will work once you are back online." (`role="status"`); button daba sakte hain (connection lautne pe chal jaaye; disabled button wajah nahi batata). Default `variant="primary"`.                     |

**Busy button ka doosra press:** components ka `Button` `loading` me click ka browser wala kaam bhi rokta hai (form ka submit, Enter se submit). Ye kami isi package ke test ne pakdi (2026-10-31) aur components me theek hui.

## Playground

```bash
npm run playground --workspace @beautinique/frontend-forms
```

http://localhost:5185: "Create an account" (email, password, email code, terms, 18+) aur ek nakli server jiska jawab chuna ja sakta hai (success, email pe `VALIDATION_FAILED`, `OTP_INVALID` code field pe, `INVALID_CREDENTIALS` form ke upar, `NETWORK_ERROR`), aur "Beauty profile" (Select, RadioGroup, multiple Select), app-shell ke frame aur theme switcher (light/dark) ke saath.

## Tests

`npm test --workspace @beautinique/frontend-forms` (jsdom, Testing Library + user-event, axe; 16 tests): resolver (output, nested errors, root), submit pe saare errors aur pehle field pe focus, field chhodne pe jaanch, schema ka output submit tak, server ke `details` aur error code apne field pe (focus ke saath), baaki form ke upar aur agle submit pe saaf, busy button (doosra press nahi), offline note, Select/Radio/multiple Select ki values aur focus, errors dikhte hue axe. Colour contrast aur 360/375/768/1280 px asli browser me (playground, axe-core light aur dark). Mutation nahi (RULES §6: frontend packages).

## License

MIT © Nageshwar Pawar
