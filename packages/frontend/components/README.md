# @beautinique/frontend-components

Har Beautinique app ke **saanjhe UI components** (ARCHITECTURE §9.2, DESIGN §4): Button, Spinner, Field, Input, PasswordInput, CodeInput, Checkbox, RadioGroup + Radio, Dialog, Tooltip, toast, aur pickers: Select, ComboBox, DatePicker, DateRangePicker, ColorPicker, HierarchySelect. Styles package ke tokens aur tones pe; keyboard, screen reader aur touch ka kaam [React Aria Components](https://react-spectrum.adobe.com/react-aria/) karta hai (Checkbox, Radio, Dialog, Tooltip aur saare pickers).

## Install

```bash
npm install @beautinique/frontend-components
```

Peer: `react` + `react-dom` 19. Dependencies: `@beautinique/frontend-icons`, `react-aria-components`, `@internationalized/date` (date pickers), `motion` (sirf toast ke liye, neeche dekho). Package tree-shake hota hai (`sideEffects: false`): sirf `Button` lene wale app me 1.3 kB (gzip), na picker ka code na Motion; `DatePicker` akela ~79 kB (zyadatar React Aria ka date/calendar code, jo uske baaki components ke saath saanjha hai). Naapa 2026-10-30.

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

## Pickers (owner ke faisle 2026-10-30, ARCHITECTURE §9.2)

Sabke options data hain (`{ value, label, description?, disabled? }`, `PickerOption`), value text (`string`), aur sab controlled (`value` + `onChange`) ya uncontrolled (`defaultValue`) chalte hain; `label` zaroori, `hint`, `error`, `isRequired`, `isDisabled`, `name` (native form).

| Export            | Kaam                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Select`          | Chhoti list (5–20). Ek chunav; `clearable` se khaali karne ka button. `selectionMode="multiple"`: list khuli rehti, har option ka box, value `string[]`. Keyboard: arrows, akshar type karke option pe, Enter, Escape.                                                                                                                                                                                                                                                                                  |
| `ComboBox`        | Lambi list me type karke dhoondhna (36 states, brands). `options` khud filter hote hain; `onSearch(text)` do to server search: options waise hi dikhte hain, `loading` pe spinner aur "Searching…". Sirf option chuna ja sakta hai: galat text blur pe purane chunav pe lautta hai, khaali box chunav khaali karta hai.                                                                                                                                                                                 |
| `DatePicker`      | `en-IN` dd/mm/yyyy, har hissa type ho sakta hai (ya arrows), calendar button se mahina (Month aur Year ke dropdown: door ki date, jaise date of birth, do chunav me). Value `YYYY-MM-DD`; `withTime` se time bhi, India time (IST) me dikhta aur type hota hai, value ISO instant (`2026-11-05T17:00:00.000Z`), device ka time zone kuch nahi badalta. `minValue`/`maxValue` (`YYYY-MM-DD`, time ke saath poora aakhri din), `isDateUnavailable(day)`. `todayInIndia()`.                                |
| `DateRangePicker` | Do sire ek box me (`{ start, end }`), calendar me pehla press shuru, doosra ant. Baaki DatePicker jaisa. Calendar se din chunne pe time 12:00 am rehta hai; time field me type hota hai.                                                                                                                                                                                                                                                                                                                |
| `ColorPicker`     | Bina alpha `#RRGGBB` (owner: product ka shade). Hex box me type, ya swatch button se picker: saturation/brightness area, Hue slider, `swatches` (tayaar shades). Arrow keys area aur slider chalate hain; grey pe bhi hue nahi khota.                                                                                                                                                                                                                                                                   |
| `HierarchySelect` | Tree (`HierarchyOption`: `children`), upar search: milne wale options, unke neeche sab, aur unke raaste ke branch khule; "N options found" screen reader ko. `selectable="leaf"` (default: sirf aakhri level, jaise product ki category) ya `"any"` (koi bhi level: filter me "Lips" = saare lip products). `selectionMode="multiple"`: boxes, "Clear all", "Done"; `any` me chuna branch apne neeche sab ko cover karta hai (wo ticked aur dhundhle, value me nahi). Enter aur Space dono chunte hain. |

Chhoti screen (640 px se kam) pe calendar neeche se aane wali sheet me khulta hai (popover phone pe kat jaata); baaki pickers popover me, jagah na ho to upar. Galti ke sandesh hamare English me: hamara `error`, ya date ki jaanch ("Choose 30/10/2026 or earlier.", "This date is not available.", "The end must not be before the start."); React Aria ke apne sandesh browser ki bhasha aur format me hote, isliye `validationBehavior: 'aria'` aur apna `validate`.

**axe ke do jaane-pehchane notes (WCAG nahi):** popover ke andar React Aria do chhupe "Dismiss" buttons rakhta hai (screen reader se band karne ke liye) jo dialog ke bahar hain: best-practice `region`. Doosri line wale options (`description`) ka naam sirf label hota hai aur doosri line description: `label-content-name-mismatch` (experimental); WCAG 2.5.3 poora hota hai kyunki dikhne wala label naam me hai.

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

<Select label="Skin type" options={SKIN_TYPES} value={skin} onChange={setSkin} clearable />
<ComboBox label="Brand" options={found} onSearch={setQuery} loading={isFetching} value={brand} onChange={setBrand} />
<DatePicker label="Date of birth" value={dob} onChange={setDob} maxValue={todayInIndia()} />
<DateRangePicker label="Offer valid" withTime minValue={todayInIndia()} value={validity} onChange={setValidity} />
<ColorPicker label="Shade colour" value={hex} onChange={setHex} swatches={BRAND_SHADES} />
<HierarchySelect label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
<HierarchySelect label="Areas" selectionMode="multiple" selectable="any" options={AREAS} value={areas} onChange={setAreas} />
```

## Motion (Framer Motion) sirf toast me

Owner ka faisla (2026-10-30, ARCHITECTURE §9.2): animations pehle CSS (styles package ki `animate-*`, Dialog aur Tooltip yahi use karte hain); Motion sirf wahan jahan CSS nahi kar sakta: toast ka nikalna (exit), baaki toasts ka khisakna (layout) aur swipe (drag). `LazyMotion` + `m`, aur `reducedMotion="user"` (system me "less motion" ho to animation nahi; CSS animations bhi styles `base.css` rok deta hai).

Naapa hua size (2026-10-30, playground ka production build, gzip): Motion ka chhota hissa main bundle me **~7.7 kB**; baaki features (`domMax`: drag + layout) alag chunk **31.8 kB**, jo `Toaster` render hone ke baad async aata hai (pehla paint nahi rokta). Kisi app ka koi aur component Motion import na kare: naya animation pehle CSS se.

## Playground

```bash
npm run playground --workspace @beautinique/frontend-components
```

http://localhost:5184: har component ke kaam karte examples (saare variants × tones, errors, code input, dialogs, tooltips, toasts, aur har picker apni value ke saath: 36 states, nakli server search, date of birth, offer ki validity, shades, categories, areas), app-shell ke frame aur theme switcher (light/dark) ke saath.

## Tests

`npm test --workspace @beautinique/frontend-components` (jsdom, Testing Library + user-event, har component pe axe; 108 tests): keyboard, focus, screen reader wiring, toast store, timers, pause, live regions, aur pickers ka har raasta (date tests device ka time zone New York rakh ke: IST wala badlaav device pe nirbhar nahi). Colour contrast, swipe, drag aur phone ki calendar sheet asli browser me check hote hain (axe-core playground pe, light aur dark).

## License

MIT © Nageshwar Pawar
