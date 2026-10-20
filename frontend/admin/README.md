# Beautinique Admin (`frontend/admin`)

SPA: Vite + React SPA (React Router data router). Dev server http://localhost:3003; `/api` gateway (localhost:8080) pe jata hai, bilkul Vercel rewrite jaisa.

## Commands

```bash
npm run dev --workspace admin
npm run build --workspace admin
npm test --workspace admin
```

## Structure

- `src/main.tsx`: app start (React Router data router).
- `src/routes.tsx`: route table; pages `src/pages/*.tsx` me.
- `src/layout.tsx`: skip link + page outlet.
- Styles: `@beautinique/frontend-styles` (tokens, fonts, utilities).
