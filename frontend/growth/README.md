# Beautinique Growth Studio (`frontend/growth`)

SPA: Vite + React SPA (React Router data router). Dev server http://localhost:3010; `/api` gateway (localhost:8080) pe jata hai, bilkul Vercel rewrite jaisa.

## Commands

```bash
npm run dev --workspace growth
npm run build --workspace growth
npm test --workspace growth
```

## Structure

- `src/main.tsx`: app start (React Router data router).
- `src/routes.tsx`: route table; pages `src/pages/*.tsx` me.
- `src/layout.tsx`: skip link + page outlet.
- Styles: `@beautinique/frontend-styles` (tokens, fonts, utilities).

## Live

Vercel project `beautinique-growth` (root `frontend/growth`, production branch `release`): https://beautinique-growth.vercel.app. Env `BQ_GATEWAY_URL` aur `ORIGIN_SECRET`; `vercel.json` `/api` ko gateway tak origin secret ke saath le jaata hai, har page `noindex`, baaki SPA. Render (`bq-live`) me `GATEWAY__APP_HOSTS`, `GATEWAY__VERCEL_PROJECTS` aur `NOTIFY__APP_URLS` me ye app ([TASKS.md](../../docs/TASKS.md) A.9).
