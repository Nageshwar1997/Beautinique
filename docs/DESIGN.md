# DESIGN — BQ

> **Status:** v1.2 (2026-10-20). UI aur UX ke niyam saare 11 apps ke liye. Design ka **source of truth code hai**: `@beautinique/frontend-styles` (tokens) aur `@beautinique/frontend-components` (components). [RULES.md](RULES.md) §5 frontend ke coding niyam batata hai; ye file batati hai ki cheezein **dikhengi aur chalengi kaise**.

## 1. Design principles

1. **Bharosa pehle:** beauty products pe customer ko asli shade, saaf price aur saari legal jaankari chahiye. Kuch chhupana nahi.
2. **Ek design system, 11 apps:** saare apps ek hi tokens aur components use karte hain. Har app ka layout uske kaam ke hisaab se hai (§10).
3. **Mobile-first jahan zaroori:** Customer aur Delivery app phone pe sabse zyada chalenge. Internal apps desktop pe zyada, par phone pe bhi poore chalenge.
4. **Sabke liye:** WCAG 2.1 AA, light aur dark theme.
5. **Koi dark pattern nahi:** fake urgency, chhupe charges, pre-ticked boxes kabhi nahi (§7).

## 2. Source of truth

- **Tokens:** `packages/frontend/styles/src/variables.css` (Tailwind 4 `@theme`). Naya colour, shadow ya breakpoint pehle yahan, phir use.
- **Components:** `@beautinique/frontend-components` aur naye shared packages (app-shell, data-table, auth-ui, review-screens, maps). Har package me README + playground.
- **Figma:** optional. Starter plan me sirf 20 read calls/mahina hain, isliye Figma reference ke liye hai; asli design code me rehta hai.

## 3. Tokens

### 3.1 Theme

Theme `<html theme="light">` ya `theme="dark"` attribute se badalti hai. Default user ki system setting, aur user ka choice yaad rakha jata hai (`localStorage` me sirf preference).

### 3.2 Base colours (semantic)

| Token                   | Light            | Dark               | Use                                  |
| ----------------------- | ---------------- | ------------------ | ------------------------------------ |
| `primary`               | `#000000`        | `#FFFFFF`          | Main text, primary button            |
| `primary-invert`        | `#FFFFFF`        | `#000000`          | Page background, primary button text |
| `secondary`             | `rgb(28,28,28)`  | `rgb(245,245,245)` | Secondary text aur surfaces          |
| `tertiary`              | `rgb(46,46,46)`  | `rgb(200,200,200)` | Muted text, borders                  |
| `smoke-eerie`           | `#F2F2F2`        | `#1A1A1A`          | Cards aur sections ka background     |
| `battleship-davys-gray` | `#999999`        | `#4D4D4D`          | Placeholder, disabled                |
| `primary-red`           | `rgb(220,38,38)` | `rgb(248,113,113)` | Error, destructive                   |
| `primary-green`         | `rgb(22,163,74)` | `rgb(74,222,128)`  | Success                              |
| `primary-yellow`        | `rgb(234,179,8)` | `rgb(253,224,71)`  | Warning                              |

Grey ke baaki tokens (`timberwolf-eerie-black`, `platinum-black`, `silver`, `silver-jet`, `platinum-jet`) borders aur layers ke liye hain.

### 3.3 Accent palette (dono theme me same)

| Token                | Hex              | Token                  | Hex       |
| -------------------- | ---------------- | ---------------------- | --------- |
| `picton-blue-c`      | `#25ADF9`        | `razzle-dazzle-rose-c` | `#EE46BC` |
| `blue-crayola-c`     | `rgb(0,119,255)` | `veronica-c`           | `#9747FF` |
| `dodger-blue-c`      | `#2E90FA`        | `jade-c`               | `#12B76A` |
| `princeton-orange-c` | `#F79009`        | `turquoise-c`          | `#00E5D1` |
| `naples-yellow-c`    | `#F7D158`        | `rose-c`               | `#FE026C` |
| `electric-purple-c`  | `#B519DF`        |                        |           |

- **Brand gradient (`accent-duo`):** turquoise → picton blue → blue crayola. Highlights, hero aur special badges ke liye.
- **Contrast rule:** accent colours white pe chhote text ke liye AA pass nahi karte (jaise picton blue). Isliye accent sirf decoration, icons, bade text aur buttons ke background ke liye; padhne wala text hamesha `primary`/`secondary` me.
- Order status, charts aur tags ke liye accents ka ek tay mapping `styles` package me rahega, taaki har app me ek hi matlab ho.

### 3.4 Shadows, gradients, breakpoints

