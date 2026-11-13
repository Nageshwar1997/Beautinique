# Beautinique Master (`frontend/master`)

SPA: Vite + React (React Router data router). Owners aur unki team ka app (Master, Head of Operations, Legal & Compliance, DPO, Security Officer ...): sign-up nahi, har page sign-in ke peeche (sirf sign-in, password, invitation, icon credits aur error pages khule). Pages (roles, approvals, emergency controls) abhi bane nahi: sign-in ke baad home "Coming soon" aur app ka kaam batata hai (owner, 2026-11-13: pehla Master yahin authenticator lagata hai). Dev server http://localhost:3005; `/api` `.env` ke gateway pe jaata hai, bilkul Vercel route jaisa.

## Setup

`.env.example` ka LOCAL hissa `.env` me copy karo (`BQ_GATEWAY_URL`, `ORIGIN_SECRET`); iske bina dev server saaf error ke saath rukta hai. Backend: `npm run infra:up`, phir `npm run dev:backend`.

## Commands

```bash
npm run dev --workspace master
npm run build --workspace master
npm test --workspace master
npm run e2e --workspace master
```

E2E (Playwright) ko `npm run infra:up` aur `npx playwright install chromium` chahiye; apne ports (app 3105, gateway 8093), isliye customer aur admin ke E2E ke saath bhi chal sakta hai.

## Kaise koi andar aata hai

1. **Pehla Master:** customer app me sign-up, phir `npm run db:grant-master -- --email <email>` (`--env live` live pe; [backend/bundle/README.md](../../backend/bundle/README.md)). Master ko koi invite nahi kar sakta (ARCHITECTURE §7.3), max 2.
2. **Baaki team:** Master invitation bhejta hai (abhi app me screen nahi; e2e `scripts/e2e/invite.ts` se); notify email karta hai. `/invitation`: wahi email, email ka code, aur naya account ho to password.
3. `/sign-in`: password, phir authenticator. Pehli baar authenticator lagta hai (Master app me zaroori, contracts `TOTP_REQUIRED_APPS`): QR ya key, pehla code, phir 10 recovery codes (save kiye bina aage nahi).
4. 28 min bina activity: "Are you still there?"; 30 min pe sign-out aur sign-in page pe wajah (auth-ui `IdleNotice`).

## Structure

- `src/main.tsx`: app start (`createBrowserRouter`), Sentry sirf jahan build me DSN ho.
- `src/routes.tsx`: route table. `RequireSignIn` ke andar home (`/`) aur account pages (`/account/security`, `/account/security/authenticator`, `/account/devices`).
- `src/root.tsx`: providers, wake-up screen (`ServerWake`), frame (top bar + footer), toasts; page aur root ke error screens.
- `src/providers.tsx`: API client (`app: 'master'`), Query cache, session, step-up dialog, `IdleNotice`.
- `src/nav.ts`: main nav (abhi khaali: ek hi page), footer, account links, page titles.
- `src/pages/*.tsx`: pages. Har page apna `<title>` deta hai (React 19).
- `vite.config.ts`: dev proxy `.env` se, `BQ_GATEWAY_URL` browser ko (wake-up call), theme script `<head>` me sabse pehle (`THEME_SCRIPT`, CSP hash ke liye byte for byte).
- `vercel.json`: `routes` me sirf `/api` → gateway (`x-origin-secret` Vercel env se), `headers` me har page pe `X-Robots-Tag: noindex` aur security headers, phir files, phir `rewrites` se har path pe `index.html` (SPA). Headers ki list aur jaanch `scripts/ci/test/vercel-headers.test.ts` (saare apps); poora CSP TASKS T6.6 me.
- `e2e/`: Playwright (joining, recovery code, phone width); invitation `scripts/e2e/invite.ts` se (role `master.head_of_operations`), baaki asli raasta. Idle sign-out admin ke e2e me (wahi auth-ui `IdleNotice`).
- Styles: `@beautinique/frontend-styles` + packages ki `tailwind.css` (`src/index.css`).

## Live (owner)

Vercel project `beautinique-master` (root `frontend/master`, production branch `release`): https://beautinique-master.vercel.app. Env `BQ_GATEWAY_URL` aur `ORIGIN_SECRET` (team ka shared env). Render (`bq-live`) me `GATEWAY__APP_HOSTS`, `GATEWAY__VERCEL_PROJECTS` aur `NOTIFY__APP_URLS` me ye app ([TASKS.md](../../docs/TASKS.md) A.9).
