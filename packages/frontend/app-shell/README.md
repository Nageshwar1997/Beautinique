# @beautinique/frontend-app-shell

Har Beautinique app ka **saanjha dhaancha** (ARCHITECTURE §9.2): skip link, header/footer ki jagah, ek `<main>`, bina flash ka theme switcher, nav list aur error page. **Header aur footer ka content har app ka apna hai** (customer: logo aur brand nav; internal apps: sidebar aur top bar), isliye ye package sirf unke tukde deta hai, poora header nahi.

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
import { AppFrame, ErrorPage, ThemeScript } from '@beautinique/frontend-app-shell';

export function Layout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        {/* meta, links ... */}
      </head>
      <body>
        <AppFrame header={<SiteHeader />} footer={<SiteFooter />}>
          {children}
        </AppFrame>
      </body>
    </html>
  );
}
```

## API

| Export                                                  | Kaam                                                                                                                                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppFrame({ header, footer, children })`                | Skip link (keyboard ka pehla stop) → header → `<main id="main">` (screen bhar, skip link ka target) → footer                                                                                            |
| `ThemeSwitcher`                                         | Light / Dark / System ka radio group (arrow keys, har option 44 px, chhupe naam). Turant badalta hai aur yaad rakhta hai; doosre tab ka badlav bhi follow karta hai. Storage band ho to is page ke liye |
| `ThemeScript`                                           | `<head>` me sabse pehle: saved theme pehle paint se pehle `<html theme>` pe. HTML sabke liye same rehta hai (CDN cache theek)                                                                           |
| `THEME_SCRIPT`, `THEME_SCRIPT_HASH`                     | Script ka text, aur CSP `script-src` ke liye uska hash (`unsafe-inline` ke bina); test hash check karta hai                                                                                             |
| `useThemeChoice()`, `setThemeChoice`, `readThemeChoice` | Choice padhna aur badalna (`'light' \| 'dark' \| 'system'`); server pe hamesha `system`, isliye hydration match                                                                                         |
| `NavList({ items, label })`                             | Nav landmark + links; chalu page pe `aria-current="page"`. Khaali `items` = kuch render nahi, isliye app sirf bane pages deti hai (koi dead link nahi)                                                  |
| `ErrorPage({ title, message, action })`                 | Error/404 ka content: ek `h1`, message, aur link (default home). Apna `<main>` nahi jodta                                                                                                               |

Theme `<html theme="light|dark">` pe lagta hai; attribute na ho to system setting ([frontend-styles](../styles/README.md)). Badalte waqt ek frame `theme-switching`, taaki saare rang ek saath badlein.

**Abhi nahi, jab app ko chahiye tab:** wake-up screen (Render cold start; T2.7 ke wake route ke saath), sidebar layout (internal apps), offline page, idle logout.

## Tests

`npm test --workspace @beautinique/frontend-app-shell`: theme script (saved theme, junk, storage band, CSP hash), switcher (keyboard, do switchers, doosra tab, server render), frame, nav, error page, aur har component pe axe (WCAG) check.

## Playground

```bash
npm run playground --workspace @beautinique/frontend-app-shell
```

http://localhost:5182: sample header/footer ke saath shell; Tab se skip link, arrow keys se theme, reload pe bina flash.
