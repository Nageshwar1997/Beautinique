# @beautinique/frontend-styles

Beautinique ke design tokens (colours, fonts, radius, shadows, layers, motion), self-hosted fonts aur base styles, Tailwind v4 ke liye. Saare frontend apps yahi package use karte hain.

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

| Class | Family | Font |
|---|---|---|
| `font-sans` (default) | Beautinique Sans | Plus Jakarta Sans |
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
color: var(--brand);                        /* rgb(214, 51, 108) */
background: rgba(var(--brand-rgb), 0.12);   /* 12% rose */
```

| Layer | Example | Kab use karein |
|---|---|---|
| Palette | `--rose-600-rgb`, `--neutral-50-rgb` | Bahut kam; pehle semantic dekho |
| Semantic | `--brand`, `--foreground-muted`, `--surface` | Hamesha; light aur dark khud sambhalte hain |
| Tailwind | `bg-brand`, `text-foreground-muted`, `bg-brand/20`, `bg-rose-600` | Components me |

Semantic tokens: `background`, `surface`, `surface-muted`, `surface-inverse`, `foreground` (+ `-muted`, `-subtle`, `-inverse`), `border`, `border-strong`, `brand`, `secondary`, `accent`, `success`, `warning`, `error`, `info` (har ek ke saath `-hover`, `-foreground`, `-subtle`, `-subtle-foreground`), `brand-text`, `price-discount`, `rating`, `focus-ring`, `overlay`, `shadow-color`.

Tailwind ke default colours aur shadows hata diye gaye hain: sirf Beautinique tokens milte hain.

### Colours badalna

Colours `scripts/palette.mjs` me hain (Rose + Plum, gold accent, warm neutrals). Wahan badlo, phir `npm run palette`. Ye 50–950 scales (OKLCH) banata hai, `src/variables.css` ka generated hissa update karta hai, aur har semantic jodi ka WCAG contrast check karta hai (abhi 88/88 pass).

## Base styles (`base.css`)

Sab `@layer base` me hain, isliye koi bhi utility class jeet-ti hai.

- Page ka background/text theme se. `border` akela theme ka border colour deta hai.
- Page ka scrollbar theme colour me. Andar ke scroll boxes ka scrollbar browser wala rehta hai, isliye `::-webkit-scrollbar` se chhupana ab bhi kaam karta hai.
- Keyboard focus ring hamesha dikhta hai (`outline`, forced-colors mode me bhi).
- Selection rose, placeholder `foreground-subtle` (padhne layak contrast).
- Modal `<dialog>` ka backdrop theme ke overlay se. Popover (toast, menu, tooltip) aur fullscreen ka backdrop browser wala hi rehta hai.
- Buttons pe pointer cursor, `aria-busy` pe progress cursor.
- Tables, `output` aur number inputs me `tabular-nums`. Number inputs me spinner arrows nahi.
- Headings `text-wrap-style: balance`, paragraphs `pretty`. Sirf style badalta hai, isliye `whitespace-nowrap`/`truncate` waise hi kaam karte hain. Lambe shabd toot jaate hain (`overflow-wrap`).
- Reduced motion pe saari animations/transitions band (third-party bhi). Kisi element ko chhoot deni ho to `data-motion="allow"`.

## Baaki tokens

- **Breakpoints:** Tailwind defaults + `base` (450px).
- **Radius:** `rounded-xs` … `rounded-3xl`.
- **Shadows:** `shadow-xs` … `shadow-xl`, `shadow-brand`, `shadow-focus` (theme ke hisaab se).
- **Layers:** `z-(--z-modal)` waghaira: dropdown, sticky, header, overlay, modal, popover, toast, tooltip.
- **Motion:** `duration-(--duration-base)`, `ease-standard`, `ease-enter`, `ease-exit`; reduced-motion pe durations 0.

## Playground aur checks

```bash
npm run playground
```

`http://localhost:5180`: Vite + Tailwind + font plugin, bilkul apps jaisa. Fonts, text scale, base styles, semantic pairs aur palette, light/dark toggle ke saath.

```bash
npm test
```

Real Vite builds (aur dev server) me plugin test: preload URL = CSS URL, har font ek baar, base path, CDN URL, multi-page, galat setup pe saaf error.

```bash
npm run check
```

Colour contrast + fonts check, dono.
