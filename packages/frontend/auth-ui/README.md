# @beautinique/frontend-auth-ui

Har Beautinique app ki auth screens aur session (ARCHITECTURE §7.1, §9.2): sign-in (password, phir authenticator ya recovery code), sign-up (sirf sign-up apps), naya/bhoola password, invitation accept, header ka account menu, aur `next` ke saath pages ki rakhwali. Sab forms `@beautinique/frontend-forms` aur `@beautinique/frontend-components` se; har call `@beautinique/frontend-api-client` se.

## Install

```bash
npm install @beautinique/frontend-auth-ui @tanstack/react-query react-router
```

Peers: `react` 19, `react-dom`, `react-router` 8, `@tanstack/react-query` 5. App ki CSS me (Tailwind ke baad, styles, components aur forms ki `tailwind.css` ke saath):

```css
@import '@beautinique/frontend-auth-ui/tailwind.css';
```

```tsx
// app ki root me: API client, Query cache, session (har render tree ka apna; SSR pe har request ka)
<ApiProvider client={client} queryClient={queryClient}>
  <SessionProvider>
    <App />
  </SessionProvider>
</ApiProvider>
```

## Session

| Export                               | Kaam                                                                                                                                                                                                                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionProvider`                    | `/iam/me` **sirf tab** jab identity ki hint cookie `__Host-bq_<app>_hint` ho (owner, 2026-11-02): anonymous visit pe koi call nahi (refresh `auth` rate limit per IP hai, mobile pe bahut log ek IP share karte hain). Doosre tab ke sign-in/out pe dobara padhta hai. |
| `useSession()`                       | `{ app, state, signedIn(), signOut() }`. `state.status`: `loading` (server pe aur pehle jawab tak), `signed-out`, `signed-in` (`user`, `session`), `unavailable` (offline/server down; signed-out nahi).                                                               |
| `signedIn()`                         | Sign-in ke baad: `/iam/me` dobara, aur doosre tabs ko khabar.                                                                                                                                                                                                          |
| `signOut()`                          | `POST /auth/logout`, hint hatao, Query cache saaf (is tab me insaan ka kuch nahi bachta), doosre tabs ko khabar.                                                                                                                                                       |
| `hasSessionHint`, `clearSessionHint` | Hint cookie padhna/hatana (session doosre device se band hua ho to `/iam/me` ke `SESSION_EXPIRED` pe apne-aap hat'ta hai).                                                                                                                                             |

## Pages ki rakhwali aur `next`

| Export                     | Kaam                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `RequireSignIn`            | Signed out → `/sign-in?next=<yahi page>`; jab tak pata nahi, `fallback` (spinner).                                        |
| `RedirectIfSignedIn`       | Auth page pe signed-in user seedha `next` (ya `/`) pe (owner, 2026-11-02); page pehle render hota hai (SSR, first paint). |
| `safeNext(next)`           | Sirf apni site ka path: ek `/` se shuru, `//` ya `/\` nahi, control characters nahi, 2048 tak, auth page nahi; warna `/`. |
| `authHref(path, next)`     | `next` ke saath auth link (`/sign-in?next=%2Forders`); home ke liye `next` nahi.                                          |
| `AUTH_PATHS`, `NEXT_PARAM` | `/sign-in`, `/sign-up`, `/forgot-password`, `/invitation`; `next`.                                                        |

## Screens

| Export                                | Kaam                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SignInForm`                          | Email + password; account me authenticator ho to code (`TOTP_INVALID` field pe), "Lost your phone?" se recovery code (3 ya kam bache to toast). Sign-in step khatam (`LOGIN_EXPIRED`) → wajah ke saath shuru se. Signed in → `next`. Galat email/password/rok: ek hi jawab. `email`, `notice` props, ya pichhle auth page ka `location.state`. |
| `SignUpForm`                          | Email + consent (app ke hisaab se contracts `consentProblems`: customer me terms + 18+, seller/creator me terms) → code + naya password. Naya account → signed in → `next`. Account pehle se (`password-kept`) → sign-in, email bhara hua (state me, URL me kabhi nahi).                                                                       |
| `ForgotPasswordForm`                  | Email (consent nahi) → code + naya password → sign-in, "har device sign out" ke sandesh ke saath.                                                                                                                                                                                                                                              |
| `InvitationForm`                      | Invite wala email (+ sign-up app me consent) → code + password (password wala account apna rakhta hai) → sign-in.                                                                                                                                                                                                                              |
| `EmailStep`, `CodeStep`               | Upar wale forms ke do step, alag bhi: code step "It works until 5:10 pm", spam hint, resend server ke `resendAfter` countdown ke baad, "Use another email".                                                                                                                                                                                    |
| `AccountMenu`                         | Header: session pata hone tak usi size ka khaali placeholder (jagah nahi hilti), signed out → "Sign in" (wapas isi page), signed in → email, `links` (account pages) aur "Sign out" (toast).                                                                                                                                                   |
| `AuthLayout`, `TextLink`, `TEXT_LINK` | Auth page ka card (phone pe poori chaudai), ek `h1`, footer; brand rang ka underlined link.                                                                                                                                                                                                                                                    |
| `LEGAL_LINKS`                         | Consent ke links: `/terms`, `/privacy` (customer app ke dummy pages); `legal` prop se badlo.                                                                                                                                                                                                                                                   |

Authenticator **lagana** (sign-in ke beech, admin jaise apps) PR 6 me aata hai; tab tak `SignInForm` aise account ko saaf sandesh deta hai.

## Playground

```bash
npm run playground --workspace @beautinique/frontend-auth-ui
```

http://localhost:5186: saari screens nakli identity ke saath (test ka `fake-identity`, 500 ms der), jawab chunne ke radio (sirf password, authenticator, galat password, sign-up pe account pehle se), header me account menu aur theme switcher.

## Tests

`npm test --workspace @beautinique/frontend-auth-ui`: jsdom (https URL, kyunki hint cookie Secure hai), nakli identity, asli router, har screen pe axe. Asli backend ke saath poora raasta customer app ke Playwright E2E me.

## License

MIT © Nageshwar Pawar
