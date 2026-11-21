# DESIGN: Beautinique

> **Status:** v1.1.8 (2026-11-21). Saare apps ka UI design system (§1 se §10). Cheezein ek-ek karke, owner ki haan ke baad judti hain.

## Is file me kya aayega

- Design ke siddhaant.
- Tokens: rang, font, spacing, radius, shadow (light aur dark).
- Components aur icons.
- Har app parivaar ka layout.
- Accessibility.

Har niyam ka id `DS-<section>.<n>`. Tokens ke naam code me waise hi (CSS custom properties, Tailwind theme). Rang `rgb(r, g, b)` me. Contrast ratios WCAG ke formula se gine gaye hain, kisi audit tool se nahi; pakka saboot CI ka contrast check (DS-2.10) hoga. "Misaal" wale numbers settings ya code me badal sakte hain.

## 1. Design ke siddhaant

**Kis par:** D-010, D-012, D-042, D-139, D-145, D-154, CL-070 se CL-072. **R1.**

1. **DS-1.1 Bharosa pehle:** daam, batch ka MRP, expiry, shade, seller aur return ki shartein kharid se pehle saaf dikhein; koi zaroori jaankari tooltip ya chhote text me chhupi nahi.
2. **DS-1.2 Ek design system, 11 apps:** saare apps ek hi tokens, components aur icons se bante hain; layout app parivaar ke kaam se (§5). Naya rang, size ya component pehle design system me, phir app me.
3. **DS-1.3 Kaam ke hisaab se device:** Customer aur Delivery phone pehle; Seller aur staff apps desktop pehle, par phone pe bhi poore chalte hain (D-042). Koi kaam sirf ek device pe band nahi.
4. **DS-1.4 Server ka sach:** screen sirf wahi dikhaye jo server ne kaha (total, stock, status); client apna andaaza "pakka" ki tarah nahi dikhata. Server se pehle jawab ki jhalak (optimistic UI) sirf wishlist aur filters jaise ulte ho sakne wale kaam pe.
5. **DS-1.5 Koi dark pattern nahi:** jhoothi jaldi, jhootha stock, chhupe charges, pehle se tick, "Nahi" ko chhota ya dhundhla karna, baar-baar poochhna, cancel ya delete ko order se mushkil banana: kuch nahi (CL-070 se CL-073).
6. **DS-1.6 Saaf halat:** har screen pe loading, khaali, error aur (jahan laagu) offline ki halat bani ho (§6); har error ke saath aage ka raasta.
7. **DS-1.7 Sabke liye:** WCAG 2.2 AA har app me, light aur dark dono (§8).
8. **DS-1.8 Halka aur tez:** ₹0 hosting aur India se Singapore ki der (R-012) maan ke: kam calls, chhote bundles, images sahi size me (§10).
9. **DS-1.9 Demo saaf:** demo aur dummy ka nishaan har jagah jahan dhokha ho sake (D-145), design ka hissa, chhupane wala nahi.

## 2. Rang ke tokens: palette aur light theme

**Kis par:** D-340, D-001 (Tailwind). **R1.**

1. **DS-2.1 Sirf apne tokens:** Tailwind ke default rang aur shadows hatte hain; har rang ek token se. Raw palette `--<hue>-<step>-rgb` (sirf RGB channels, jaise `214, 51, 108`), taaki `rgb(var(--rose-600-rgb) / 0.12)` jaise halke roop ban sakein. Components sirf semantic tokens use karte hain, raw palette nahi.
2. **DS-2.2 Palette (11 steps, 50 se 950):**

   | Hue                  | 50          | 100         | 200         | 300         | 400         | 500         | 600         | 700        | 800       | 900      | 950      |
   | -------------------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | ---------- | --------- | -------- | -------- |
   | `rose` (brand)       | 255,243,245 | 255,229,234 | 255,203,213 | 255,167,186 | 255,120,156 | 240,77,129  | 214,51,108  | 177,27,84  | 143,6,64  | 112,0,48 | 77,0,31  |
   | `plum` (gehra brand) | 255,243,249 | 255,228,243 | 252,201,230 | 244,169,213 | 229,135,192 | 208,104,170 | 181,80,145  | 151,60,119 | 121,43,94 | 92,26,70 | 67,14,49 |
   | `gold` (accent)      | 252,246,236 | 248,235,215 | 238,215,180 | 224,191,137 | 196,154,82  | 184,137,49  | 159,113,12  | 130,91,0   | 102,70,0  | 78,53,0  | 53,35,0  |
   | `neutral` (garam)    | 253,248,245 | 243,235,229 | 240,225,215 | 202,194,189 | 177,169,164 | 152,144,139 | 128,121,116 | 105,98,93  | 82,76,71  | 64,57,53 | 28,22,25 |
   | `success`            | 238,251,239 | 218,245,222 | 184,234,192 | 141,217,155 | 93,196,117  | 22,163,74   | 0,147,63    | 0,120,50   | 0,94,37   | 0,72,27  | 0,48,15  |
   | `warning`            | 255,245,237 | 255,232,215 | 255,208,173 | 248,179,125 | 235,147,72  | 217,119,6   | 181,98,0    | 148,79,0   | 116,60,0  | 90,45,0  | 61,29,0  |
   | `error`              | 255,244,242 | 255,230,227 | 255,205,198 | 255,171,160 | 255,127,114 | 250,73,65   | 220,38,38   | 186,14,22  | 148,0,10  | 115,0,6  | 80,0,3   |
   | `info`               | 243,247,255 | 228,237,255 | 200,219,255 | 165,196,255 | 125,169,255 | 84,140,255  | 37,99,235   | 31,87,210  | 18,65,171 | 8,48,137 | 1,29,100 |

   Saath me `white` (255,255,255) aur `black` (0,0,0). Charts ke liye do aur hue, sirf charts aur category tags me (kabhi text ya status ka matlab nahi): `teal-600` 13,148,136, `teal-400` 96,190,178, `violet-600` 124,58,237, `violet-400` 175,151,255.
