# @beautinique/frontend-styles

Beautinique ka poora CSS foundation, Tailwind v4 ke liye: design tokens (colours, tones, charts, fonts, layout, radius, shadows, layers, motion), self-hosted fonts, base styles, animations, utilities, rich text aur print. Saare frontend apps yahi package use karte hain.

| File             | Kya deta hai                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `variables.css`  | Tokens: palette, light/dark/high-contrast/print themes, tones, order status, charts, layout, touch, media ratios, motion            |
| `fonts.css`      | Plus Jakarta Sans + Fraunces (self-hosted)                                                                                          |
| `base.css`       | Page defaults: focus ring, selection, autofill, form controls, `mark`, `kbd`, reduced motion                                        |
| `animations.css` | `animate-fade-in`, `animate-scale-out`, `animate-slide-in-from-bottom` ...                                                          |
| `utilities.css`  | `focus-ring`, `touch-target`, `skip-link`, `container-page`, gradients, `skeleton`, `progress-indeterminate`, `marquee`, safe areas |
| `content.css`    | `rich-text`: editor (Quill 2) ya kisi bhi HTML ko styled dikhana                                                                    |
| `print.css`      | Invoice, label, run sheet print                                                                                                     |

`@import '@beautinique/frontend-styles'` saare files laata hai. Jo classes use nahi hoti (animations, utilities) wo build me nahi aati.

**Ek niyam:** Tailwind sirf poore likhe class naam banata hai. `tone-${status}` ya `bg-chart-${i}` jaisa jodkar banaya naam kaam nahi karega; map me poore naam likho (`{ success: 'tone-success' }`).

## Use

```css
/* app ki main CSS file */
@import 'tailwindcss';
@import '@beautinique/frontend-styles';
```

```js
// vite.config.js
import tailwindcss from '@tailwindcss/vite';
import { beautiniqueFonts } from '@beautinique/frontend-styles/vite';

export default {
  plugins: [react(), tailwindcss(), beautiniqueFonts({ preload: ['sans', 'display'] })],
};
```

- Theme `<html theme="light">` ya `theme="dark"` se badalti hai. Attribute na ho to system setting follow hoti hai.
- Apps sirf English me hain: `<html lang="en">`.
- Package sirf bundler ke through chalta hai (`@tailwindcss/vite`). `@tailwindcss/cli` font files ke `url()` copy nahi karta.

## Fonts

| Class                              | Family              | Font                      |
| ---------------------------------- | ------------------- | ------------------------- |
| `font-sans` (default)              | Beautinique Sans    | Plus Jakarta Sans         |
| `font-display` (headings, banners) | Beautinique Display | Fraunces (opsz 72, sharp) |

- Weights `font-light` (300) se `font-bold` (700), aur `italic`.
- Prices ke liye `tabular-nums` (sirf `font-sans` me; Fraunces me tabular figures nahi). ₹ dono fonts me hai.

### Kaise load hote hain (flicker nahi)

1. **Variable woff2, sirf zaroori characters.** Har style ki ek file saare weights deti hai. Sizes: Jakarta 32 KB, Fraunces 36 KB.
2. **unicode-range.** Browser wahi file laata hai jiske characters page pe hain: ek page = ek file per family. `latin-ext` files sirf accent wale naamon (ā, ł ...) pe aur italic files sirf italic text pe aati hain.
3. **Preload** (`/vite` plugin). `index.html` me `<link rel="preload">` wahi hashed URL deta hai jo CSS use karti hai, isliye font JS ke saath hi download ho jata hai aur pehle render pe tayyar rehta hai.
4. **`font-display: swap` + matched fallback.** Font aane tak local font (Arial/Roboto/Times/Noto Serif) dikhta hai, jiska size web font jaisa set hai (`size-adjust`, `ascent-override`...). Latin me fark 1% se kam (bina iske 4–6%), isliye swap pe text nahi khiskta. `optional` nahi liya: SPA me wo poore session ke liye brand font hata sakta hai.

Plugin options: `preload` = `['sans']` (default) ya `['sans', 'display']` (jis app ki pehli screen pe `font-display` heading ho). Plugin koi inline script nahi lagata, isliye CSP me kuch allow nahi karna. Multi-page build me preload sirf un pages pe lagta hai jinki CSS ye fonts use karti hai. `experimental.renderBuiltUrl` (CDN) ka URL bhi wahi lagta hai jo CSS me hai.

### Fonts badalna

Fonts `scripts/fonts.mjs` me config hain (families, files, axes, subsets, fallbacks). Wahan badlo, phir:

```bash
npm run fonts
```

