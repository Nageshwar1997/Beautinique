# @beautinique/frontend-icons

Beautinique ke **apne icon components** aur **logo** (`BrandMark`, `BrandLogo`; DESIGN §11). Har icon ka SVG Iconify ke sets se copy kiya gaya hai, sirf wahi jo apps use karti hain. Runtime pe Iconify ki library ya API nahi, isliye offline aur PWA me bhi chalta hai.

## Install

```bash
npm install @beautinique/frontend-icons
```

## Use

```tsx
import { IconMoon, IconSun } from '@beautinique/frontend-icons';

<IconSun />                              // decorative: text ke size (1em) aur rang (currentColor) me, screen reader se chhupa
<IconMoon size={20} label="Dark theme" /> // akela icon jo kuch kehta hai: role="img" + naam
<IconSun className="text-brand-text" />   // rang Tailwind text colour se
```

| Prop    | Kaam                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------ |
| `size`  | Width aur height: number = px, string = koi bhi CSS length. Default `1em`                        |
| `label` | Screen reader ke liye naam. Tabhi do jab icon akela kuch kehta ho; saath me text ho to mat do    |
| baaki   | `<svg>` ke saare props (`className`, `style`, `data-*` ...); `viewBox` icon ka apna hi rehta hai |

Akele icon wale button me `label` icon pe nahi, button pe do (`aria-label`), ya andar chhupa text rakho.

## Icons

`IconBox`, `IconCheckCircle`, `IconClose`, `IconDanger`, `IconDelivery`, `IconEye`, `IconEyeClosed`, `IconFaceScan`, `IconInfo`, `IconMonitor`, `IconMoon`, `IconPalette`, `IconShieldCheck`, `IconSun`, `IconTagPrice`, `IconWarning` (sab Solar set ke linear style me). Sab ek saath dekhne ke liye playground.

**Optimized kaise:** har icon apni file me ek `/* @__PURE__ */ createIcon(...)` hai, uske shapes ek hi baar bante hain (har render pe nahi), aur `sideEffects: false`. Isliye app me sirf wahi icons bundle hote hain jo wo import karti hai (`test/bundle.test.ts` ek asli Vite build se ye `dist` aur `src` dono pe check karta hai).

## Logo

```tsx
import { BrandLogo, BrandMark } from '@beautinique/frontend-icons';

<BrandLogo size={40} />                        // header: mark + naam, height 40px, width shape se
<BrandLogo layout="stacked" size="8rem" label="Beautinique" /> // mark upar, naam neeche (master jaisa)
<BrandMark size={32} />                         // sirf mark: chhoti jagah (app icon, collapsed sidebar)
<BrandLogo monochrome />                        // sab ek rang (currentColor): print, stamp
```

| Prop                 | Kaam                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `size`               | **Height**: number = px, string = CSS length. Width logo ki shape se banti hai (string pe `calc()`). Default `1em` |
| `label`              | Screen reader ka naam. Link ke andar (jiska apna naam hai) ya naam wale text ke saath mat do                       |
| `monochrome`         | Ink aur rose dono `currentColor`                                                                                   |
| `layout` (BrandLogo) | `horizontal` (default) ya `stacked`                                                                                |

Rang: ink = `currentColor` (text ka rang, isliye light/dark/high contrast me apne aap sahi), rose = theme ka `--brand` (bina theme ke `#d6336c`).

**Source:** `brand/logo-master.webp` (publish nahi hota). `src/brand/paths.ts` usi se trace hua hai: potrace (`esm-potrace-wasm` 0.5.1, browser me), 4x upscale, har pixel ink ya rose layer me (background se us rang tak ki line pe aadhe se aage), `turdsize 40, alphamax 1, opttolerance 0.2`, phir coordinates master ke pixels me aur har hissa apni seemaon tak crop. Logo badle to naya master yahan rakho aur dobara trace karo; `paths.ts` haath se edit mat karo. Bundle me logo sirf tab aata hai jab app `BrandMark`/`BrandLogo` import kare (`test/bundle.test.ts`).

## Naya icon jodna

1. Set ka credit pehle: `src/credits.ts` (`ICON_CREDITS`) aur `LICENSES.md` (set naya ho to).
2. Iconify se data lo (sirf development me, ek baar):

   ```bash
   curl -o solar.json "https://api.iconify.design/solar.json?icons=cart-large-2-linear"
   ```

3. Icon banao (file `src/icons/<naam>.tsx` aur `src/icons/index.ts` script likhti hai; haath se edit mat karo):

   ```bash
   npm run add-icons --workspace @beautinique/frontend-icons -- solar.json cart-large-2-linear=IconCart
   ```

4. `LICENSES.md` me icon ka naam jodo, phir `npm test --workspace @beautinique/frontend-icons` (test har icon ka source, credit aur license line check karta hai).

Script (`scripts/convert.ts`) SVG ko JSX me badalti hai aur aisa kuch bhi mana karti hai jo code chala sake ya bahar jaaye: `<script>`, `<foreignObject>`, `on*` handlers, `style`, bahar ke links (`href`, `url(...)`) aur text.

## License

Package ka code MIT. Icons ke apne licenses hain: [LICENSES.md](LICENSES.md). Solar **CC BY 4.0** hai: jahan icons dikhte hain wahan credit zaroori, isliye har app me "Icon credits" page (`ICON_CREDITS` se banta hai).

## Playground

```bash
npm run playground --workspace @beautinique/frontend-icons
```

http://localhost:5181: saare icons 16/24/32 px pe, light aur dark theme me, credits ke saath.