3. **DS-2.3 Light theme ke semantic tokens** (ratio saath ki jodi pe):

   | Token                                        | Value                            | Kaam                             | Ratio                                   |
   | -------------------------------------------- | -------------------------------- | -------------------------------- | --------------------------------------- |
   | `background`                                 | neutral-50                       | page                             |                                         |
   | `surface`                                    | white                            | card, dialog, input              |                                         |
   | `surface-muted`                              | neutral-100                      | section, table header            |                                         |
   | `surface-inverse`                            | neutral-950                      | footer, demo ki patti            |                                         |
   | `foreground`                                 | neutral-950                      | main text                        | 16.91 (background), 17.82 (surface)     |
   | `foreground-muted`                           | neutral-800                      | doosra text                      | 8.02 (background)                       |
   | `foreground-subtle`                          | neutral-700                      | hint, meta                       | 5.68 (background), 5.08 (surface-muted) |
   | `foreground-inverse`                         | neutral-50                       | ulti patti pe text               | 16.91                                   |
   | `border`                                     | neutral-200                      | sirf sajawat ki lines            | (seema nahi batata)                     |
   | `border-strong`                              | neutral-600                      | input, checkbox, radio ki seema  | 4.28 (surface)                          |
   | `brand` / `brand-hover`                      | rose-600 / rose-700              | main button                      | safed text 4.62 / 6.66                  |
   | `brand-foreground`                           | white                            | brand pe text                    |                                         |
   | `brand-subtle` / `brand-subtle-foreground`   | rose-50 / rose-800               | halka chip, selected row         | 8.55                                    |
   | `brand-text`                                 | rose-700                         | links, chalu nav                 | 6.32 (background), 6.66 (surface)       |
   | `secondary` / `secondary-hover`              | plum-800 / plum-900              | doosra bhara button              | safed text 9.05                         |
   | `accent` / `accent-foreground`               | gold-500 / neutral-950           | khaas badge (jaise "Bestseller") | 5.66                                    |
   | `success`, `info`, `error`                   | success-700, info-600, error-600 | status bhara                     | safed text 5.63, 5.17, 4.83             |
   | `warning` / `warning-foreground`             | warning-500 / neutral-950        | chetavni bhari                   | 5.59                                    |
   | `<tone>-subtle` / `<tone>-subtle-foreground` | 50 / 800                         | status ka halka roop             | success 7.49, warning 8.18, error 8.60  |
   | `price-discount`                             | success-700                      | "% off"                          | 5.63 (surface)                          |
   | `rating`                                     | gold-500                         | sirf star ka shape               | 3.15 (surface; non-text)                |
   | `focus-ring`                                 | rose-600                         | keyboard focus                   | 4.38 (background)                       |
   | `focus-ring-inverse` / `brand-text-inverse`  | rose-400 / rose-300              | ulti patti pe focus aur link     | 7.15 / 9.75 (neutral-950)               |
   | `shadow-color`                               | neutral-950                      | shadows                          |                                         |

4. **DS-2.4 Text sirf text wale tokens me:** padhne wala text sirf `foreground*`, `brand-text`, `price-discount`, `error` (inline error) ya kisi tone ke `-foreground` / `-subtle-foreground` me. `brand`, `accent`, `rating` aur `border*` text ke liye nahi.
5. **DS-2.5 Hover hamesha gehra:** light me hover ek step gehra (600 → 700); kabhi halka nahi, taaki rose button pe safed text 4.5:1 se neeche na jaaye.
6. **DS-2.6 Ulti patti:** footer aur demo ki patti `surface-inverse` pe, aur wahan focus ring `focus-ring-inverse` aur links `brand-text-inverse`.
7. **DS-2.7 Rang akela matlab nahi:** status, error, stock aur order ki halat hamesha shabd ya icon ke saath (WCAG 1.4.1).
8. **DS-2.8 Order status ke tone:** har app me ek hi map (misaal: Placed `info`, Packed `neutral`, Out for delivery `brand`, Delivered `success`, Delivery failed `warning`, Cancelled aur Returned `neutral`, Refund pending `warning`, Refunded `success`); map ek jagah code me, apps sirf status bhejte hain.
9. **DS-2.9 Charts:** series ka kram light me rose-600, info-600, teal-600, gold-600, violet-600, success-700 (white pe 4.62, 5.17, 3.74, 4.34, 5.70, 5.63: har ek kam se kam 3:1); label ya legend hamesha, sirf rang se series nahi.
10. **DS-2.10 Contrast ki jaanch CI me:** ek script har semantic jodi ka ratio har theme me jaanchta hai (text 4.5:1, bada text aur UI parts 3:1, high contrast me 7:1); fail pe CI laal. Naya token isi script se aata hai.

## 3. Dark theme aur high contrast

**Kis par:** D-342, SR-027. **R1.**