Ye google/fonts ke pinned commit se fonts laata hai (sha256 check), subset karta hai, `src/fonts/` (woff2 + OFL licences + `manifest.json`) aur `src/fonts.css` ka generated hissa likhta hai. Dobara chalane pe bilkul same files bante hain.

```bash
npm run fonts:check
```

Ye offline chalta hai (CI): files manifest se milti hain, `fonts.css` current hai, script ya tools badle nahi, aur files me ₹, weight axis, aur tabular figures sahi hain. Windows (`core.autocrlf`) pe bhi chalta hai: `.gitattributes` generated files ko byte-for-byte rakhta hai, aur check CRLF ko LF maan ke compare karta hai.

**Licence:** dono fonts OFL-1.1 hain, bina Reserved Font Name ke, isliye subset karna allowed hai. Har family ka `OFL.txt` files ke saath ship hota hai, aur copyright/licence records har woff2 ke andar rehte hain. Package ka licence `MIT AND OFL-1.1` hai (code MIT, fonts OFL).

## Colours

Har colour **RGB channels** me hai, plus ek ready colour, taaki alpha kahin bhi de sako:

```css
color: var(--brand); /* rgb(214, 51, 108) */
background: rgba(var(--brand-rgb), 0.12); /* 12% rose */
```

| Layer    | Example                                                           | Kab use karein                              |
| -------- | ----------------------------------------------------------------- | ------------------------------------------- |
| Palette  | `--rose-600-rgb`, `--neutral-50-rgb`                              | Bahut kam; pehle semantic dekho             |
| Semantic | `--brand`, `--foreground-muted`, `--surface`                      | Hamesha; light aur dark khud sambhalte hain |
| Tailwind | `bg-brand`, `text-foreground-muted`, `bg-brand/20`, `bg-rose-600` | Components me                               |

Semantic tokens: `background`, `surface`, `surface-muted`, `surface-inverse`, `foreground` (+ `-muted`, `-subtle`, `-inverse`), `border`, `border-strong`, `brand`, `secondary`, `accent`, `success`, `warning`, `error`, `info` (har ek ke saath `-hover`, `-foreground`, `-subtle`, `-subtle-foreground`), `brand-text`, `price-discount`, `rating`, `focus-ring`, `overlay`, `shadow-color`.

Tailwind ke default colours aur shadows hata diye gaye hain: sirf Beautinique tokens milte hain. `teal` aur `violet` scales sirf charts aur category tags ke liye hain, text ya status ke liye nahi.

### Tones: ek component, koi bhi rang

`tone-brand`, `tone-secondary`, `tone-accent`, `tone-success`, `tone-warning`, `tone-error`, `tone-info`, `tone-neutral` ek element pe `--tone`, `--tone-hover`, `--tone-foreground`, `--tone-subtle`, `--tone-subtle-foreground` (aur `--tone-rgb`) set karte hain. Component inhe use karta hai, isliye Badge, Alert ya Button ka ek hi code har rang me chalta hai:

```html
<span class="tone-success bg-tone-subtle text-tone-subtle-foreground">In stock</span>
<button class="tone-error bg-tone text-tone-foreground hover:bg-tone-hover">Delete</button>
```

Default tone `brand` hai. Har tone jodi ka contrast script check karta hai.

### Order status

Order ka rang har app me ek hi matlab de, isliye status → tone mapping yahin hai (ARCHITECTURE: order state machine):

```html
<span data-order-status="OUT_FOR_DELIVERY" class="bg-tone-subtle text-tone-subtle-foreground"
  >Out for delivery</span
>
```

| Tone      | Status                                |
| --------- | ------------------------------------- |
| warning   | `PENDING_PAYMENT`, `RETURN_REQUESTED` |
| info      | `CONFIRMED`, `DISPATCHED`, `AT_HUB`   |
| secondary | `ALLOCATED`, `PICKED`, `PACKED`       |
| accent    | `OUT_FOR_DELIVERY`                    |
| success   | `DELIVERED`                           |
| error     | `RTO`                                 |
| neutral   | `CANCELLED`, `RETURNED`               |

Element pe `tone-*` class ho to wo jeet-ti hai. Rang ke saath status ka text hamesha likho (sirf rang se matlab nahi).

### Charts

`bg-chart-1` … `bg-chart-8` (`--chart-1` …) charts ke series colours hain, isi order me:

- Dono themes me series ka hue same rehta hai (rose, blue, teal, red, orange, gold, violet, plum); sirf shade badalta hai.
- Har colour page aur card dono pe 3:1 (WCAG 1.4.11).
- Har do colours me kaafi farak hai, aur padosi series (1-2, 2-3 …) colour-blind aankhon (protan, deutan, tritan) ke liye bhi alag dikhte hain. Script ye har baar check karta hai.
- Green jaan-boojh ke nahi hai (red/green sabse aam dikkat hai). Phir bhi chart me legend ya labels zaroori hain.

