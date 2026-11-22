# @beautinique/frontend-authz

> **Status:** v1.0.0 (2026-11-13). TASKS T3.7 (owner ka faisla, 2026-11-13).

Sign-in kiye account ko **is app me kya karne ka haq hai** (ARCHITECTURE §9.2): `usePermission`, `<Can>`, route guard (`RequirePermission`) aur nav filtering. Ye identity ke `GET /iam/me` ke `access` se chalta hai: is app me abhi active grants ke roles (scope ke saath) aur unki permission keys, wahi keys jo gateway check karta hai.

**Ye sirf dikhane ke liye hai.** App wahi button, link aur page dikhata hai jo account ke haq me hain, taaki koi bekaar button na dikhe jo har baar fail ho. Asli faisla har call pe server ka hi hai (gateway ka mota check aur service ka apna; ARCHITECTURE §7.3). Isliye UI me koi check chhoot bhi jaye to bhi kuch khulta nahi, sirf ek 403 aata hai.

## Install

```bash
npm install @beautinique/frontend-authz
```

Peer: `react` 19. App `@beautinique/frontend-auth-ui` ke `SessionProvider` ke andar ho (hooks session padhte hain).

```tsx
import { Can, RequirePermission, usePermission, useVisible } from '@beautinique/frontend-authz';
```

## API

| Export                                            | Kaam                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAccess()`                                     | Session ka `access` (`{ roles, permissions }`); session pata na ho ya signed out ho to `NO_ACCESS` (kuch nahi).                                                                                                                                                                       |
| `usePermission(need, { match })`                  | `need`: ek key ya keys ki list. List me default sab keys chahiye; `match: 'any'` pe koi ek. Khaali list = kuch nahi chahiye (`true`).                                                                                                                                                 |
| `useVisible(items)`                               | Items (nav links, cards ...) me se wahi jo account dekh sakta hai, unke order me. Jis item pe `permission` nahi, wo hamesha rehta hai.                                                                                                                                                |
| `<Can permission match fallback>`                 | Children sirf haq wale ko; warna `fallback` (default kuch nahi).                                                                                                                                                                                                                      |
| `<RequirePermission permission match denied>`     | Signed-in page ka guard (auth-ui ke `RequireSignIn` ke andar): haq ho to page, warna `denied` (app ka apna "not for your role" page). Typed link se bhi wahi.                                                                                                                         |
| `allows(access, need, { match })`                 | Upar wale hooks ka pure function: React ke bahar, tests aur loaders me.                                                                                                                                                                                                               |
| `visibleTo(access, items)`                        | `useVisible` ka pure function.                                                                                                                                                                                                                                                        |
| `holdsRole(access, role)`, `roleKeysOf(access)`   | Account ke paas ye role hai ya nahi; uske role keys (har ek ek baar). Jaise "ye role kaun de sakta hai" (`appointedBy`) se milana. Fixed role ke saath kabhi nahi (`holdsRole(access, 'master.master')` ESLint `bq/no-role-comparison` rokta hai): faisla permission se (RULES §3.5). |
| `Access`, `HeldRole`, `PermissionNeed`, `Guarded` | Types. `Guarded`: `{ permission?, match? }`, kisi bhi item me jodo.                                                                                                                                                                                                                   |
| `NO_ACCESS`                                       | Kuch nahi: `{ roles: [], permissions: [] }`.                                                                                                                                                                                                                                          |

Keys poori milti hain, kabhi prefix se nahi (`iam.grant` kuch nahi kholta). Scope ka check (jaise State Admin sirf apne state me) abhi server pe hi hai; frontend ka scope check T4.1 ke `authorize()` ke saath.

## Examples

```tsx
// nav: sirf jinke paas key hai
const MAIN_NAV = [{ label: 'Staff', to: '/staff', permission: 'iam.grant.read' }];
const items = useVisible(MAIN_NAV);

// button
<Can permission="iam.grant.manage">
  <Button onPress={invite}>Invite someone</Button>
</Can>

// route
{ path: '/staff/roles', element: <RequirePermission permission="iam.grant.read" denied={<NotForYourRole />}><RolesPage /></RequirePermission> }
```

## Purana identity

`/iam/me` ka `access` contract me default khaali hai: release me app (Vercel) identity (Render) se pehle live ho jaye to app chalta rehta hai, bas kuch extra nahi dikhata jab tak naya identity jawab na de.

## Change log

| Version | Date       | Badlav                                                                                                              |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-11-13 | Pehla: `useAccess`, `usePermission`, `useVisible`, `Can`, `RequirePermission`, `allows`, `visibleTo`, role helpers. |

## License

MIT © Nageshwar Pawar
