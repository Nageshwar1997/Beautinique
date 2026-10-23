# AGENTS.md — Beautinique

> **Status:** v1.0 (2026-10-23). Doosre AI coding tools (Codex, Cursor, Copilot, Gemini ...) ke liye. Asli niyam [CLAUDE.md](CLAUDE.md) me hain; yahan sirf wo hai jo kaam shuru karne se pehle jaanna zaroori hai. Farak ho to `CLAUDE.md` sahi hai.

Beautinique: Indian beauty e-commerce monorepo (npm workspaces, Node 24, npm 12.2+). Education + portfolio project hai, par har cheez asli production jaisi banti hai. Is pe 2 log kaam karte hain, aur kaam alag-alag AI tools ke beech haath badalta rehta hai.

## Kaam shuru karne se pehle (is order me)

1. [CLAUDE.md](CLAUDE.md): hamesha laagu niyam, commands, repo ka naksha.
2. [docs/HANDOFF.md](docs/HANDOFF.md): abhi ki halat, agla kaam, khule sawal, traps.
3. [docs/RULES.md](docs/RULES.md) (kaam ke niyam: Definition of Done, git, code, testing, security) aur [docs/TASKS.md](docs/TASKS.md) (task list), zaroorat ke hisaab se.

## Jo koi tool nahi rokta (aapko khud dhyan rakhna hai)

- Apps sirf English me (paise aur dates `en-IN` format me).
- Planning docs Hinglish me. Har doc ke top pe status (version + date), neeche change log: har badlav ki ek line. Code, identifiers aur comments English me.
- Mobile pe koi message nahi (na SMS, na WhatsApp, na OTP); OTP sirf email se.
- **Commit, push aur publish sirf insaan ke kehne pe.** `.env` files kabhi nahi kholni; secret, token ya password repo me kabhi nahi.
- Business decision owner ka hai: docs chup hon to recommendation ke saath poochho, phir jawab doc me likho.
- Production-grade, kuch bhi "baad me" nahi: naye code ke saath tests aur README. Mutation testing sirf [RULES §6](docs/RULES.md) ke hisaab se (kernel packages, paisa/stock/permissions), copy me, asli files me nahi: `npm run mutate -- --package <category>-<name>`.
- "Verified" tabhi likho jab asli action karke dekha ho. Test fail ho to output ke saath batao.

## CI jo pakadta hai (push se pehle khud chalao)

```bash
npm install
npm run build
npm run format:check
npm run lint
npm run typecheck
npm run infra:up   # tests ko Mongo + Valkey chahiye (Docker)
npm test
npm run verify -- --all --yes
```

- Imports/exports ka order **ESLint** (`simple-import-sort`) tay karta hai. File badalne ke baad `npx eslint <file> --fix`, phir `npx prettier --write <file>`. Editor ka "Organize Imports" mat chalao: wo alag order deta hai aur lint fail hota hai.
- `zod` sirf `@beautinique/shared-zod` se, `mongodb` sirf `@beautinique/backend-server-mongo` se; transaction ke andar `Promise.all` nahi. ESLint inhe rokta hai.

## Kaam rokte waqt

Chhote commits (Conventional Commits, jaise `feat(scope): ...`), sirf apne task ki files. [docs/HANDOFF.md](docs/HANDOFF.md) ke "Abhi ki halat" aur "Agla kaam" update karo: kya kiya, kya adhoora hai, kya uncommitted hai, kaunsa sawal kiske liye khula hai.

## Change log

| Version | Date       | Badlav                                          |
| ------- | ---------- | ----------------------------------------------- |
| v1.0    | 2026-10-23 | Pehla version: doosre AI tools ke liye pointer. |