### High contrast

`<html contrast="more">` (ya system ki "increase contrast" setting, jab attribute na ho) me saara text 7:1 (AAA) pe aata hai, borders saaf dikhte hain, aur focus ring 3px ki ho jati hai. Delivery app ise dhoop me padhne ke liye use karta hai. `contrast="normal"` system setting ko band karta hai. Light aur dark dono ke saath chalta hai.

### Print

Print me hamesha light theme lagti hai (dark page ink barbaad karta hai). Screen-only cheezein `print:hidden`, print-only `hidden print:block`. `print.css` page margins, table header repeat aur page ke beech na tootne wale blocks sambhalta hai.

### Colours badalna

Colours `scripts/palette.mjs` me hain (Rose + Plum, gold accent, warm neutrals, plus chart hues). Tones, order status aur charts bhi wahin hain. Wahan badlo, phir `npm run palette`. Ye 50–950 scales (OKLCH) banata hai, `src/variables.css` ka generated hissa update karta hai, aur ye check karta hai (abhi 310/310 pass):

- har semantic aur tone jodi ka WCAG contrast (light, dark, aur dono ke high-contrast);
- brand gradient pe white text, aur gradient text;
- chart colours ka contrast aur aapas ka farak (normal aur colour-blind).

## Base styles (`base.css`)

Sab `@layer base` me hain, isliye koi bhi utility class jeet-ti hai.

- Page ka background/text theme se. `border` akela theme ka border colour deta hai.
- Page ka scrollbar theme colour me. Andar ke scroll boxes ka scrollbar browser wala rehta hai, isliye `::-webkit-scrollbar` se chhupana ab bhi kaam karta hai.
- Keyboard focus ring hamesha dikhta hai (`outline`, forced-colors mode me bhi; high contrast me 3px).
- Selection rose, placeholder `foreground-subtle` (padhne layak contrast), cursor (caret) brand rang ka.
- Native checkbox, radio, range aur progress brand rang me (`accent-color`).
- Browser autofill pe peela/neela box nahi aata; text theme ke rang me rehta hai.
- `<mark>` (search highlight) gold, `<kbd>` (keyboard shortcuts) key jaisa.
- `height: auto` tak transition chal sakta hai (accordion, `<details>`), jahan browser support kare.
- Theme badalte waqt `<html theme-switching>` ek frame ke liye lagao: saare rang ek saath badlenge, animate nahi honge.
- Modal `<dialog>` ka backdrop theme ke overlay se. Popover (toast, menu, tooltip) aur fullscreen ka backdrop browser wala hi rehta hai.
- Buttons pe pointer cursor, `aria-busy` pe progress cursor.
- Tables, `output` aur number inputs me `tabular-nums`. Number inputs me spinner arrows nahi.
- Headings `text-wrap-style: balance`, paragraphs `pretty`. Sirf style badalta hai, isliye `whitespace-nowrap`/`truncate` waise hi kaam karte hain. Lambe shabd toot jaate hain (`overflow-wrap`).
- Reduced motion pe saari animations/transitions band (third-party bhi). Kisi element ko chhoot deni ho to `data-motion="allow"`.

## Animations (`animations.css`)

| Class                                                                     | Kahan                                        |
| ------------------------------------------------------------------------- | -------------------------------------------- |
| `animate-fade-in`, `animate-fade-out`                                     | Overlay, backdrop, content badalna           |
| `animate-scale-in`, `animate-scale-out`                                   | Popover, dropdown, dialog (`origin-*` lagao) |
| `animate-rise-in`, `animate-sink-out`                                     | Toast, tooltip                               |
| `animate-slide-in-from-{top,bottom,left,right}`, `animate-slide-out-to-*` | Sheet, drawer, side panel                    |
| `animate-shake`                                                           | Form submit fail (error text bhi dikhao)     |
| `animate-pop`                                                             | Wishlist heart, cart count                   |

Tailwind ke `animate-spin`, `-ping`, `-pulse`, `-bounce` bhi hain. Durations motion tokens se aati hain, isliye reduced motion pe sab 0 ho jata hai. Exit animation pe `animationend` tab bhi aata hai, to unmount karne wala component chalta rehta hai. Popover/dialog ke liye Tailwind ka `starting:` variant bhi kaam aata hai.

## Utilities (`utilities.css`)

