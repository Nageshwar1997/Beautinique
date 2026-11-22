# TASK 03: frontend-kit (frontend ke saajhe packages)

> **Status:** v1.0.1 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `03-frontend-kit`; charan 0 se shuru, components apni pehli screen ke charan me (D-446). Progress: 0 / 41 points.

## 1. Lakshya

Saare 11 apps ek hi design system se bante hain (DS-1.2): tokens aur themes, icons, components, forms, typed API client, permissions ke hisaab se UI, app ka dhaancha, sign-in ki screens, tables, map aur PWA. Har package [DESIGN.md](../../DESIGN.md) ke niyamon se.

## 2. Scope

**Andar:** §3 ke 13 packages, har frontend package ki playground, aur playground pe asli browser me accessibility ki jaanch.

**Bahar:**

- Apps ki apni screens aur routes: apne app ke module me (`16` se `26`).
- Paise aur tareekh ka `en-IN` format: `02-platform` ke `shared-money` aur `shared-clock` me, kyunki emails aur PDF ko bhi chahiye (DS-4.5, CR-30).
- E2E aur screenshot tests ka dhaancha: charan 1 ke pehle app ke saath.

## 3. Packages

Har package `packages/frontend/<name>`, naam `@beautinique/frontend-<name>` (D-002), `28-packages` ke `create` se, playground aur `tailwind.css` ke saath (CR-33, CR-34). Har README me "Visibility" ka hissa (D-445): "Asal me" column uska saar hai. Publish saare hote hain.

| Package               | Kaam (saar)                                                             | Asal me | Kyun                                                                  |
| --------------------- | ----------------------------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| `frontend-styles`     | Tokens, teen themes, fonts aur Tailwind ki base                         | Public  | Design dikhne wali cheez hai; kuch chhupa nahi                        |
| `frontend-icons`      | Apne icon components aur unka credit                                    | Public  | Khule sets se bane                                                    |
| `frontend-components` | react-aria-components pe bunyadi components                             | Public  | Aam kaam                                                              |
| `frontend-commerce`   | Commerce ke components (DS-6.3)                                         | Public  | Screen pe dikhne wali cheezein                                        |
| `frontend-forms`      | Form ke fields, galti ke sandesh aur accessibility                      | Public  | Aam kaam                                                              |
| `frontend-api-client` | Typed client, query keys, timeout, retry aur idempotency key            | Private | `shared-contracts` se bana; poore API ka naksha                       |
| `frontend-authz`      | Permission ke hisaab se nav, buttons aur route guards                   | Private | Permissions ka model dikhata hai                                      |
| `frontend-app-shell`  | Layout, nav, jaagne ka parda, errors, offline, idle, Credits            | Public  | Har app ka dikhne wala dhaancha                                       |
| `frontend-auth-ui`    | Sign-up, sign-in ke teen raaste, authenticator, recovery codes, step-up | Public  | Sign-in ka tareeka chhupane se suraksha nahi badhti; faisla server pe |
| `frontend-data-table` | Staff apps ki tables: cursor pages, URL me filters, phone pe cards      | Public  | Aam kaam                                                              |
| `frontend-maps`       | Ola Maps ka alag chunk: address ka pin aur stop ki detail               | Public  | Aam kaam; map ki key package me nahi                                  |
| `frontend-pwa`        | Service worker, install aur push                                        | Public  | Aam kaam                                                              |
| `frontend-test-utils` | Tests ke helpers, fakes, fixtures aur playground pe axe                 | Public  | Aam kaam                                                              |

[ARCHITECTURE.md](../../ARCHITECTURE.md) §12 ki sujhaav wali list me `frontend-commerce` naya hai: DS-6.1 kehta hai ki bunyadi components aur commerce components ke do alag packages hon.

### 3.1 `frontend-styles`

1. Rang ke tokens, light aur dark theme, aur high contrast ([DESIGN.md](../../DESIGN.md) §2 aur §3).
2. Typography, spacing, radius, shadows, layers aur motion ke tokens, reduced motion samet (§4). Token ke bahar ka rang ya z-index code me nahi (DS-4.10).
3. Fonts apne saath served: variable woff2, `latin` aur ₹ (U+20B9) ka subset, copyright aur license ki metadata bani, har font ka OFL.txt saath, sirf body font ka preload (DS-4.1, D-341, D-436).
4. Breakpoints aur shell ke size (§5), Tailwind ki base.

### 3.2 `frontend-icons`

Icones ke khule sets se sirf istemaal hone wale SVG ki copy (mukhya Solar ka linear style, phir Lucide), har icon alag export, `currentColor`, 16 se 32 px. Copy ki script SVG me code chalane ya bahar jaane wali cheez rokti hai; test har icon ka source, credit aur license jaanchta hai; Credits page ke liye credit component (DS-7.1, DS-7.2, DS-6.15).

### 3.3 `frontend-components`

