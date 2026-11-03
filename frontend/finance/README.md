# Beautinique Finance (`frontend/finance`)

SPA: Vite + React SPA (React Router data router). Dev server http://localhost:3007; `/api` gateway (localhost:8080) pe jata hai, bilkul Vercel rewrite jaisa.

## Commands

```bash
npm run dev --workspace finance
npm run build --workspace finance
npm test --workspace finance
```

## Structure

- `src/main.tsx`: app start (React Router data router).
- `src/routes.tsx`: route table; pages `src/pages/*.tsx` me.
- `src/layout.tsx`: skip link + page outlet.
- Styles: `@beautinique/frontend-styles` (tokens, fonts, utilities).

## Live

Vercel project `beautinique-finance` (root `frontend/finance`, production branch `release`): https://beautinique-finance.vercel.app. Env `BQ_GATEWAY_URL` aur `ORIGIN_SECRET`; `vercel.json` `/api` ko gateway tak origin secret ke saath le jaata hai, har page `noindex`, baaki SPA. Render (`bq-live`) me `GATEWAY__APP_HOSTS`, `GATEWAY__VERCEL_PROJECTS` aur `NOTIFY__APP_URLS` me ye app ([TASKS.md](../../docs/TASKS.md) A.9).