- **`focus-ring`, `focus-ring-inset`, `focus-ring-within`:** custom controls ke liye wahi focus ring jo base me hai (jab `outline-hidden` lagaya ho). `-inset` scroll box ke andar, `-within` input wale wrapper ke liye.
- **`touch-target`, `touch-target-lg`:** chhote control (icon button, close, shade dot) ko 44px / 48px ka click area, bina dikhawat badle (`::before` use karta hai).
- **`skip-link`:** har page ka pehla element, sirf focus pe dikhta hai: `<a href="#main" class="skip-link">Skip to content</a>`.
- **`container-page`:** page ki width (`max-w-page`) aur responsive side padding.
- **`bg-brand-gradient`** (text white bhi set karta hai) aur **`text-brand-gradient`** (sirf bade text ke liye; forced-colors me plain text).
- **`skeleton`:** loading placeholder, shimmer ke saath (reduced motion pe shimmer band). `aria-hidden` lagao aur region pe `aria-busy`.
- **`progress-indeterminate`:** track pe lagao (`text-brand bg-brand/20 h-1`). Reduced motion pe aadha bhara ruka hua bar.
- **`marquee`:** chalti patti (offers). Content do baar daalo; hover, focus aur `data-paused` pe rukti hai, reduced motion pe band. 5 second se zyada chalne wali cheez ke liye pause button bhi do (WCAG 2.2.2). Speed: `--marquee-duration`.
- **`pt-safe`, `pb-safe`, `pl-safe`, `pr-safe`, `px-safe`:** phone ke notch/home bar ke liye (viewport meta me `viewport-fit=cover` chahiye).
- **Scrollbars:** Tailwind ke apne hain: `scrollbar-none`, `scrollbar-thin`, `scrollbar-thumb-border-strong`.

## Rich text (`content.css`)

```html
<div class="rich-text">…product description, policy, help article…</div>
```

Headings `font-display` me, links `brand-text`, lists, quotes, code, tables, images aur video. Quill 2 editor ka saved HTML bhi sahi dikhta hai: uski lists (`<ol><li data-list="bullet|ordered|checked|unchecked">`), 8 indent levels (numbering 1. a. i.), `ql-align-*`, `ql-size-*`, `ql-font-*`, code blocks aur `ql-video`. Sizes `em` me hain, to `text-sm rich-text` sab chhota kar deta hai. Child pe koi bhi utility class jeet-ti hai. HTML pehle sanitize karo (quill package ka viewer karta hai).

## Baaki tokens

- **Breakpoints:** Tailwind defaults + `base` (450px).
- **Radius:** `rounded-xs` … `rounded-3xl`.
- **Shadows:** `shadow-xs` … `shadow-xl`, `shadow-brand`, `shadow-focus` (theme ke hisaab se).
- **Layers:** `z-(--z-modal)` waghaira: dropdown, sticky, header, overlay, modal, popover, toast, tooltip.
- **Motion:** `duration-(--duration-base)`, `ease-standard`, `ease-enter`, `ease-exit`, `ease-spring`; reduced-motion pe durations 0.
- **Layout:** `h-header`, `pb-bottom-nav` (Customer phone), `h-action-bar` (Delivery), `w-sidebar`, `w-sidebar-collapsed`.
- **Touch:** `size-touch` / `min-h-touch` (44px), `size-touch-lg` (48px, Delivery app).
- **Widths:** `max-w-page`, `max-w-dialog`, `max-w-sheet`.
- **Media:** `aspect-square` (product), `aspect-banner` (3:1), `aspect-banner-mobile` (16:9), `aspect-portrait` (4:5).

## Playground aur checks

```bash
npm run playground
```

`http://localhost:5180`: Vite + Tailwind + font plugin, bilkul apps jaisa. Fonts, text scale, base styles, semantic pairs, tones aur order status, charts, animations (button dabake chalao), skeleton/progress/marquee, utilities, Quill 2 rich text aur palette; theme aur high-contrast toggle ke saath.

```bash
npm test
```

- **Font plugin** (real Vite builds aur dev server): preload URL = CSS URL, har font ek baar, base path, CDN URL, multi-page, galat setup pe saaf error.
- **CSS** (real Vite + Tailwind build, `test/fixture/classes.html`): build me use hua har `var(--x)` define hai; tones, order status, charts, layout tokens, touch targets, focus ring, reduced motion, sirf use hue keyframes, forced colors, safe areas, high contrast, print aur Quill lists sahi bante hain; hand-written CSS me koi rang seedha nahi likha (sirf tokens); har module `index.css` aur `exports` me hai. Tests mutation-check kiye gaye hain.

```bash
npm run check
```

Colour checks + fonts check, dono.
