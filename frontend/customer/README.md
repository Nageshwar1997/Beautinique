# Beautinique (`frontend/customer`)

SSR: React Router framework mode (server-rendered). Dev server http://localhost:3001; `/api` gateway (localhost:8080) pe jata hai, bilkul Vercel rewrite jaisa.

## Commands

```bash
npm run dev --workspace customer
npm run build --workspace customer
npm test --workspace customer
```

## Structure

- `app/root.tsx`: HTML layout. `<head>` me sabse pehle `ThemeScript` (saved theme bina flash), phir `AppFrame` (`@beautinique/frontend-app-shell`) is app ke header aur footer ke saath; error page (404 bhi) shell ka `ErrorPage`: 404 pe asli 404 status, baaki errors pe "Try again" aur development me technical details; dono ka apna title aur `noindex`.
- `app/components/SiteHeader.tsx`, `SiteFooter.tsx`: customer app ka apna header (logo, nav, theme switcher) aur footer (demo note, footer links). Har app ka header/footer alag hota hai; shell sirf tukde deta hai.
- `app/nav.ts`: main aur footer nav. **Sirf bane pages** yahan aate hain, isliye koi dead link nahi; Categories, Search, Cart, Account (aur phone ka bottom nav, DESIGN §10) pages bante hi judenge.
- `app/routes.ts`: route table; pages `app/routes/*.tsx` me.
  - `home.tsx`: landing (M2): hero, "Why Beautinique", launch categories (abhi links nahi; M4 me catalog se), "How it works". **Kisi shehar ya state ka naam code me nahi** (PRD §7.2: jagah data hai); launch area baad me network data se aayega.
  - `credits.tsx`: "Icon credits" (Solar CC BY 4.0 ka credit zaroori hai; `ICON_CREDITS` se).
  - `devtools-json.ts`: Chrome DevTools localhost pe `/.well-known/appspecific/com.chrome.devtools.json` maangta hai; ye route chup-chaap `404` deta hai, warna React Router har baar server log me "No route matches URL" error stack chhaapta.
- `public/favicon.svg` (asli icon) aur `public/favicon.ico` (16, 32, 48 px PNG, isi SVG se Chromium canvas me banaya): kuch browsers aur tools `/favicon.ico` maangte hain; uske bina React Router har baar "No route matches" error log karta. SVG badle to `.ico` bhi dobara banana (test uski banawat check karta hai).
- Install (home screen, app switcher, splash): `public/manifest.webmanifest`, `public/icons/icon-{192,512}.png` (ivory rounded tile pe mark), `icon-maskable-{192,512}.png` (poora ivory, mark 80% safe circle ke andar) aur `public/apple-touch-icon.png` (180 px). Ye `@beautinique/frontend-icons` ke `BrandMark` ke paths se browser canvas me bane; logo badle to dobara banana (test manifest aur har PNG ka size check karta hai). Header me `BrandLogo`, footer me `BrandLogo monochrome`.
- `react-router.config.ts`: SSR on.
- Styles: `@beautinique/frontend-styles` + `@beautinique/frontend-app-shell/tailwind.css` (`app/app.css`).

## Tests

Har page pe axe (WCAG) check, headings ka order, koi dead link nahi, aur landing pe koi shehar/state ka naam nahi.
