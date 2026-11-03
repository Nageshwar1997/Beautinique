# @beautinique/frontend-hooks

Har Beautinique app ke **saanjhe React hooks** (ARCHITECTURE §9.2): debounce, bahar click, media queries, online status, countdown, clipboard, aur URL ke query/path params. Purane `BQ-Packages` ke hooks (unke tests ke saath) yahan React Router 8 aur repo ke naming ke hisaab se aaye, plus naye hooks.

## Install

```bash
npm install @beautinique/frontend-hooks
```

Peer: `react` 19. `react-router` 8 sirf `/router` entry ke liye (optional peer): jis app me router nahi, uske bundle me router kabhi nahi aata.

```ts
import { useCountdown, useMediaQuery } from '@beautinique/frontend-hooks';
import { useQueryParams } from '@beautinique/frontend-hooks/router';
```

## Hooks (root)

| Hook                                                             | Kaam                                                                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `useMediaQuery(query, { serverValue })`                          | CSS media query match karti hai ya nahi, badlav ke saath. Server pe `serverValue` (default `false`).                     |
| `useIsSmallScreen(width = 1023, { serverValue })`                | `(max-width: <width>px)`, `useMediaQuery` pe.                                                                            |
| `useDebouncedValue(value, delay = 500)`                          | Value tab, jab `delay` ms tak na badle (search ka text request ke liye).                                                 |
| `useDebounce({ callback, delay })`                               | Callback ka debounce: `{ trigger, cancel, flush, isPending }`; hamesha aakhri render ka callback chalta hai.             |
| `useCountdown(until)`                                            | `until` (Date, ISO string ya ms) tak bache poore seconds, har second; server aur hydration pe `null`.                    |
| `useCopyToClipboard({ resetAfterMs = 2000 })`                    | `{ copy(text): Promise<boolean>, copied }`. Clipboard API sirf https/localhost aur user ke click se; mana ho to `false`. |
| `useOnlineStatus(store?)`                                        | `{ status: 'online' \| 'offline' \| 'connecting' }`, browser ke events + apni site ka probe.                             |
| `onlineStatusStore`, `createOnlineStatusStore(options)`          | React ke bahar (API client): `confirmOnline()` jab server ne jawab diya, `recheck()` jab jawab nahi aaya.                |
| `useOutsideClick(callback, { enabled, ignore, onFocusOutside })` | Element ke bahar pointer down (aur chahe to focus) pe callback; ref lautata hai.                                         |

## Hooks (`/router`, React Router 8)

| Hook                                 | Kaam                                                                                                                                                                                                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useQueryParams()`                   | `{ queryParams, setParams, removeParams, clearParams }`: `?a=1` padhna aur badalna; ek ke baad ek updates ek doosre pe bante hain (alag components se bhi), data router aur `useBlocker` ke saath sahi. `''`/`null`/`undefined` param ko hata dete hain. |
| `useQueryParamInput(key, { delay })` | URL param se juda text box (search): typing turant, URL debounce ke baad; Back/Forward ya "Clear" pe box URL ke saath.                                                                                                                                   |
| `usePathParams<Keys>()`              | Route ke path params, typed.                                                                                                                                                                                                                             |

## Examples

```tsx
// "Send a new code in 45 s" (API ka resendAfter)
const left = useCountdown(challenge.resendAfter);
<Button disabled={left !== 0}>{left ? `Send a new code in ${left} s` : 'Send a new code'}</Button>;

// recovery codes copy
const { copy, copied } = useCopyToClipboard();
<Button onClick={() => void copy(codes.join('\n'))}>{copied ? 'Copied' : 'Copy codes'}</Button>;

// search box URL me
const search = useQueryParamInput('search');
<input value={search.value} onChange={(event) => search.setValue(event.target.value)} />;
```

## Online status ka probe

Browser sirf tab "offline" kehta hai jab device ka network hi jaaye; Wi-Fi juda ho par internet na ho to kuch nahi kehta. Isliye store chhoti `HEAD /favicon.ico?online-check=<time>` request (axios ka fetch adapter, RULES §3.8; bina cookies, bina cache, axios ke apne headers bhi nahi) **sirf apni site** ko bhejta hai: kisi teesri company (Google, Cloudflare) ko nahi, aur CSP me kuch nahi kholna. Koi bhi jawab (404 bhi) = online. Online rehte hue tab dikhne pe har 15 s, jawab na aaye to 0.5 s, 1 s, 2 s, phir 3 s pe dobara. Laptop (`localhost`) pe site hamesha milti hai, to wahan cable nikalne ka pata sirf browser ke `offline` event se chalta hai.

## Server rendering

Saare hooks server pe chalte hain bina `window` chhue. `useMediaQuery`/`useIsSmallScreen` server aur hydration pe `serverValue` dete hain, `useCountdown` `null` (dono ghadiyan ek second pe sahmat nahi hongi), `useOnlineStatus` `online`.

## Playground

```bash
npm run playground --workspace @beautinique/frontend-hooks
```

http://localhost:5183: har hook ka chhota demo, app-shell ke frame aur theme switcher (light/dark) ke saath.

## Tests

`npm test --workspace @beautinique/frontend-hooks` (jsdom): purane package ke saare tests (router, blocker, data router, fuzz, SSR) aur naye hooks ke.

## License

MIT © Nageshwar Pawar
