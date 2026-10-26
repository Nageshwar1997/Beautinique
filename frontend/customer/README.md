# Beautinique (`frontend/customer`)

SSR: React Router framework mode (server-rendered). Dev server http://localhost:3001; `/api` gateway pe jata hai, bilkul Vercel route jaisa. Pehli baar `.env.example` ko `.env` me copy karo: dev server ka proxy `BQ_GATEWAY_URL` (laptop: `http://localhost:8080`) aur `ORIGIN_SECRET` (laptop ka public secret) wahi se leta hai, Vercel wale naamon se; `.env` na ho to dev server saaf error deta hai. Build aur lint ko `.env` nahi chahiye.

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
- Wake-up screen: `root.tsx` frame ko `ServerWake app="customer"` (app-shell) me lapetta hai: browser me ek baar `GET /api/v1/platform/wake`, aur live server so raha ho (Render cold start ~1 min) to "Waking up the server" screen. Laptop pe backend band ho to bhi ye screen aati hai: `npm run dev:backend` chalao.
- `react-router.config.ts`: SSR on.
- Styles: `@beautinique/frontend-styles` + `@beautinique/frontend-app-shell/tailwind.css` (`app/app.css`).

## Deploy (Vercel)

Vercel project ka Root Directory `frontend/customer`, production branch `release` (ARCHITECTURE §9.3, §11.5). `vercel.json`:

- **Install:** repo root pe npm 12.2.0, phir `npm ci` (root `devEngines` npm 12 maangta hai; Vercel pe npm 11 hota hai).
- **Build:** repo root pe `npm run build -- --for customer`: ye app aur iske internal packages (`dist` commit nahi hota), dependencies pehle.
- **`/api/(.*)`** → `${BQ_GATEWAY_URL}/api/$1`, aur `x-origin-secret` header `$ORIGIN_SECRET` se `set` (browser ka bheja hua header badal jaata hai; ARCHITECTURE §7.2). Plain `rewrites` header nahi jod sakta, isliye `routes`.
- **Functions:** `bom1` (Mumbai), Indian users ke paas.

Vercel env (Production **aur** Preview), repo me kabhi nahi:

| Key              | Value                                                                            |
| ---------------- | -------------------------------------------------------------------------------- |
| `ORIGIN_SECRET`  | Wahi secret jo Render ke `GATEWAY__ORIGIN_SECRETS` me hai (Sensitive)            |
| `BQ_GATEWAY_URL` | Render service ka URL, jaise `https://bq-live.onrender.com` (aakhir me `/` nahi) |

`test/vercel-config.test.ts` dekhta hai ki route aur transform env se hi lein, aur file me koi URL ya secret na ho. React Router 8 ke liye Vercel ka `@vercel/react-router` preset nahi lagaya (wo sirf React Router 7 maangta hai); pehla preview build hi batayega ki Vercel bina preset ke SSR theek chalata hai.

## Tests

Har page pe axe (WCAG) check, headings ka order, koi dead link nahi, aur landing pe koi shehar/state ka naam nahi.
