# @beautinique/frontend-app-shell

Har Beautinique app ka **saanjha dhaancha** (ARCHITECTURE §9.2): skip link, header/footer ki jagah, ek `<main>`, bina flash ka theme switcher, nav list, error page aur wake-up screen. **Header aur footer ka content har app ka apna hai** (customer: logo aur brand nav; internal apps: sidebar aur top bar), isliye ye package sirf unke tukde deta hai, poora header nahi.

## Install

```bash
npm install @beautinique/frontend-app-shell
```

Peer: `react`, `react-router`. App ki CSS me (tailwindcss aur styles ke baad):

```css
@import 'tailwindcss';
@import '@beautinique/frontend-styles';
@import '@beautinique/frontend-app-shell/tailwind.css';
```

Tailwind `node_modules` nahi padhta, jahan ye package app me hota hai; `tailwind.css` uske components ki classes Tailwind ko dikhata hai. Ye line na ho to switcher aur nav bina style ke dikhenge.

## Server-rendered app (customer) me

```tsx
import {
  AppFrame,
  ErrorPage,
  ServerWake,
  ThemeScript,
  WakeScript,
} from '@beautinique/frontend-app-shell';

export function Layout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <WakeScript />
        {/* meta, links ... */}
      </head>
      <body>
        <ServerWake app="customer">
          <AppFrame header={<SiteHeader />} footer={<SiteFooter />}>
            {children}
          </AppFrame>
        </ServerWake>
      </body>
    </html>
  );
}
```

## API

