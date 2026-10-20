# Beautinique (`frontend/customer`)

SSR: React Router framework mode (server-rendered). Dev server http://localhost:3001; `/api` gateway (localhost:8080) pe jata hai, bilkul Vercel rewrite jaisa.

## Commands

```bash
npm run dev --workspace customer
npm run build --workspace customer
npm test --workspace customer
```

## Structure

- `app/root.tsx`: HTML layout, skip link, error page (404 bhi).
- `app/routes.ts`: route table; pages `app/routes/*.tsx` me.
- `react-router.config.ts`: SSR on.
- Styles: `@beautinique/frontend-styles` (tokens, fonts, utilities).