1. **DS-3.1 Theme ka chunaav:** `<html data-theme="light|dark">`; attribute na ho to system ki setting (`prefers-color-scheme`). Har app ke account ya settings menu me Light, Dark, System. Pasand sirf browser storage me (SR-027), server pe nahi. Pehle paint se pehle ek chhoti inline script theme lagaye, taaki safed jhalak na aaye (CSP me uska hash, SR-005).
2. **DS-3.2 Dark ke semantic tokens:**

   | Token                                         | Value                                   | Ratio                                          |
   | --------------------------------------------- | --------------------------------------- | ---------------------------------------------- |
   | `background` / `surface` / `surface-muted`    | neutral-950 / neutral-900 / neutral-800 |                                                |
   | `surface-inverse`                             | neutral-50                              |                                                |
   | `foreground`                                  | neutral-50                              | 16.91 (background), 10.74 (surface)            |
   | `foreground-muted`                            | neutral-300                             | 6.45 (surface), 4.82 (surface-muted)           |
   | `foreground-subtle`                           | neutral-400                             | 4.90 (surface); `surface-muted` pe mana (3.66) |
   | `border` / `border-strong`                    | neutral-800 / neutral-500               | border-strong 3.61 (surface)                   |
   | `brand` / `brand-hover` / `brand-foreground`  | rose-400 / rose-300 / neutral-950       | 7.15                                           |
   | `brand-subtle` / `brand-subtle-foreground`    | rose-950 / rose-200                     | 11.05                                          |
   | `brand-text`                                  | rose-300                                | 6.19 (surface), 9.75 (background)              |
   | `secondary` / `secondary-foreground`          | plum-300 / neutral-950                  | 9.75                                           |
   | `accent` / `accent-foreground`                | gold-400 / neutral-950                  | 6.87                                           |
   | `success`, `warning`, `error`, `info` (bhare) | 400 steps, text neutral-950             | 8.16, 7.47, 7.24, 7.63                         |
   | `<tone>-subtle` / `-subtle-foreground`        | 950 / 200                               |                                                |
   | `price-discount`                              | success-300                             | 6.76 (surface)                                 |
   | `rating`                                      | gold-400                                | 4.36 (surface)                                 |
   | `focus-ring`                                  | rose-400                                | 4.54 (surface), 7.15 (background)              |
   | `focus-ring-inverse` / `brand-text-inverse`   | rose-700 / rose-700                     | 6.32 (neutral-50)                              |
   | `shadow-color`                                | black                                   |                                                |

3. **DS-3.3 Dark me hover ek step halka** (400 → 300), taaki gehre text ke saath contrast badhe.
4. **DS-3.4 Dark me charts:** rose-400, info-400, teal-400, gold-400, violet-400, success-400 (surface pe 4.54, 4.85, 5.13, 4.36, 4.69, 5.19).
5. **DS-3.5 Product images aur swatches kabhi invert ya filter nahi;** shade ka hex swatch dono themes me asli rang, ek patli `border-strong` seema ke saath taaki gehra shade dark background me na kho jaaye.
6. **DS-3.6 High contrast:** `prefers-contrast: more` ya app ki setting (`data-contrast="more"`): saara text kam se kam 7:1, focus ring 3 px, `border` = `border-strong`. Light me: `foreground-subtle` → neutral-800, `brand` aur `brand-text` → rose-800 (safed 9.26, background pe 8.78), status bhare 800 steps (success 7.99, error 9.28, info 8.86). Dark me: `foreground-muted` aur `foreground-subtle` → neutral-200 (surface pe 8.87), `brand-text` → rose-200 (7.96), status 300 steps (neutral-950 ke saath 9.83 se 10.64). Baaki jodiyan DS-2.10 ki script se 7:1 tak pakki.
7. **DS-3.7 Print hamesha light** (invoice, credit note, labels, manifest, run sheet), aur print me demo ka watermark (D-145 niyam 2) bhi.

## 4. Typography, spacing, radius, shadow, layers aur motion

**Kis par:** D-341, ARCHITECTURE §10.1 (integer paise), D-308. **R1.**

1. **DS-4.1 Fonts:** `--font-sans`: "Plus Jakarta Sans", system-ui, sans-serif; `--font-display` (sirf Customer app ki headings aur banners): "Fraunces", Georgia, serif; `--font-mono`: ui-monospace, Menlo, Consolas, monospace. Dono variable woff2, apne app ke saath served, Latin subset jisme ₹ (U+20B9) ho; `font-display: swap`; sirf body font ka preload. License (OFL) CL-125 ki list me.
2. **DS-4.2 Size scale** (size / line-height, px): `xs` 12/16, `sm` 14/20, `base` 16/24, `lg` 18/28, `xl` 20/28, `2xl` 24/32, `3xl` 30/36, `4xl` 36/40. Customer aur Delivery me body 16 se chhota nahi; staff ki dense tables me 14 tak; 12 sirf badge aur caption me. Inputs hamesha 16 (phone pe apne aap zoom na ho).
3. **DS-4.3 Weights:** 400 body, 500 labels aur nav, 600 headings aur buttons, 700 sirf daam aur bade aankde.
4. **DS-4.4 Ank:** daam, quantity, tables, order number aur codes `tabular-nums`. Daam hamesha `font-sans` me.
5. **DS-4.5 Paisa aur tareekh `en-IN` me** (`Intl` ke ek saajhe helper se): ₹1,299 aur ₹1,29,999; UI pe paise sirf tab jab shunya na hon (₹1,299.50), invoice, refund aur finance ki screens pe hamesha do decimal. Tareekh "21 Nov 2026", samay "2:30 pm" (IST); delivery ka vaada "Tomorrow, 22 Nov"; expiry sirf mahina-saal "Mar 2028" (D-067). Rakam server se integer paise me aati hai; app khud ginti nahi karta (SR-044).
6. **DS-4.6 Order number aur codes:** order number D-308 ke roop me (`4827-1930-56`), copy button ke saath. Delivery code bade ankon me (misaal 32 px, `font-mono`, 3+3 ke group "482 193"), taaki door pe bol ke bataya ja sake.
7. **DS-4.7 Spacing:** 4 px ka scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Page ka gutter phone 16, tablet 24, desktop 32.
8. **DS-4.8 Radius:** `xs` 4, `sm` 6, `md` 8 (button, input), `lg` 12 (card), `xl` 16 (dialog, sheet), `2xl` 24, `full` (chip, badge, avatar). Ek component ke andar ek hi radius family.
9. **DS-4.9 Shadows** (`shadow-color` se, dono themes me sahi):
   - `xs`: `0 1px 2px 0 rgb(var(--shadow-color-rgb) / 0.05)`
   - `sm`: `0 1px 3px 0 / 0.08, 0 1px 2px -1px / 0.08`
   - `md`: `0 4px 6px -1px / 0.08, 0 2px 4px -2px / 0.06`
   - `lg`: `0 10px 15px -3px / 0.10, 0 4px 6px -4px / 0.06`
   - `xl`: `0 20px 25px -5px / 0.12, 0 8px 10px -6px / 0.08`
   - `focus`: `0 0 0 3px rgb(var(--focus-ring-rgb) / 0.45)`
   (har line me rang `rgb(var(--shadow-color-rgb) / <alpha>)`).