| Export                                                  | Kaam                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppFrame({ header, footer, children })`                | Skip link (keyboard ka pehla stop) → header → `<main id="main">` (screen bhar, skip link ka target) → footer                                                                                                                                                                                    |
| `ThemeSwitcher`                                         | Light / Dark / System ka radio group (arrow keys, har option 44 px, chhupe naam). Turant badalta hai aur yaad rakhta hai; doosre tab ka badlav bhi follow karta hai. Storage band ho to is page ke liye                                                                                         |
| `ThemeScript`                                           | `<head>` me sabse pehle: saved theme pehle paint se pehle `<html theme>` pe. HTML sabke liye same rehta hai (CDN cache theek)                                                                                                                                                                   |
| `THEME_SCRIPT`, `THEME_SCRIPT_HASH`                     | Script ka text, aur CSP `script-src` ke liye uska hash (`unsafe-inline` ke bina); test hash check karta hai                                                                                                                                                                                     |
| `useThemeChoice()`, `setThemeChoice`, `readThemeChoice` | Choice padhna aur badalna (`'light' \| 'dark' \| 'system'`); server pe hamesha `system`, isliye hydration match                                                                                                                                                                                 |
| `NavList({ items, label })`                             | Nav landmark + links; chalu page pe `aria-current="page"`. Khaali `items` = kuch render nahi, isliye app sirf bane pages deti hai (koi dead link nahi)                                                                                                                                          |
| `SectionLayout({ title, items, children })`             | Data-dense app ka section (DESIGN §10): md se sidebar me section ke pages, phone pe page ke upar links ki row; ek hi nav landmark (`title` naam), chalu page `aria-current`. Khaali `items` = sirf page. App items pehle haq ke hisaab se chhaanti hai (authz `useVisible`). (2026-11-14, T3.7) |
| `ErrorPage(props)`                                      | Error/404 ka content (neeche). Apna `<main>` nahi jodta                                                                                                                                                                                                                                         |
| `IconCreditsPage`                                       | Har app ka "Icon credits" page (DESIGN §11, CC BY): icon set, author aur license. App route aur title deta hai                                                                                                                                                                                  |
| `ServerWake({ app, children, onReady? })`               | Live server jagana aur wake-up screen (neeche)                                                                                                                                                                                                                                                  |
| `wakeServer`, `useServerWake`, `WAKE_URL`               | Wahi bina screen ke: wake call (retry, timeout, signal) aur uska React hook                                                                                                                                                                                                                     |
| `WakeScript`                                            | Server-rendered app ke `<head>` me, `ThemeScript` ke baad: pehle paint se parda (upar)                                                                                                                                                                                                          |
| `WAKE_SCRIPT`, `WAKE_SCRIPT_HASH`                       | Script ka text, aur CSP `script-src` ke liye uska hash (test milata hai)                                                                                                                                                                                                                        |
| `WAKE_CHECK_ATTRIBUTE`, `isCrawler`                     | `<html>` ka attribute (`data-server-check`) aur crawler ki pehchaan                                                                                                                                                                                                                             |
| `reportError`, `useReportError`, `setErrorReporter`     | Unexpected error bhejna (error screens se); monitoring judne tak max 10 intezaar karti hain                                                                                                                                                                                                     |
| `/monitoring`: `initMonitoring`, `replay`               | Browser Sentry, alag entry jo app page shuru hone ke baad load kare (neeche)                                                                                                                                                                                                                    |

### ErrorPage

```tsx
<ErrorPage status={404} title="Page not found" message="..." />                 // 404: khaali compact
<ErrorPage kind="error" title="Something went wrong" details={devOnlyStack} />   // "Oops": toota compact, "Try again"
<ErrorPage kind="error" status={503} title="We will be right back" reference={requestId} />
```

| Prop        | Kaam                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `title`     | Page ka ek `h1`                                                                                                          |
| `message`   | Ek-do line, kya hua aur ab kya karein                                                                                    |
| `kind`      | `not-found` (default): bade code ke 0 khaali compact. `error`: compact toota, powder girta hai                           |
| `status`    | "Error 404" text me aur bada bana hua. Na ho to not-found pe `404`, error pe `Oops` (O compact)                          |
| `actions`   | `{ label, to }` (link) ya `{ label, onClick }` (button); pehla main. Default: home; error pe "Try again" (reload) + home |
| `reference` | Request id jo user support ko bata sake (DESIGN §6)                                                                      |
| `details`   | Developer ke liye message/stack, band `<details>` me. **Sirf development me do**                                         |

- **"Go back"** apne aap aata hai jab tab me isi app ka pichhla page ho: React Router ki `history.state.idx` > 0 (pehle page ko bhi key milti hai, isliye `location.key` se pata nahi chalta). Server ko history nahi pata, isliye wo hamesha "nahi" kehta hai aur browser hydration ke baad decide karta hai (`useSyncExternalStore`): reload pe hydration mismatch nahi.
- **Art** (`src/error-art.tsx`): code ka har `0`/`O` ek powder compact (rose case, khaali metal pan ya toota gold powder), peeche powder ke dhabbe aur specks. Sab `aria-hidden`; code text me "Error 404" se aata hai. Rang sirf theme tokens (light, dark, high contrast). Motion `tailwind.css` ke keyframes se (`compact-float`, `compact-jolt`, `crumb-fall`, `sparkle`, `powder-drift`, `speck-twinkle`); reduced motion pe sab ruk jata hai.

Theme `<html theme="light|dark">` pe lagta hai; attribute na ho to system setting ([frontend-styles](../styles/README.md)). Badalte waqt ek frame `theme-switching`, taaki saare rang ek saath badlein.

### ServerWake (DESIGN §6, ARCHITECTURE §11.1, TASKS T2.7)

Free Render service 15 min khaali rehne pe so jaati hai aur jaagne me ~1 min leti hai. Har app apne frame ko `ServerWake` me lapet-ta hai:

- **Server ke jawab se pehle koi page nahi (owner, 2026-11-05):** app ke upar ek saada parda (page ka background, 400 ms baad ek patli progress bar, koi shabd nahi, `aria-hidden`; app `inert` aur `aria-busy`). Browser me hydration ke baad ek baar `GET /api/v1/platform/wake` (contracts `platform.server.wake`, header `X-BQ-App`, `cache: 'no-store'`); jawab aate hi parda hat jaata hai. Server-rendered app (customer) `<head>` me `WakeScript` bhi rakhe: wo pehle paint se pehle `<html data-server-check>` lagata hai, aur `tailwind.css` ka niyam parda sirf tab dikhata hai, to prerendered page kabhi "dikha, phir dhaka" nahi hota. Browser-only app (admin) ko script nahi chahiye: `ServerWake` pehle paint se pehle attribute lagata hai.
- **Crawler (user agent me `bot`/`crawler`/`spider`) aur bina JS:** parda nahi, wake call nahi; server ka HTML `inert` nahi. JS kabhi na chale (files load na hon) to CSS 10 s baad parda hata deti hai.
- 1.5 s me jawab na aaye to parde ki jagah poori screen pe modal (`role="dialog"`, `aria-modal`): powder compact, "Waking up the server", `progress-indeterminate` bar aur "Waiting 0:42". Peeche ka app `inert` rehta hai, focus screen pe. Jawab aate hi screen hat jaati hai.
- 5xx, 429, network error ya 30 s tak jawab nahi = "abhi nahi jaaga": 3 s baad dobara. Koi bhi aur jawab (error bhi) = server jaaga hua hai.
- **`kickUrl`** (server ka apna `/wake`, seedha): "abhi nahi jaaga" pe ek `no-cors` request bhi jaati hai, 15 s me max ek baar (`kickEveryMs`). Soye Render service ko app ke Vercel route ki request nahi jagati, seedhi request jagati hai (live jaanch 2026-10-26). Jawab padha nahi jaata, zaroorat bhi nahi; isme app ka header ya secret nahi jaata. `kickUrl` na ho to ye request nahi.
- 150 s me na jaage to "The server is taking too long", focus "Try again" pe; sirf "Try again", server ke bina app me jaane ka raasta nahi (owner, 2026-11-07; "Continue anyway" hata).
- `onReady`: server ke jawab pe ek baar (crawler ke liye turant). App ise API client ke `serverReady()` se jodta hai (`waitForServer`), taaki jawab se pehle koi call na jaaye (QA-FE-009; customer aur admin ka `AppWake`).
- Dono calls axios se (RULES §3.8), uske **fetch adapter** se: `no-cors` aur `cache: 'no-store'` sirf fetch me hain, axios ke XMLHttpRequest me nahi. Wake call me sirf `X-BQ-App` jaata hai, kick me koi header nahi (axios ke apne `Accept`/`User-Agent` bhi band).
- Timings props se badalti hain (`slowAfterMs`, `attemptTimeoutMs`, `retryDelayMs`, `giveUpAfterMs`, `kickEveryMs`); `fetch` sirf tests aur playground ke liye, axios ke fetch adapter ko diya jaata hai (wahi function rakho, naya function hook ko dobara shuru karta hai).
- Laptop pe backend band ho to dev server ka proxy 502 deta hai, isliye wake-up screen dikhti hai: `npm run dev:backend` chalao (wahi asli raasta).

**Abhi nahi, jab app ko chahiye tab:** sidebar layout (internal apps), offline page, idle logout.

### Monitoring (`@beautinique/frontend-app-shell/monitoring`, ARCHITECTURE §14)

Browser ki errors Sentry project `bq-frontend` me. Apna alag entry, jise app page shuru hone ke baad `import()` se laaye, aur sirf jab build me DSN ho:

```ts
const dsn = import.meta.env.BQ_SENTRY_DSN;
if (dsn !== undefined && dsn !== '') {
  void import('@beautinique/frontend-app-shell/monitoring')
    .then(({ initMonitoring, replay }) => {
      initMonitoring({ app: 'customer', dsn, integrations: [replay()] });
    })
    .catch(() => undefined);
}
```

- **Sirf apni errors:** apni origin ki scripts (`allowUrls`); extensions ki nahi; "Failed to fetch", "Network Error", abort jaisi network wali nahi; crawler, headless aur `navigator.webdriver` pe band; ek page se max `MAX_EVENTS_PER_PAGE` (10).
- **Data:** URL bina query aur `#`, email `[email]` aur 6+ ank `[number]`, koi user, IP, cookie ya body nahi; headers me sirf User-Agent; console breadcrumbs aur page-load session nahi; SDK ka `enhanceFetchErrorMessages` band (app ke error messages waise hi).
- **Route ki errors** browser ke handlers tak nahi pahunchti: error screen `useReportError(error, unexpected)` bulaye (404 aur 500 se kam ke answers nahi). `reportError` monitoring judne se pehle ki errors (max 10) rakhta hai.
- **Replay** (`replay()`) sirf customer me: error wale sessions ka `REPLAY_ON_ERROR_SAMPLE_RATE` (20%), saara text, inputs aur media chhupa.

