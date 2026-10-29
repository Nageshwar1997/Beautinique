# @beautinique/frontend-components

Har Beautinique app ke **saanjhe UI components** (ARCHITECTURE §9.2, DESIGN §4): Button, Spinner, Field, Input, PasswordInput, CodeInput, Checkbox, RadioGroup + Radio, Dialog, Tooltip aur toast. Styles package ke tokens aur tones pe; keyboard, screen reader aur touch ka kaam [React Aria Components](https://react-spectrum.adobe.com/react-aria/) karta hai (Checkbox, Radio, Dialog, Tooltip). Pickers (Select, DatePicker, ColorPicker, HierarchySelect) agle package badlav me.

## Install

```bash
npm install @beautinique/frontend-components
```

Peer: `react` + `react-dom` 19. Dependencies: `@beautinique/frontend-icons`, `react-aria-components`, `motion` (sirf toast ke liye, neeche dekho).

App ki CSS me, `tailwindcss` aur styles package ke **baad**:

```css
@import 'tailwindcss';
@import '@beautinique/frontend-styles';
@import '@beautinique/frontend-components/tailwind.css';
```

Ye line zaroori hai: Tailwind `node_modules` nahi padhta, to iske bina components ki classes banti hi nahi.

## Components

| Export                                       | Kaam                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                     | Pill button. `variant` (`BUTTON_VARIANTS`): `primary` (brand gradient, screen ka ek main kaam), `solid` (default), `outline`, `soft`, `ghost`. `tone` (`TONES`, 8, default `brand`; `primary` pe asar nahi). `size` (`BUTTON_SIZES`): `sm`, `md` (default, 44 px), `lg`. `startIcon`/`endIcon`, `fullWidth`, `loading`. Default `type="button"`.  |
| `Button` icon-only                           | `icon={<IconClose />}` + **zaroori** `aria-label` (TypeScript rokta hai). Chaukor, har size me 44 px touch area.                                                                                                                                                                                                                                  |
| `Spinner`                                    | Ghoomta ring, text ke rang me. `label` do to `role="status"` + screen reader ke liye text; bina label screen reader se chhupa (jaise Button ke andar).                                                                                                                                                                                            |
| `Field`                                      | Label + control + hint + error ek jagah, screen reader ke liye jude hue (`aria-describedby`, `aria-invalid`, `required`). Apna control `children={(control) => <MyControl {...control} />}` se.                                                                                                                                                   |
| `Input`                                      | Label wala text box (Field pe), 44 px, focus ring poore box pe. `hint`, `error`, `startIcon`, `end`; har `<input>` attribute aage jaata hai. `CONTROL_BOX` = uski box class (apne control ke liye).                                                                                                                                               |
| `PasswordInput`                              | Show/hide button ke saath (pressed toggle, `aria-pressed`). `autoComplete` zaroori: `current-password` (sign in) ya `new-password`. Kuch trim nahi karta: wo form ka kaam (`passwordZod`).                                                                                                                                                        |
| `CodeInput`                                  | Email/authenticator code: digit boxes ke neeche **ek** asli `<input>` (`one-time-code` autofill, paste, screen reader ke liye ek field). Sirf digits, `length` (default 6) tak; sab aate hi `onComplete(code)` ek baar.                                                                                                                           |
| `Checkbox`                                   | Label ke saath; `isSelected` + `onChange` ya `defaultSelected`; `isIndeterminate`; `hint`, `error`; `inputRef` asli input tak.                                                                                                                                                                                                                    |
| `RadioGroup` + `Radio`                       | Kuch options me se ek, sab dikhte. Group: `label`, `hint`, `error`, `orientation`; arrow keys chalate aur chunte hain, ek tab stop. Har `Radio` ka apna `hint` (jaise "1–2 days").                                                                                                                                                                |
| `Dialog`                                     | Modal: focus andar aata aur rehta hai, Escape, peeche ka page scroll nahi hota aur screen reader se chhupta hai, band hone pe focus wapas. Phone pe neeche se, badi screen pe beech me. `title` (naam), `description`, `footer` (main kaam aakhri), `size`, `role="alertdialog"`, `dismissable={false}` (sirf footer ke buttons band karte hain). |
| `Tooltip`                                    | Hover (600 ms) aur keyboard focus pe chhota text; trigger ko describe karta hai. Touch pe nahi dikhta, to zaroori baat tooltip me nahi. Icon button ka apna `aria-label` phir bhi chahiye.                                                                                                                                                        |
| `toast()`, `dismissToast()`, `clearToasts()` | Kahin se bhi toast (React ke bahar bhi: API client, store). `tone` success/info (5 s), warning (7 s), error (khud nahi jaata), `duration`, `description`, ek `action` (jaise "Undo"), `id` (same id wala purana badal jaata hai: ek hi "You are offline").                                                                                        |
| `Toaster`                                    | App ki root pe ek baar. `Notifications` landmark; naya toast screen reader ko ek baar padha jaata hai (error turant, baaki aaram se); ek saath 3 (`VISIBLE_TOASTS`), baaki line me; hover/focus pe ghadi rukti hai; side me swipe se dismiss.                                                                                                     |
| `cx`, `TONES`, `TONE_CLASS`                  | Class jodna; 8 tones aur unki static `tone-*` classes (Tailwind ko source me dikhein).                                                                                                                                                                                                                                                            |

## Examples

```tsx
<Button variant="primary" loading={saving} type="submit">Sign in</Button>
<Button variant="outline" tone="neutral" startIcon={<IconBox />}>Orders</Button>

<Input label="Email" type="email" autoComplete="email" required error={errors.email} />
<PasswordInput label="Password" autoComplete="current-password" />
<CodeInput label="Code from the email" value={code} onChange={setCode} onComplete={verify} />

<Checkbox isSelected={terms} onChange={setTerms} error={errors.terms}>I accept the terms</Checkbox>

<RadioGroup label="Delivery" value={speed} onChange={setSpeed}>
  <Radio value="standard" hint="3–5 days">Standard</Radio>
  <Radio value="express" hint="1–2 days">Express</Radio>
</RadioGroup>

toast({ tone: 'success', title: 'Address saved' });
toast({ tone: 'error', title: 'Could not pay', description: 'Nothing was charged.' });
```

## Motion (Framer Motion) sirf toast me

Owner ka faisla (2026-10-30, ARCHITECTURE §9.2): animations pehle CSS (styles package ki `animate-*`, Dialog aur Tooltip yahi use karte hain); Motion sirf wahan jahan CSS nahi kar sakta: toast ka nikalna (exit), baaki toasts ka khisakna (layout) aur swipe (drag). `LazyMotion` + `m`, aur `reducedMotion="user"` (system me "less motion" ho to animation nahi; CSS animations bhi styles `base.css` rok deta hai).

Naapa hua size (2026-10-30, playground ka production build, gzip): Motion ka chhota hissa main bundle me **~7.7 kB**; baaki features (`domMax`: drag + layout) alag chunk **31.8 kB**, jo `Toaster` render hone ke baad async aata hai (pehla paint nahi rokta). Kisi app ka koi aur component Motion import na kare: naya animation pehle CSS se.

## Playground

```bash
npm run playground --workspace @beautinique/frontend-components
```

http://localhost:5184: har component ke kaam karte examples (saare variants × tones, errors, code input, dialogs, tooltips, toasts), app-shell ke frame aur theme switcher (light/dark) ke saath.

## Tests

`npm test --workspace @beautinique/frontend-components` (jsdom, Testing Library + user-event, har component pe axe): keyboard, focus, screen reader wiring, toast store, timers, pause aur live regions. Colour contrast aur swipe asli browser me check hote hain (axe-core playground pe, light aur dark).

## License

MIT © Nageshwar Pawar
