# Beautinique Admin (`frontend/admin`)

SPA: Vite + React (React Router data router). Team ka app: sign-up nahi, har page sign-in ke peeche (sirf sign-in, password, invitation, icon credits aur error pages khule). Dev server http://localhost:3003; `/api` `.env` ke gateway pe jaata hai, bilkul Vercel route jaisa.

## Setup

`.env.example` ka LOCAL hissa `.env` me copy karo (`BQ_GATEWAY_URL`, `ORIGIN_SECRET`); iske bina dev server saaf error ke saath rukta hai. Backend: `npm run infra:up`, phir `npm run dev:backend`.

## Commands

```bash
npm run dev --workspace admin
npm run build --workspace admin
npm test --workspace admin
npm run e2e --workspace admin
```

E2E (Playwright) ko `npm run infra:up` aur `npx playwright install chromium` chahiye; apne ports (app 3103, gateway 8091), isliye customer ke E2E ke saath bhi chal sakta hai.

## Kaise koi andar aata hai

1. Master (ya apne state ka State Admin) invitation bhejta hai; notify email karta hai.
2. `/invitation`: wahi email, email ka code, aur naya account ho to password.
3. `/sign-in`: password, phir authenticator. Pehli baar authenticator lagta hai (admin me zaroori, contracts `TOTP_REQUIRED_APPS`): QR ya key, pehla code, phir 10 recovery codes (save kiye bina aage nahi).
4. 28 min bina activity: "Are you still there?"; 30 min pe sign-out aur sign-in page pe wajah (auth-ui `IdleNotice`).

## Structure

- `src/main.tsx`: app start (`createBrowserRouter`).
- `src/routes.tsx`: route table. `RequireSignIn` ke andar dashboard (`/`) aur account pages (`/account/security`, `/account/security/authenticator`, `/account/devices`).
- `src/root.tsx`: providers, wake-up screen (`ServerWake`), frame (top bar + footer), toasts; page aur root ke error screens.
- `src/providers.tsx`: API client (`app: 'admin'`), Query cache, session, step-up dialog, `IdleNotice`.
- `src/nav.ts`: main nav (abhi khaali: ek hi page), footer, account links, page titles.
- `src/pages/*.tsx`: pages. Har page apna `<title>` deta hai (React 19).
- `vite.config.ts`: dev proxy `.env` se, `BQ_GATEWAY_URL` browser ko (wake-up call), theme script `<head>` me sabse pehle (`THEME_SCRIPT`, CSP hash ke liye byte for byte).
- `vercel.json`: `/api` → gateway (`x-origin-secret` Vercel env se), har page pe `X-Robots-Tag: noindex` aur security headers (iframe me nahi khulta, nosniff, `Referrer-Policy`, camera/mic/location band, HSTS), phir files, phir har path pe `index.html` (SPA). Headers ki list aur jaanch `scripts/ci/test/vercel-headers.test.ts` (saare apps); poora CSP TASKS T6.6 me.
- `e2e/`: Playwright; invitation `scripts/e2e/invite.ts` se (Master app abhi nahi), baaki asli raasta.
- Styles: `@beautinique/frontend-styles` + packages ki `tailwind.css` (`src/index.css`).

## Live (owner)

Vercel project (root `frontend/admin`, production branch `release`), env `BQ_GATEWAY_URL` aur `ORIGIN_SECRET`. Render (`bq-live`) me: `GATEWAY__APP_HOSTS` me `,admin=<host>`, `GATEWAY__VERCEL_PROJECTS` me `,admin=<project>`, `NOTIFY__APP_URLS` me `,admin=https://<host>` (TASKS A.9).