react-aria-components pe, styling sirf tokens se, har component ki playground aur test (DS-6.1). [DESIGN.md](../../DESIGN.md) DS-6.2 ki list, jaise-jaise screens ko chahiye (§4 niyam 1). Loading, khaali halat aur pakka karne wale dialog DS-6.4, DS-6.5 aur DS-6.12 se. Bahar ke props `id`, `aria-describedby`, `className` aur event handlers ke saath milte hain, overwrite nahi (CR-31); focus ring kabhi bina apne style ke nahi hatta (CR-32).

### 3.4 `frontend-commerce`

DS-6.3 ke commerce components: catalog (ProductCard, PriceBlock, ShadeSwatch, ShadePicker, ExpiryLine, PackInfo, IngredientsPanel, ClaimBadges, SellerBlock, ReturnLine, StockLabel, RatingStars), order aur checkout (DeliveryPromise, DeliveryFeeLine, OrderStatusBadge, OrderTimeline, DeliveryCodeCard, RefundStatus, PaymentTimer, AddressCard, ReviewCard), Delivery (StopCard, UpiQrPanel, ProofCapture, SyncStatus) aur Logistics (ScanInput, ScanResult). Kahan kya dikhe: [DESIGN.md](../../DESIGN.md) §9. Har app wale components (WakeScreen, IdleWarning, UpdateBanner, PausedBanner, OfflineBanner, PermissionDenied, ErrorState, DemoStrip) `frontend-app-shell` me, aur StepUpDialog `frontend-auth-ui` me (ARCHITECTURE §12).

### 3.5 `frontend-forms`

react-hook-form aur contract ka wahi zod schema (DS-6.11). Label hamesha dikhe, jaanch blur aur submit pe, lambe form me upar errors ki list, error pe bhara data saaf nahi, `autocomplete` sahi, paste aur password manager chalein (DS-8.8, DS-8.9).

### 3.6 `frontend-api-client`

1. `shared-contracts` se typed client aur TanStack Query ki query keys ([ARCHITECTURE.md](../../ARCHITECTURE.md) §5 niyam 13).
2. Har call pe custom header (SR-030) aur `X-App-Version` (§5 niyam 5); polling aur background calls `X-Activity: background` ke saath (SR-094).
3. Retry sirf GET aur idempotency key wale calls pe, network ya 503 pe, backoff aur `Retry-After` ke saath, misaal 2 baar; baaki mutations pe apne aap retry nahi (§5 niyam 11).
4. Idempotency key UUIDv7, client banata hai (§10.1 niyam 4).
5. Error ka ek roop padh ke DS-6.6 ke UI ke liye taiyaar (code, message, `requestId`).

### 3.7 `frontend-authz`

Permission ke hisaab se nav, buttons aur route guards; faisla hamesha server ka ([ARCHITECTURE.md](../../ARCHITECTURE.md) §11 niyam 7, CR-29).

### 3.8 `frontend-app-shell`

1. Layout aur nav, app parivaar ke hisaab se ([DESIGN.md](../../DESIGN.md) §5).
2. Jaagne ka parda: `/wake` seedha Render pe, jawab se pehle koi API call nahi, 1.5 second ke baad WakeScreen, 150 second pe "Try again", aur jaagne ke baad background ping (DS-6.9, D-349, [ARCHITECTURE.md](../../ARCHITECTURE.md) §5 niyam 14).
3. Errors ka map (DS-6.6), rukawat ke sandesh (DS-6.7), offline (DS-6.8), staff ka IdleWarning (DS-6.10), UpdateBanner (426).
4. Har route ka title "<Page> · <App>", route badalne pe focus `h1` pe, "Skip to content", aur madad ka ek hi raasta (DS-8.4, DS-8.7, DS-8.10).
5. Credits page aur DemoStrip (DS-6.15, DS-9.14).

### 3.9 `frontend-auth-ui`

Sign-up, sign-in ke teen raaste (D-021), authenticator, recovery codes, StepUpDialog (DS-10.2); sign-in ki screen pe app ka naam aur host (DS-5.10); jawab aur password ke sandesh DS-10.3 aur DS-10.4 se.

### 3.10 `frontend-data-table`

Cursor se "Load more", filters URL me, phone pe cards, sticky header (DS-6.2), aur staff ki lists me chhupi jaankari "Show details" ke saath (DS-10.5).

### 3.11 `frontend-maps`

Ola Maps ka SDK exact version pe, alag chunk, sirf address ki screen aur Delivery ke stop ki detail pe; bahar ki koi script nahi; attribution hamesha; load na ho to sirf form (DS-7.10, DS-10.1, SR-091).

### 3.12 `frontend-pwa`

Service worker sirf versioned static shell aur assets rakhe, `/api/*` kabhi nahi; private media kabhi cache nahi; sign-out pe caches aur IndexedDB saaf (DS-10.8, DS-7.7, SR-010). Install, aur push ki subscription user aur session se bandhi (SR-074). Delivery ka offline data Delivery app ke module me.

### 3.13 `frontend-test-utils`

Tests ke helpers, fakes aur fixtures ([RULES.md](../../RULES.md) §4.2), playground pe Playwright se axe (light, dark aur high contrast; RT-27), aur viewports 320, 360, 768 aur 1280 (RT-28).