- **Shadows:** `shadow-primary-btn`, `secondary-btn`, `tertiary-btn`, `outline-btn` (aur unke `-hover`), `shadow-light-dark-soft`. Naye shadows tokens me hi.
- **Gradients:** `accent-duo`, `silver-duo`, `border-gradient`, `hr-line`, `sky-blue-burst`.
- **Breakpoints:** `base` 450, `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `xxl` 1536 px. Har screen 360, 768 aur 1280 px pe test hoti hai.
- **Spacing aur radius:** Tailwind ka default 4 px scale; ek component ke andar ek hi radius family.

## 4. Typography

- **Body aur UI (`font-sans`):** Plus Jakarta Sans, weights 300–700 + italic.
- **Headings aur banners (`font-display`):** Fraunces (opsz 72, sharp), weights 300–700 + italic. Prices hamesha `font-sans` me (Fraunces me tabular figures nahi).
- Dono self-hosted variable woff2 (OFL), `styles` package me. Loading aur flicker ke niyam package ke README me.
- **Scale:** Tailwind `text-xs` se `text-4xl`. Body 16 px (`text-base`) se chhota nahi; internal apps ke dense tables me 14 px tak.
- **Numbers:** prices aur tables me `tabular-nums`. INR aur dates `Intl` se (`en-IN`).

## 5. Components

### 5.1 Pehle se bane (reuse karo)

- **ui:** Badge, Button, Divider, GradientText, Tooltip.
- **inputs:** Input, Select, Checkbox, Radio, Textarea, InputLabel, InputError, InputIcon.
- **layout:** ModalWrapper, ConfirmModal, Dropdown, Table, Skeleton, Loading (page, rings, text), ApiStatus, NetworkStatusToaster, ScrollToTop, ScrollableGradientContainer, BorderGradient.
- **Aur:** auth, breadcrumb, color-input, file-input, hierarchy-select, linear-gradient, loading-screen, media, resend, static-page, stepper, testimonials, theme, toast; try-on package.

### 5.2 Naye shared components (ARCHITECTURE §9.2)

app-shell (layout, nav, theme switcher, wake-up screen), data-table, review-screens, auth-ui (OTP input, TOTP, My Devices, step-up dialog), maps, forms, pwa-kit.

### 5.3 Product-specific (packages me banenge)

| Component                                | Kaam                                                                |
| ---------------------------------------- | ------------------------------------------------------------------- |
| ProductCard                              | Image, brand, naam, PriceBlock, rating, shade dots, try-on badge.   |
| PriceBlock                               | MRP, selling price, discount, prior price (§7), Pro price label.    |
| ShadeSwatch / ShadePicker                | Asli rang ka swatch (hex), naam, out-of-stock state.                |
| LegalDeclarations                        | Product page ki saari declarations (§7).                            |
| SellerInfo                               | Seller ka naam, address, customer care, grievance officer, rating.  |
| RatingStars + ReviewCard                 | Rating, photo reviews, "verified purchase", incentivised label.     |
| OrderTimeline                            | Order state machine ke steps, live status.                          |
| RunSheetCard                             | Delivery app me ek stop: address, payment, OTP, actions.            |
| Labels                                   | `DummyBadge`, `ProPriceLabel`, `SponsoredLabel`, `HouseBrandBadge`. |
| EmptyState, ErrorState, PermissionDenied | Saare apps me ek jaisa.                                             |

## 6. States

Har screen ye states dikhati hai:
- **Loading:** Skeleton (shape jaisi), spinner sirf chhote actions pe.
- **Empty:** kya hai aur aage kya karein, ek action button ke saath.
- **Error:** saaf message, retry, aur request-id (support ke liye).
- **Offline:** NetworkStatusToaster; Delivery app me offline queue ka count.
- **Wake-up screen:** Render cold start pe (~1 min) "server jaag raha hai" screen, progress ke saath.
- **Permission denied:** kis permission ki zaroorat hai, aur kisse maangein.
- **Dummy:** dummy legal ya registration data pe DUMMY badge.

## 7. Commerce UI rules (kanoon aur bharosa)

1. **Price block:** MRP (strikethrough jab discount ho), selling price, discount %, aur 1 Jan 2027 se prior price (pichhle 30 din ka sabse kam). Selling price kabhi MRP se upar nahi.
2. **Total upfront:** delivery fee aur saare charges product page aur cart me checkout se pehle dikhte hain. Koi drip pricing nahi.
3. **Product page declarations:** maker/packer/importer, country of origin, net quantity, MRP (sab taxes ke saath), unit price, customer care, use-before ya expiry date.
4. **Labels:** sponsored listing pe "Sponsored", apne brand pe "Beautinique" badge, Pro price pe "Pro price", incentivised review pe label.
5. **Consent:** checkbox kabhi pre-ticked nahi; har purpose alag (marketing, own-brand marketing, try-on camera).
6. **Koi fake urgency nahi:** jhoothe timers, "sirf 2 bache" jaisa jhootha stock message nahi. Stock message sirf asli data se.
7. **Cancel aur return** utne hi aasaan jitna order karna.
8. **Footer:** Grievance Officer, policies (T&C, privacy, returns, shipping, ranking parameters), customer care.

## 8. Accessibility (WCAG 2.1 AA)

- Text contrast ≥ 4.5:1 (bade text ≥ 3:1). Accent colour rule §3.3.
- **Focus ring hamesha dikhe.** `outline-hidden` lagao to apna focus style do.
- Touch target kam se kam 44 px (Delivery app me 48 px).
- Icon-only button pe `aria-label`; images pe alt text (product images me product ka naam aur shade).
- Form errors input se jude hon (`aria-describedby`), aur sirf colour se error na batayein.
- `prefers-reduced-motion` pe animations band ya halki.
- Har page pe ek `h1`, sahi heading order, aur skip-to-content link.

## 9. Text aur formats

- Apps **English** me hain (`<html lang="en">`).
- INR, numbers aur dates `Intl` se `en-IN` me (₹1,299, 20 Oct 2026).
- Images me zaroori text nahi (screen reader aur zoom ke liye); har image ka alt text.

## 10. Har app ka look

| App                                                              | Look                                                                                                                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Customer                                                         | Brand-forward aur image-led: bade product images, shades, try-on CTA. Phone pe bottom nav (Home, Categories, Search, Cart, Account).                   |
| Seller, Creator                                                  | Clean dashboard: sidebar + top bar, cards aur tables, onboarding stepper.                                                                              |
| Admin, Super Admin, Master, Support Desk, Finance, Growth Studio | Data-dense: sidebar nav, filters + data-table, review queues, side panel me detail, keyboard shortcuts.                                                |
| Logistics Ops                                                    | Data-dense + maps: network map, control tower live map, scan-friendly bade inputs.                                                                     |
| Delivery (PWA)                                                   | Phone ke liye: high contrast (dhoop me bhi padh sakein), bade buttons, ek haath se chalne layak, neeche fixed action bar, offline state hamesha dikhe. |

## 11. Media, motion, icons

- **Images:** Cloudinary `f_auto,q_auto`, sahi `sizes`/`srcset`, lazy loading. Product images 1:1, banners ka ratio component me fix.
- **Shade images:** asli rang ke swatches (hex + photo), Indian skin tones pe.
- **Try-on:** camera se pehle consent screen; camera frames device se bahar nahi jaate.
- **Motion:** `animations.css` ke tokens; chhote aur kaam ke animations, reduced-motion respect.
- **Icons:** apna `icons` package, jisme **apne icon components** hain (`IconCart`, `IconSearch`, ...):
  - SVG Iconify ke sets se copy kiya jata hai, sirf jo icons use hote hain. Runtime pe Iconify nahi, isliye offline aur PWA safe.
  - Saare icons ek `BaseIcon` pe bane hain: size, `currentColor`, stroke ek jaisa.
  - Har icon alag export, isliye app me sirf wahi icons bundle hote hain jo wo use karti hai.
  - Ek main set rakhna (aaj sabse zyada **Solar**), taaki style ek jaisa rahe. Brand ke custom icons (logo, beauty icons) bhi isi package me.
  - **License:** copy karne pe bhi license lagu hai. Solar aur Pepicons CC BY 4.0 hain (credit zaroori), Lucide ISC, Line MD MIT, Logos CC0. Package me `LICENSES.md`, aur apps me "Icon credits" page.
  - Decorative icon pe `aria-hidden`, aur akele icon wale button pe `aria-label` (BaseIcon me `label` prop).
- **Dark mode:** product images invert nahi hote; brand gradient dono theme me same.

## Change log

| Version | Date       | Badlav                                                                                                                                                                                |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | 2026-10-19 | Pehla version: principles, tokens (aaj ke `styles` package se), typography, components, states, commerce UI rules, accessibility, text aur formats, har app ka look, media aur icons. |
| v1.1    | 2026-10-19 | Typography: Metropolis ki jagah Plus Jakarta Sans (body) + Fraunces (headings).                                                                                                       |
| v1.2    | 2026-10-20 | §9 Text aur formats: apps sirf English me.                                                                                                                                            |