## Tests

`npm test --workspace @beautinique/frontend-app-shell`: theme script (saved theme, junk, storage band, CSP hash), switcher (keyboard, do switchers, doosra tab, server render), frame, nav, error page (dono kind, actions, browser history pe "Go back", reload ke baad bina mismatch hydration, server render, reference, details), wake-up (`wakeServer`: retry, har call ka timeout, deadline, abort; `ServerWake`: jawab tak saada parda + `inert`/`aria-busy`, jaldi jawab pe wake-up screen nahi, der pe screen + `inert` + focus, "Try again", "Continue anyway", crawler ko na parda na call, unmount pe attribute hatna, server render me app bina `inert` aur CSS wala parda, server HTML pe bina mismatch hydration, path contracts ke route se; `WAKE_SCRIPT`: `<html>` mark, crawler nahi, hash), aur har component pe axe (WCAG) check.

## Playground

```bash
npm run playground --workspace @beautinique/frontend-app-shell
```

http://localhost:5182: sample header/footer ke saath shell; Tab se skip link, arrow keys se theme, reload pe bina flash. Error pages: `/missing` (404), `/error` (Oops + details), `/503`. Wake-up screen: `/wake` (nakli server: 8 s me jawab, ya kabhi nahi; 10 s me "taking too long").