## 4. Niyam

1. **Pehle app me, phir package me** (CR-25): naya component ya hook pehle kisi app ki screen me asli browser me saabit hota hai, phir package me jaata hai. Isliye charan 0 me sirf wo packages bante hain jo kisi screen pe tike nahi (styles, icons, test-utils aur playground, api-client); components apni pehli screen ke charan me (§10).
2. Ek design system, 11 apps (DS-1.2): naya rang, size ya component pehle yahan, phir app me (CR-24).
3. Icons sirf `frontend-icons` se (CR-26); API sirf `frontend-api-client` se (CR-27).
4. User ka data aur tokens browser storage me nahi (CR-28, SR-027).
5. Har frontend package ki Tailwind CSS har us app aur playground me import ho jo uske components dikhata hai (CR-33).
6. Koi bahar ki script nahi (SR-006); map aur payment ke apne niyam (SR-090, SR-091).

## 5. Data model aur API

Koi database ya HTTP API nahi. Har package ki public TypeScript API uske README me; components ki API unki playground me.

## 6. Security

SR-005 aur SR-006 (headers aur bahar ki script), SR-010 (PWA cache), SR-027 aur SR-028 (cookies aur tokens; browser storage me nahi), SR-030 (custom header), SR-074 (push), SR-091 (map), SR-094 (background calls). User ka content sirf text ki tarah (DS-10.7, SR-040).

## 7. Tests

- Har component ka test aur playground; playground pe axe asli browser me, teeno themes me (RT-27).
- Contrast teeno themes me tokens se (DS-8.2); 320 px pe horizontal scroll nahi (RT-28).
- Mutation testing is module me nahi (CLAUDE.md ki teen jagah me ye nahi aata).

## 8. Dependencies

- **Tika hai:** `01-foundation`, `28-packages`, aur `02-platform` (`shared-contracts`, `shared-validators`, `shared-money`, `shared-clock`).
- **Is pe tike:** saare apps (`16` se `26`).
- **Owner ke kaam:** Ola Maps ki key aur hosts ki whitelist, map ke charan se pehle ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** apps ke saajhe criteria [ACCEPTANCE.md](../../ACCEPTANCE.md) §2 me hain (jaise jaagne ka parda aur headers). Is module ke apne criteria [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.16 `FRONTEND-KIT` (`AC-FRONTEND-KIT-1` se `AC-FRONTEND-KIT-10`, D-449); har criterion ka test apne subtask ke charan me ([RULES.md](../../RULES.md) DD-1).
- **Manuals aur testing ki files:** components kisi ek role ka feature nahi; jis app me screen judti hai, uske manual aur testing file usi app ke module me (D-440).

## 10. Subtasks

Har subtask lagbhag ek PR jitna. Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446) aur §4 niyam 1 se. Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #     | Subtask                                                                                | Charan | Size   | Halat |
| ----- | -------------------------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1  | `frontend-styles`: tokens, teen themes, fonts aur Tailwind ki base                     | 0      | L (4)  | Baaki |
| ST-2  | `frontend-icons`: copy ki script, license ki jaanch aur credit                         | 0      | M (2)  | Baaki |
| ST-3  | `frontend-test-utils`, playground ka dhaancha aur axe                                  | 0      | M (2)  | Baaki |
| ST-4  | `frontend-api-client`                                                                  | 0      | M (2)  | Baaki |
| ST-5  | `frontend-components`: sign-in aur Master ke dhaanche ke bunyadi components            | 1      | L (4)  | Baaki |
| ST-6  | `frontend-forms`                                                                       | 1      | M (2)  | Baaki |
| ST-7  | `frontend-app-shell`                                                                   | 1      | L (4)  | Baaki |
| ST-8  | `frontend-auth-ui`                                                                     | 1      | L (4)  | Baaki |
| ST-9  | `frontend-authz`                                                                       | 1      | S (1)  | Baaki |
| ST-10 | `frontend-pwa`: service worker, install aur push                                       | 2      | M (2)  | Baaki |
| ST-11 | `frontend-data-table` aur staff ki lists ke components                                 | 3      | M (2)  | Baaki |
| ST-12 | `frontend-commerce`: catalog ke components                                             | 5      | L (4)  | Baaki |
| ST-13 | `frontend-maps`                                                                        | 7      | M (2)  | Baaki |
| ST-14 | `frontend-commerce`: cart, checkout aur order ke components                            | 8      | M (2)  | Baaki |
| ST-15 | `frontend-commerce`: Delivery aur Logistics ke components                              | 9      | M (2)  | Baaki |
| ST-16 | `frontend-commerce` aur `frontend-components`: return, refund aur review ke components | 10     | M (2)  | Baaki |
|       | **Kul**                                                                                |        | **41** |       |

## Change log

| Version          | Date       | Badlav                                                                                                  |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.1 | 2026-11-22 | Module 03 ka pehla spec, 13 packages, 16 subtasks (D-446) aur criteria ki link (D-449); code abhi nahi. |
