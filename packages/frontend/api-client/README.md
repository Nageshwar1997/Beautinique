# @beautinique/frontend-api-client

Har Beautinique app ka **ek hi API client** (ARCHITECTURE §9.2, RULES §5.8): contracts ke routes gateway tak **axios** se (owner, 2026-10-31), app ki HttpOnly cookies ke saath (page ko token kabhi nahi dikhta). Ek waqt me ek refresh, refresh ke beech requests line me, step-up, har retry pe wahi Idempotency-Key, aur TanStack Query hooks. Apps seedha `axios`/`fetch` nahi bulati, sirf ye client.

## Install

```bash
npm install @beautinique/frontend-api-client @tanstack/react-query
```

Peers: `react` 19, `@tanstack/react-query` 5. Dependencies: `axios`, `@beautinique/shared-contracts`, `@beautinique/frontend-hooks` (online status).

```tsx
import { ApiProvider, createApiClient, createQueryClient } from '@beautinique/frontend-api-client';

// app me ek baar (module scope)
export const api = createApiClient({ app: 'customer' });
const queryClient = createQueryClient();

<ApiProvider client={api} queryClient={queryClient}>
  <App />
</ApiProvider>;
```

## Client

| Export                                 | Kaam                                                                                                                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createApiClient(options)`             | `{ app, baseUrl = '/api/v1', fetch?, validateResponses = true, onlineStatus? }`. Har request pe `X-BQ-App` aur `Accept: application/json`.                                                        |
| `client.call(route, request, options)` | Route ka `data` (route ke `output` schema se check), ya `ApiError`. `request` = `{ params, query, body }` (route ke hisaab se typed); `options` = `{ signal, idempotencyKey }`.                   |
| `client.refresh()`                     | Refresh cookie se naya access token, ek waqt me ek (saath aaye callers ek hi refresh baant'te hain). `false` = session nahi bacha; offline/server down pe error.                                  |
| `client.setStepUpHandler(handler)`     | `STEP_UP_REQUIRED` pe kaun poochhe (auth-ui ka dialog): `(error) => Promise<boolean>`. Hatane wala function lautata hai (sirf apna handler hatata hai).                                           |
| `client.onSessionChange(listener)`     | `'signed-in' \| 'signed-out'`: is tab ke, refresh fail hone ka `signed-out`, aur usi app ke doosre tabs ke (BroadcastChannel `bq:<app>:session`).                                                 |
| `client.sessionChanged(change)`        | App ne sign in/out kiya: is tab ke listeners aur doosre tabs ko batao. Listener ko event pe `/iam/me` dobara padhna chahiye, event pe aankh band bharosa nahi (do tab ek saath badal sakte hain). |
| `client.dispose()`                     | Doosre tabs ko sunna band (tests).                                                                                                                                                                |
| `API_BASE_URL`                         | `/api/v1`: har app ka apna host, `/api` Vercel ke raaste gateway tak (ARCHITECTURE §7.2).                                                                                                         |

**`call` ke niyam:**

1. **Refresh:** `401 UNAUTHENTICATED` (access token khatam) pe ek refresh, phir wahi call **ek baar** dobara. Dobara bhi 401 to error (loop nahi).
2. **Line:** refresh chal raha ho to nayi call uske khatam hone ka intezaar karti hai, purane cookie ke saath nahi jaati.
3. **Doosra tab (409 `REFRESH_IN_PROGRESS`):** doosre tab ne abhi refresh kiya; uske naye cookies is tab ke bhi hain. Client 300 ms (`OTHER_TAB_REFRESH_WAIT_MS`) ruk ke call dobara bhejta hai, **refresh dobara nahi**: purane refresh token se dobara poochhna chori jaisa dikhta (session band, ARCHITECTURE §7.2).
4. **Session khatam (`SESSION_EXPIRED`):** listeners ko `signed-out` (sirf is tab me), call fail. Offline ya 5xx pe `signed-out` nahi.
5. **Step-up:** `401 STEP_UP_REQUIRED` pe handler (ek saath kai calls = ek dialog); `true` pe wahi request dobara, `false` ya handler na ho to error.
6. **Idempotency-Key:** jis route ko chahiye, uski har try (pehli, refresh ke baad, step-up ke baad) pe **ek hi key**; `idempotencyKey` diya ho to wahi.
7. **Errors:** hamara error body → `ApiError` (code, message, status, requestId, details); doosra jawab status se (`INTERNAL` 5xx, warna `BAD_REQUEST`); jawab hi nahi = `NETWORK_ERROR` (status 0); bina `data` ya contract se alag jawab = `INVALID_RESPONSE`. Caller ka apna abort `signal.reason` (AbortError) hi lautata hai.
8. **Online status:** koi bhi jawab (error page bhi) = `confirmOnline()`, jawab nahi = `recheck()` (default hooks ka `onlineStatusStore`, jise `useOnlineStatus` padhta hai); caller ka abort kuch nahi kehta.
9. **Transport:** browser me axios ka apna adapter (XMLHttpRequest), server pe `http`. `fetch` diya ho to axios ka fetch adapter (tests, ya server jo apna fetch laaye); us raaste pe `baseUrl` poora URL ho (`new Request` relative URL nahi leta). Query contracts ke client jaisi: list ke har item ka apna naam (`tag=a&tag=b`), Date ISO me, `null`/`undefined` chhoot.

## TanStack Query

| Export                                   | Kaam                                                                                                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ApiProvider({ client, queryClient })`   | Client aur Query cache dono.                                                                                                                                                |
| `useApiClient()`                         | Sabse paas wale `ApiProvider` ka client (bina provider error).                                                                                                              |
| `createQueryClient()`                    | Query cache: 4xx pe dobara nahi (server ka faisla pakka), network/5xx pe 2 baar aur.                                                                                        |
| `useApiQuery(route, request?, options?)` | Sirf GET routes (TypeScript rokta hai). Key contracts ka `queryKey(route, request)`; bina input route pe `useApiQuery(getMe)`.                                              |
| `useApiMutation(route, options?)`        | Write. Idempotency wale route pe: wahi request success se pehle dobara = **wahi key** (retry); badli request ya success ke baad = nayi key. Bina input route pe `mutate()`. |
| `queryKey`, `queryKeyPrefix`             | Contracts se (invalidate ke liye: `queryClient.invalidateQueries({ queryKey: queryKeyPrefix('iam') })`).                                                                    |

## Errors

| Export                     | Kaam                                                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ApiError`                 | Contracts ki class (`code`, `message`, `status`, `requestId`, `details`).                                                                                                                                          |
| `isApiError(error, code?)` | `ApiError` hai (aur ye code).                                                                                                                                                                                      |
| `errorMessage(error)`      | User ko dikhane wala sentence: server ka message (user ke liye likha hota hai, RULES §4.15); `NETWORK_ERROR` pe connection wala sandesh; `INVALID_RESPONSE` aur baaki pe "Something went wrong. Please try again." |

## Tests

`npm test --workspace @beautinique/frontend-api-client`: nakli gateway (`test/fake-gateway.ts`, axios ke fetch adapter se) jo cookies ki halat rakhta hai (access, session, step-up). Refresh, line, 409, session khatam, offline, abort, step-up (ek dialog, cancel, handler hatana), Idempotency-Key (har try pe ek, mutation me retry/badli request), error body, contract jaanch, online status, doosre tabs (BroadcastChannel), TanStack hooks, aur server (SSR, bina `window`). Mutation testing nahi (RULES §6: frontend packages).

## License

MIT © Nageshwar Pawar