10. **DS-4.10 Layers:** dropdown 1000, sticky 1100, header 1200, overlay 1300, modal 1400, popover 1500, toast 1600, tooltip 1700; koi aur z-index number code me nahi.
11. **DS-4.11 Motion:** `duration-fast` 120 ms, `duration-base` 200 ms, `duration-slow` 320 ms; easing `standard` cubic-bezier(0.2, 0, 0, 1), `enter` (0, 0, 0, 1), `exit` (0.4, 0, 1, 1), `spring` (0.34, 1.56, 0.64, 1) sirf chhoti cheezon pe (wishlist ka dil, count). Motion sirf matlab ke liye (kya khula, kahan gaya); koi parallax nahi, apne aap chalne wala carousel nahi.
12. **DS-4.12 Reduced motion:** `prefers-reduced-motion: reduce` pe teeno durations 0 ms, aur 5 second se lambi chalti cheez (misaal progress ka shimmer) ruki; skeleton bina shimmer ke.

## 5. Breakpoints, layout aur app parivaar

**Kis par:** D-010, D-042, D-183, D-343. **R1.**

1. **DS-5.1 Breakpoints** (min-width, px): `base` 450, `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536. Har screen 320 (reflow, WCAG 1.4.10), 360, 768 aur 1280 pe test; 320 pe koi horizontal scroll nahi (tables ko chhod ke, jo cards ban jaati hain).
2. **DS-5.2 Shell ke size:** header 64 px; Customer ki neeche ki bar 64 px + safe area; Delivery ki action bar 72 px + safe area; sidebar 256 px (band 72 px); page max 1280 px; padhne wale pages (legal, policy) max 720 px; dialog 512 px; side sheet 448 px.
3. **DS-5.3 Media ratios:** product image 1:1; banner 3:1 (phone pe 16:9); portrait 4:5 (review photos ka grid). Image ki jagah pehle se reserve (layout shift nahi).
4. **DS-5.4 Customer app (storefront):** image-led; header me logo, search aur wishlist (desktop pe cart aur account bhi). Phone pe neeche 5 tabs: Home, Categories, Orders, Cart (count ke saath), Account (D-343). Product grid: 2 columns (640 se kam), 3 (`md`), 4 (`lg` se upar). Filters phone pe neeche se khulne wali sheet me, desktop pe baayein column me.
5. **DS-5.5 Partner dashboards (Seller, Creator):** sidebar + top bar; Home pe "kya karna baaki" ki checklist (onboarding, ruki listings, maal bhejna); cards aur tables; phone pe top bar + menu sheet.
6. **DS-5.6 Staff data-dense apps (Admin, Super Admin, Master, Support Desk, Finance, Growth Studio):** sidebar me sirf wahi sections jo user ki permissions kholti hain (faisla server ka); list = filters (URL me) + table (phone pe cards) + detail side sheet me; queue wali screens me "Next item" aur ginti. Keyboard: `/` search, `?` shortcuts ki list; koi shortcut akela akshar likhne wale field me nahi chalta.
7. **DS-5.7 Logistics Ops:** data-dense + scan pehle: scan wali screen pe scan ka input hamesha focus me, bade buttons (48 px), har scan ka nateeja bade shabd + rang + icon me ("Accepted", "Wrong bin", "Already scanned"), awaaz aur vibration jahan browser de (band karne ka switch). Tablet aur haath ke scanner dono pe. Map R1 me nahi.
8. **DS-5.8 Delivery app (PWA):** sirf phone ke liye design (desktop pe beech me phone jitni chaudai); ek haath se: main kaam neeche ki action bar me; upar patli status patti: online ya offline aur "N waiting to sync"; "Sunlight mode" (high contrast, DS-3.6) default chalu, header se band ho sake.
9. **DS-5.9 App ki pehchaan:** har app ke header me app ka naam (Customer me sirf logo); install icon ki tile parivaar ka rang batati hai: Customer ivory (neutral-50), staff apps ink (neutral-950), partner apps (Seller, Creator, Delivery) rose (rose-600). Home screen ka naam: Customer "Beautinique", baaki "BQ <App>" (jaise "BQ Seller", "BQ Delivery", "BQ Logistics"; 12 akshar tak). Maskable icon me mark 80% ke safe circle me.
10. **DS-5.10 Sign-in ki screen pe app ka host:** har app ki sign-in screen pe saaf likha ho ki ye kaunsa app hai aur iska tay URL (SR-012), taaki nakli page pehchanna aasaan ho (R-017).

## 6. Components aur screen ki halatein

**Kis par:** D-001 (react-aria-components), ARCHITECTURE §5 niyam 5, 7, 8, 9, 11, 14, SR-009, D-181. **R1.**

1. **DS-6.1 Neev:** har interactive component react-aria-components pe (keyboard, focus aur screen reader ka vyavhaar usi se), styling sirf tokens se. Ek saajha components package aur ek commerce components package; har component ki apni playground aur test.
2. **DS-6.2 Bunyadi components:** Button (primary, secondary, outline, ghost, destructive; height 36, 44, 48; loading pe chaudai wahi aur label padha jaaye), IconButton (label zaroori), Link, Badge, Chip, Tooltip (sirf extra jaankari, zaroori nahi), Divider, Avatar; TextField, PasswordField (dikhao/chhupao, paste chale), CodeInput (6 ank ek hi field me, `inputmode="numeric"`, `autocomplete="one-time-code"`, poora paste), SearchField, QuantityStepper (min aur max server se, D-091), Select, ComboBox, Checkbox (kabhi pehle se tick nahi), RadioGroup, Switch, TextArea (ginti ke saath), DatePicker, FileUpload (type aur size pehle se likhe, SR-061), PincodeField (6 ank); Dialog, ConfirmDialog, Sheet (side aur neeche), Popover, Menu, Toast; DataTable (cursor se "Load more", filters URL me, phone pe cards, sticky header), DescriptionList, Tabs, Accordion, Stepper, Timeline; Skeleton, Spinner, ProgressBar, Alert.
3. **DS-6.3 Commerce components:** ProductCard, PriceBlock, ShadeSwatch aur ShadePicker, ExpiryLine, PackInfo, IngredientsPanel, ClaimBadges, SellerBlock, ReturnLine, DeliveryPromise, DeliveryFeeLine, StockLabel, RatingStars, ReviewCard, OrderStatusBadge, OrderTimeline, DeliveryCodeCard, RefundStatus, PaymentTimer, AddressCard; Delivery ke liye StopCard, UpiQrPanel, ProofCapture, SyncStatus; Logistics ke liye ScanInput aur ScanResult; har app ke liye DemoStrip, DummyBadge, StepUpDialog, IdleWarning, WakeScreen, UpdateBanner, PausedBanner, EmptyState, ErrorState, PermissionDenied, OfflineBanner. Kahan kya dikhta hai: §9.
4. **DS-6.4 Loading:** list aur page pe Skeleton (shape jaisa); Spinner sirf button ya chhote kaam ke andar; pehli load ke baad poore page ka spinner nahi. Purana data dikhte hue taaza ho raha ho to chhota "Updating" ka nishaan.
5. **DS-6.5 Khaali halat:** kya hai, kyun khaali, aur ek kaam ka button. Misaal: cart khaali "Your cart is empty" + "Browse categories"; seller ki listings khaali "Add your first product"; Support ki queue khaali "No cases waiting".
6. **DS-6.6 Error ka map** (ARCHITECTURE §5 niyam 8, 9): server ka `message` dikhe aur `requestId` "Ref" ke roop me copy ho sake. 400 aur 422: field ke paas ya form ke upar; 401: sign-in pe, wapas usi page pe (SR-021); 403: PermissionDenied (kaunsi permission aur kisse maangein); 404: "Not found" (scope ke bahar bhi wahi, kuch zyada nahi); 409: "This changed. Showing the latest." aur taaza data; 413: file ya data bada; 426: UpdateBanner "A new version is available" + Reload; 429: `Retry-After` se ulti ginti, tab tak button band; 503: "Busy right now, trying again" ya kill switch ka sandesh. "Try again" sirf GET aur idempotency key wale kaam pe (niyam 11).
7. **DS-6.7 Rukawat ke sandesh (SR-009):** har kill switch ka apna saaf sandesh, misaal checkout band: "Checkout is paused right now. Your cart is saved."; sign-up band: "New sign-ups are paused."; uploads band: upload ke button pe wajah. Sandesh banner me, page band nahi.
8. **DS-6.8 Offline:** Delivery ke alawa apps offline me OfflineBanner ("You're offline") aur aakhri dikha data padhne ke liye; badalne wale buttons band, wajah ke saath; koi kaam line me nahi rukta. Delivery app ka offline §5 niyam 8 aur FL-9 me.
9. **DS-6.9 Jaagne ka parda (D-349):** app khulte hi pehle 1.5 second (misaal) sirf page ka rang aur patli progress bar; jawab na aaye to WakeScreen: logo, "Starting up. This can take up to a minute.", andaaze wali progress, aur 150 second (misaal) pe "Try again". Beech me rewrite 502 ya 504 de to wahi parda dobara (OPERATIONS §5 niyam 8). Parde pe koi API call nahi. Parda sirf jaagne tak (pehli baar, ya server beech me so gaya ho to); tab tak app ka koi hissa nahi khulta. Jaagne ke baad ki background ping (D-349) pe koi loading ya nishaan nahi.
10. **DS-6.10 Staff ka bina kaam ka samay (D-181):** 30 minute bina kaam pe band hone se 2 minute pehle IdleWarning dialog, ulti ginti aur "Stay signed in" ke saath (WCAG 2.2.1); band hone ke baad sign-in pe wapas usi page pe. Bhara hua form khone se pehle bhi yahi chetavni.
11. **DS-6.11 Forms:** label hamesha dikhe (sirf placeholder nahi); jaanch blur aur submit pe; lambe form me upar errors ki list (har error field ki link); error pe bhara data kabhi saaf nahi; form ka schema wahi jo contract ka (zod), react-hook-form ke saath.
12. **DS-6.12 Pakka karne wale dialog:** cancel, delete, payout, refund jaise kaam pe ConfirmDialog cheez ka naam aur asar likhe ("Cancel 1 item: Lip Tint, Ruby. ₹499 will be refunded to your original payment method."); "Cancel" aur "Confirm" ek size ke; destructive button pe `error` tone.
13. **DS-6.13 Optimistic UI** sirf wishlist, filters aur sort pe; paisa, stock, order aur status ke kaam pe kabhi nahi.
14. **DS-6.14 Gol kone wale dibbe me scroll:** dibba khud scroll nahi karta; dibba `overflow: hidden` se kone kaat-ta hai aur andar ka hissa scroll karta hai, patle theme wale scrollbar ke saath (table, picker ki list, dialog), taaki scrollbar kone se bahar na dikhe.
15. **DS-6.15 Credits page (D-350):** har app me ek "Credits" page, sab apps me ek hi saajha page component. Har package apna credit component deta hai (icons, aage charts, Ola Maps jaise); app sirf un packages ke components jodta hai jo wo use karta hai. Har component me naam, author, license aur link. Link footer ya account menu me (DS-8.10 ki jagah ke paas). Map pe Ola Maps ka attribution map pe bhi rehta hai (DS-7.10).

## 7. Icons, logo, images aur media

**Kis par:** D-350, D-284, D-296, SR-005, SR-055, SR-061, CL-125. **R1.**

1. **DS-7.1 Apna icons package:** icones.js.org ke open sets se (D-350; mukhya set Solar ka linear style, phir Lucide, phir baaki) sirf istemaal hone wale SVG copy, har icon alag export (bundle me sirf wahi jo app use kare); 24 px grid, stroke Solar ke linear style jaisa (misaal 1.5 px), `currentColor`; size 16, 20, 24, 32. Icon font aur runtime pe icons laana nahi (PWA offline me bhi chale). Beauty ke khaas icons (lipstick, swatch, dropper) usi grid pe apne. License ka notice package me aur CL-125 ki list me; icons ka credit component Credits page (DS-6.15) pe. Copy ki script SVG se code chalane ya bahar jaane wala kuch bhi rokti hai, aur test har icon ka source, credit aur license jaanchta hai.
2. **DS-7.2 Icon ki accessibility:** sajawati icon `aria-hidden`; akele icon wale button pe label zaroori (component bina label ke type error de).
3. **DS-7.3 Logo:** mark + naam; header me 640 px se chhote pe sirf mark; link ka label poora naam; favicon saada (rose tile pe "B"); ulti patti aur print pe ek rang ka roop.
4. **DS-7.4 Product images:** media provider ke transform se auto format aur quality, `srcset` widths 160, 320, 480, 640, 960, 1280 aur sahi `sizes`; fold ke neeche lazy; product page ki pehli image (LCP) lazy nahi aur `fetchpriority="high"`; 1:1, halke neutral background pe; product page pe zoom (phone pe pinch, desktop pe click), max 1600 px.
5. **DS-7.5 Alt text data se:** product image ka alt brand + product + shade + view ("front", "label"), apne aap bana; label photo "Ingredient label"; review photo "Customer photo 1 of 3". Seller ka free text alt nahi.
6. **DS-7.6 Shade:** swatch hex se bana gol (32 px, `border-strong` ki patli seema) + swatch photo; chuna shade check icon aur naam ke saath; stock khatam shade pe tirchhi line aur "Out of stock" text (sirf rang se nahi).
7. **DS-7.7 Private media** (delivery ki photo, daawe ki photos aur video, dastavez): sirf chhote signed URL se (D-296), service worker kabhi cache nahi, page pe `no-referrer` (SR-005); sirf haq wale ki screen pe (D-191, D-192).
8. **DS-7.8 Camera:** Delivery app me saboot ki photo app ke camera se (file input pe `capture`, SR-055); pehli baar se pehle app ki apni samjhane wali screen, phir browser ka prompt. Customer ke daawe ki photos (D-106) aam file picker se; EXIF server hataata hai (SR-061).
9. **DS-7.9 Video** sirf daawe me (optional, D-106), poster ke saath, apne aap nahi chalta.
10. **DS-7.10 Address aur map (Ola Maps, D-347):** address ki screen pe form aur "Search on map" dono; map ka script sirf usi screen pe load. Map ke search, pin ya "Use my current location" se form ke fields bhare jaayein to wo field "Filled from map" jaise halke nishaan ke saath, badle ja sakein; customer ke khud likhe fields kabhi nahi mitte. Pin ke saath address ka text hamesha; khinchne ka vikalp search aur "Use my current location" (DS-8.6). "Ola Maps" attribution hamesha dikhe. Map load na ho to sirf form. Delivery ke stop ki detail pe pin wala chhota map.

## 8. Accessibility (WCAG 2.2 AA)

**Kis par:** DS-1.7, D-206 (CAPTCHA nahi). **R1.**

1. **DS-8.1 Lakshya:** saare apps WCAG 2.2 AA, light, dark aur high contrast me. Component tests aur E2E me automated accessibility jaanch (misaal axe): serious ya critical ek bhi nahi to hi pass. Har release se pehle mukhya flows (sign-in, checkout, delivery code, return, listing, scan, delivery) pe keyboard aur screen reader ki haath ki checklist: NVDA pe desktop apps, TalkBack pe Customer aur Delivery, aur R1 se pehle ek baar VoiceOver pe Customer (D-376).
2. **DS-8.2 Contrast:** §2 aur §3 ke tokens se; text 4.5:1, bada text aur UI parts (input ki seema, focus, icons) 3:1.
3. **DS-8.3 Focus:** hamesha dikhe: 2 px `focus-ring`, 2 px offset (high contrast me 3 px); sticky header ya neeche ki bar focus ko na dhake (WCAG 2.4.11): `scroll-padding-top` header jitna, `scroll-padding-bottom` bar jitna.
4. **DS-8.4 Keyboard:** har kaam keyboard se; koi trap nahi; dialog focus andar rakhe aur band hone pe kholne wale button pe lautaye; har page pe "Skip to content".
5. **DS-8.5 Touch targets:** har app me kam se kam 44 × 44 px, Delivery aur scan ki screens pe 48 × 48 px; paas ke targets me 8 px ka faasla (WCAG 2.5.8 ki 24 px se upar).
6. **DS-8.6 Dragging ka vikalp:** jo bhi khinch ke hota hai (jaise listing ki images ka kram), uska button wala raasta bhi ("Move left", "Move right") (WCAG 2.5.7).
7. **DS-8.7 Screen reader:** har page ka ek `h1`, headings kram se, landmarks (header, nav, main, footer); har route ka title "<Page> · <App>"; route badalne pe title padha jaaye aur focus `h1` pe; toast `polite`, error `assertive`; cart ki ginti ka badlav padha jaaye; payment ka timer sirf 5 minute aur 1 minute bache pe padha jaaye, har second nahi (WCAG 4.1.3).
8. **DS-8.8 Forms:** errors field se jude (`aria-describedby`), text + icon; `autocomplete` sahi (name, email, tel, street-address, postal-code, one-time-code, current-password, new-password) (WCAG 1.3.5); ek baar diya address dobara na maanga jaaye (WCAG 3.3.7); password aur code me paste aur password manager chalein, koi paheli nahi (WCAG 3.3.8).
9. **DS-8.9 Kai kadam wale forms:** naya kadam apne heading pe focus le; kadam ka sandesh ("We sent a code to ...") field se juda.
10. **DS-8.10 Madad ek jagah:** Help aur grievance ka raasta har app me ek hi jagah (Customer me footer aur Account; baaki apps me account menu) (WCAG 3.2.6).
11. **DS-8.11 Zoom aur reflow:** 200% text zoom aur 400% (320 px chaudai) pe koi jaankari ya kaam na khoye.
12. **DS-8.12 Charts aur aankde:** har chart ke saath uski table (dikhao ka button), sirf rang se series nahi.

## 9. Kanooni aur bharose ki jaankari UI me kahan

**Kis par:** neeche har line ka faisla ya CL row. Yahan sirf **kahan dikhe**; kya dikhe wo apne faisle me tay hai. **R1** (jahan R2 likha, wahan baad me).

| Id      | Kya                                                                                                                                                                        | Kahan                                                                                                                                                                       | Kis par                                             |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| DS-9.1  | MRP (sab taxes samet), daam, "% off" (neeche round), pichhle 30 din ka sabse kam daam                                                                                      | ProductCard (MRP, daam, % off), product page ka PriceBlock (+ 30 din wali line), cart, checkout                                                                             | D-064, D-120, D-223, CL-025, CL-074                 |
| DS-9.2  | Agle bhejne wale batch ki expiry (mahina-saal, "Use before" ya "Expiry" jo batch pe ho)                                                                                    | product page daam ke paas, cart aur checkout ki har line, order detail, invoice                                                                                             | D-067, D-124, D-232                                 |
| DS-9.3  | Cart me rakhne ke baad agla batch badla (MRP, daam ya expiry)                                                                                                              | cart aur checkout me line pe "Updated" ka nishaan, purana aur naya; order server ke total pe hi (DS-1.4)                                                                    | D-064, SR-044                                       |
| DS-9.4  | Pack ki jaankari: generic naam, net quantity, manufacturer, packer, marketer, importer aur country of origin (imported), customer care, licence ka type, pack ka dot, size | product page ka "Product details" hissa; net quantity aur country of origin daam ke paas bhi; desktop pe khula, phone pe heading ke saath accordion (heading hamesha dikhe) | CL-026, CL-029, CL-030, CL-037, D-127, D-128        |
| DS-9.5  | Ingredients: poori list, label photo, INCI list, allergen chetavni apni line ke saath ("Based on our allergen list. Check the ingredient list on the pack.")               | product page ka "Ingredients" hissa; allergen chetavni add-to-cart ke paas bhi                                                                                              | D-099, D-159, CL-043                                |
| DS-9.6  | Claims sirf tay list se; test wale saboot ke saath hi                                                                                                                      | product page title ke neeche ClaimBadges; filters me                                                                                                                        | D-100, D-224                                        |
| DS-9.7  | Seller ka block (naam, pata, customer care, seller ka grievance officer)                                                                                                   | product page "Sold by", order detail, invoice                                                                                                                               | D-238, CL-060                                       |
| DS-9.8  | Return ki line aur return ka kharcha (seal aata hai ya nahi ke hisaab se; muddatein settings se)                                                                           | product page add-to-cart ke paas, order detail, invoice, Returns policy page                                                                                                | D-079, D-114, D-221, CL-061                         |
| DS-9.9  | Delivery fee aur "₹X se upar muft"                                                                                                                                         | product page ka DeliveryPromise, cart, checkout ka breakup (alag line)                                                                                                      | D-107, CL-071                                       |
| DS-9.10 | Delivery ki tareekh ka vaada aur cut-off                                                                                                                                   | pincode ke baad product page pe, checkout, order detail; vaada toote to "Delayed"                                                                                           | D-117, D-222                                        |
| DS-9.11 | "Bestseller", "Only N left" sirf niyam se; "X ne kharida" nahi                                                                                                             | ProductCard, product page                                                                                                                                                   | D-154, CL-070                                       |
| DS-9.12 | Stock khatam                                                                                                                                                               | list me neeche, "Out of stock" ke saath; "Notify me" R2                                                                                                                     | D-153                                               |
| DS-9.13 | Kram kaise banta hai                                                                                                                                                       | search aur category pe sort ke paas "How results are ranked" ki link                                                                                                        | D-139, D-240, CL-066                                |
| DS-9.14 | Demo ki patti                                                                                                                                                              | har app ke upar, product page aur checkout pe bhi; band nahi ho sakti                                                                                                       | D-145, CL-079                                       |
| DS-9.15 | DUMMY badge                                                                                                                                                                | har dummy registration (GSTIN, licence, import registration, EPR) ke saath, jahan bhi dikhe; demo reviews pe "Demo review"; PDF pe watermark                                | D-145                                               |
| DS-9.16 | Legal pages: Terms, Privacy, Data notice, Returns, Shipping, Payments, How results are ranked, Grievance, About/Contact                                                    | Customer ka footer, sign-up, checkout ke paas links; har page pe "DUMMY: kisi licensed lawyer ne nahi dekha" badge, version aur tareekh                                     | D-150, D-240, D-255, D-264, CL-059, CL-080          |
| DS-9.17 | Platform ki jaankari, Grievance Officer (naam, designation, contact), nodal person, National Consumer Helpline ka field                                                    | About/Contact aur Grievance page; footer me Grievance ki link                                                                                                               | D-163, D-237, CL-059, CL-064                        |
| DS-9.18 | Sign-up pe: alag Data notice (consent se pehle), Terms aur Privacy, 18+ ki ghoshna, marketing opt-in alag                                                                  | sign-up ki screen; har tick khaali shuru; "Haan" aur "Nahi" barabar                                                                                                         | D-038, D-141, D-255, CL-072, CL-089, CL-101, CL-102 |
| DS-9.19 | Consent wapas lena                                                                                                                                                         | Account → Privacy: har consent ka "Turn off", kab diya aur notice ka version                                                                                                | D-151, CL-089                                       |
| DS-9.20 | Push ki ijazat marketing se alag                                                                                                                                           | Account → Notifications me do alag switches                                                                                                                                 | D-141, CL-101                                       |
| DS-9.21 | Review photo me chehre ki ijazat ka tick                                                                                                                                   | review form, photo jodne pe                                                                                                                                                 | D-155                                               |
| DS-9.22 | "Paisa kata, order nahi bana"                                                                                                                                              | payment ke baad ki screen aur email (bank ka samay)                                                                                                                         | D-256                                               |
| DS-9.23 | Cancel order jitna aasaan                                                                                                                                                  | order detail pe "Cancel" pack hone tak, har item ke saath                                                                                                                   | D-110, CL-078                                       |
| DS-9.24 | Account delete                                                                                                                                                             | Account → Privacy; dobara pehchaan, 7 din me wapas ka raasta, aur kya rehta hai (tax archive, review "Deleted customer")                                                    | D-151, D-225, D-305, SR-066                         |
| DS-9.25 | Partner ka data notice aur location ka consent                                                                                                                             | Delivery app ka pehla sign-in                                                                                                                                               | D-254, CL-114                                       |
| DS-9.26 | Seller agreement (version) aur undertaking                                                                                                                                 | Seller app ke onboarding me, accept ka record                                                                                                                               | D-150, D-240, CL-069, CL-128                        |
| DS-9.27 | "Not a medical consultation" (R2)                                                                                                                                          | Skin & Hair Expert ki har screen aur booking                                                                                                                                | D-252                                               |

## 10. Security aur performance ke UI niyam

**Kis par:** SR-001, SR-004 se SR-006, SR-010, SR-012, SR-013, SR-015, SR-019 se SR-021, SR-023, SR-039, SR-040, SR-052, SR-054, D-053, D-185, D-195, D-254, ARCHITECTURE §5 niyam 2, 7. **R1.**

1. **DS-10.1 Browser ki ijazatein:** Customer app me camera aur location header se band (SR-001); location sirf D-347 ke button pe, tap ke baad aur pehle ek line ki wajah. Delivery app me camera aur location pehli baar se pehle app ki samjhane wali screen; mana ho to wapas chalu karne ka tareeka dikhe (D-351).
2. **DS-10.2 StepUpDialog (D-185):** kaam ka naam ("Approve payout batch PB-…"), 6 ank ka CodeInput, 5 minute ki khidki ka nishaan; code sahi to wahi kaam chale, page na badle.
3. **DS-10.3 Sign-in ke jawab:** anjaan aur registered email pe ek hi sandesh ("If an account exists, we've sent a code.") (SR-019); code ka 10 minute aur 3 baar dobara bhejna ulti ginti ke saath (SR-015); seema pe saaf sandesh (SR-020); `next` sirf apna relative path (SR-021).
4. **DS-10.4 Password:** 12 se 128 akshar, koi "capital aur number" ka niyam nahi; sandesh sirf "Too short" aur "This password has appeared in a data breach" (SR-013); dikhao/chhupao.
5. **DS-10.5 Staff ki lists me chhupi jaankari:** naam aur phone chhupe ("R••• K•••, 411001"); "Show details" pe wajah (list + text), phir dikhe aur audit me (SR-039, D-201). Seller ka bank sirf aakhri 4 ank (SR-052).
6. **DS-10.6 Push aur emails ka text:** push me sirf order number aur halat, delivery code kabhi nahi (D-195); email ki links sirf apne app ke host pe, staff emails me koi sign-in link nahi, "Open the <App> app" (SR-012).
7. **DS-10.7 User ka content:** reviews, description, ingredients ka text aur naam sirf text ki tarah (escape); rich text sirf bold aur list; links `rel="nofollow ugc noopener"` (SR-040).
8. **DS-10.8 PWA cache:** service worker sirf versioned static app shell aur assets rakhe, `/api/*` kabhi nahi; sign-out pe caches aur IndexedDB saaf (SR-010); Delivery ka offline data SR-023 ke hisaab se.
9. **DS-10.9 Bundle ke budget** (misaal, gzip, har route ki pehli load): Customer JS 170 KB, staff aur partner apps 250 KB, CSS 30 KB, fonts D-341 ke hisaab se; fold ke upar images 200 KB tak. Payment gateway ki script sirf Payment route pe (SR-006). Budget toote to CI laal.
10. **DS-10.10 Page ke targets** (misaal, jaage server pe, D-053; laptop pe mobile preset ke Lighthouse se, 5 mukhya pages: Home, list, product, cart, order): LCP 2.5 s, CLS 0.1, INP 200 ms. Server ke targets ARCHITECTURE §9 me hi.
11. **DS-10.11 Kam calls:** ek screen ke liye ek ya do calls (ARCHITECTURE §5 niyam 2); polling sirf dikhte tab pe (niyam 7); TanStack Query ka `staleTime` data ke hisaab se (misaal catalog 5 minute, order ki halat polling se); hover pe prefetch sirf product page ke liye.

## Change log

| Version | Date       | Badlav                                                                                                                                                                                                                                              |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                                                                                                                                                                   |
| v1.1.1  | 2026-11-21 | §1 se §10 aaye: siddhaant, rang (light, dark, high contrast), typography aur baaki tokens, layout aur app parivaar, components, icons aur media, accessibility, kanooni jaankari UI me kahan, security aur performance (121 niyam; D-352 se D-361). |
| v1.1.2  | 2026-11-21 | DS-7.10 (Ola Maps ka map, D-347).                                                                                                                                                                                                                   |
| v1.1.3  | 2026-11-21 | DS-7.10: form aur map dono, map se fields bharna (D-347).                                                                                                                                                                                           |
| v1.1.4  | 2026-11-21 | DS-6.9: parda sirf jaagne tak, tab tak app band, ping bina loading (D-349).                                                                                                                                                                         |
| v1.1.5  | 2026-11-21 | DS-7.1: icons icones.js.org se, script aur test ke saath (D-350).                                                                                                                                                                                   |
| v1.1.6  | 2026-11-21 | DS-7.1: mukhya set Solar, phir Lucide; har app me Icon credits page (D-350).                                                                                                                                                                        |
| v1.1.7  | 2026-11-21 | DS-6.15 saajha Credits page; DS-7.1 me icons ka credit component (D-350).                                                                                                                                                                           |
| v1.1.8  | 2026-11-21 | DS-8.1 me screen readers ke naam (D-376, D-397).                                                                                                                                                                                                    |
