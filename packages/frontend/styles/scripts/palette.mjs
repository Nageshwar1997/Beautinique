// Generates the colour palette and light/dark theme tokens for variables.css,
// and checks WCAG contrast for the semantic pairs.
// Usage: node scripts/palette.mjs          (write + report)
//        node scripts/palette.mjs --check  (report only; exit 1 on failure)
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../src/variables.css', import.meta.url);
const START = '/* @generated:start - edit scripts/palette.mjs, then run `npm run palette` */';
const END = '/* @generated:end */';

/* ---------- Brand inputs (the only place to change colours) ---------- */
const BASES = {
  rose: { rgb: [214, 51, 108] }, // brand
  plum: { rgb: [92, 26, 70] }, // brand deep
  gold: { rgb: [196, 154, 82] }, // champagne accent
  neutral: { rgb: [240, 225, 215], chroma: 0.012, pins: { 50: [253, 248, 245], 200: [240, 225, 215], 950: [28, 22, 25] } },
  success: { rgb: [22, 163, 74] },
  warning: { rgb: [217, 119, 6] },
  error: { rgb: [220, 38, 38] },
  info: { rgb: [37, 99, 235] },
};

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const LIGHTNESS = { 50: 0.975, 100: 0.945, 200: 0.89, 300: 0.82, 400: 0.74, 500: 0.66, 600: 0.58, 700: 0.5, 800: 0.42, 900: 0.35, 950: 0.27 };
const CHROMA = { 50: 0.12, 100: 0.25, 200: 0.45, 300: 0.68, 400: 0.88, 500: 1, 600: 1, 700: 0.92, 800: 0.82, 900: 0.72, 950: 0.6 };

const STATUS = ['success', 'warning', 'error', 'info'];
const tone = (name, base, fg, subtle, subtleFg, hover) => ({
  [name]: base,
  [`${name}-hover`]: hover,
  [`${name}-foreground`]: fg,
  [`${name}-subtle`]: subtle,
  [`${name}-subtle-foreground`]: subtleFg,
});

const THEMES = {
  light: {
    background: 'neutral-50',
    surface: 'white',
    'surface-muted': 'neutral-100',
    'surface-inverse': 'neutral-950',
    foreground: 'neutral-950',
    'foreground-muted': 'neutral-800',
    'foreground-subtle': 'neutral-700',
    'foreground-inverse': 'neutral-50',
    border: 'neutral-200',
    'border-strong': 'neutral-600',
    ...tone('brand', 'rose-600', 'white', 'rose-50', 'rose-800', 'rose-700'),
    'brand-text': 'rose-700',
    ...tone('secondary', 'plum-800', 'white', 'plum-50', 'plum-800', 'plum-900'),
    // Dark text on gold, so hover gets lighter, not darker.
    ...tone('accent', 'gold-500', 'neutral-950', 'gold-50', 'gold-800', 'gold-400'),
    ...tone('success', 'success-700', 'white', 'success-50', 'success-800', 'success-800'),
    ...tone('warning', 'warning-500', 'neutral-950', 'warning-50', 'warning-800', 'warning-400'),
    ...tone('error', 'error-600', 'white', 'error-50', 'error-800', 'error-700'),
    ...tone('info', 'info-600', 'white', 'info-50', 'info-800', 'info-700'),
    'price-discount': 'success-700',
    rating: 'gold-500',
    'focus-ring': 'rose-600',
    overlay: 'neutral-950',
    'shadow-color': 'neutral-950',
  },
  dark: {
    background: 'neutral-950',
    surface: 'neutral-900',
    'surface-muted': 'neutral-800',
    'surface-inverse': 'neutral-50',
    foreground: 'neutral-50',
    'foreground-muted': 'neutral-300',
    'foreground-subtle': 'neutral-400',
    'foreground-inverse': 'neutral-950',
    border: 'neutral-800',
    'border-strong': 'neutral-500',
    ...tone('brand', 'rose-400', 'neutral-950', 'rose-950', 'rose-200', 'rose-300'),
    'brand-text': 'rose-300',
    ...tone('secondary', 'plum-300', 'neutral-950', 'plum-950', 'plum-200', 'plum-200'),
    ...tone('accent', 'gold-400', 'neutral-950', 'gold-950', 'gold-200', 'gold-300'),
    ...Object.assign({}, ...STATUS.map((s) => tone(s, `${s}-400`, 'neutral-950', `${s}-950`, `${s}-200`, `${s}-300`))),
    'price-discount': 'success-300',
    rating: 'gold-400',
    'focus-ring': 'rose-400',
    overlay: 'black',
    'shadow-color': 'black',
  },
};

// [foreground token, background token, minimum ratio]
const PAIRS = [
  ['foreground', 'background', 4.5], ['foreground', 'surface', 4.5], ['foreground', 'surface-muted', 4.5],
  ['foreground-muted', 'background', 4.5], ['foreground-muted', 'surface', 4.5],
  ['foreground-subtle', 'surface', 4.5], ['foreground-subtle', 'background', 4.5],
  ['foreground-inverse', 'surface-inverse', 4.5],
  ['border-strong', 'surface', 3], ['border-strong', 'background', 3],
  ['focus-ring', 'background', 3], ['focus-ring', 'surface', 3],
  ['brand-text', 'background', 4.5], ['brand-text', 'surface', 4.5],
  ['price-discount', 'surface', 4.5], ['rating', 'surface', 3],
  ...['brand', 'secondary', 'accent', ...STATUS].flatMap((t) => [
    [`${t}-foreground`, t, 4.5], [`${t}-foreground`, `${t}-hover`, 4.5],
    [`${t}-subtle-foreground`, `${t}-subtle`, 4.5], [t, 'surface', 3],
  ]),
];

/* ---------- Colour maths (sRGB <-> OKLab/OKLCH) ---------- */
const toLin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const fromLin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function rgbToOklch([r8, g8, b8]) {
  const [r, g, b] = [r8, g8, b8].map(toLin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(a, bb), Math.atan2(bb, a)];
}
function oklchToLinear(L, C, h) {
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
const inGamut = (lin) => lin.every((c) => c >= -1e-4 && c <= 1 + 1e-4);
function oklchToRgb(L, C, h) {
  let lo = 0, hi = C, lin = oklchToLinear(L, C, h);
  if (!inGamut(lin)) {
    for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (inGamut(oklchToLinear(L, mid, h))) lo = mid; else hi = mid; }
    lin = oklchToLinear(L, lo, h);
  }
  return lin.map((c) => Math.round(Math.min(1, Math.max(0, fromLin(c))) * 255));
}
const luminance = (rgb) => { const [r, g, b] = rgb.map(toLin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/* ---------- Build scales ---------- */
const palette = { white: [255, 255, 255], black: [0, 0, 0] };
for (const [name, base] of Object.entries(BASES)) {
  const [bL, bC, h] = rgbToOklch(base.rgb);
  const anchor = STEPS.reduce((best, s) => (Math.abs(LIGHTNESS[s] - bL) < Math.abs(LIGHTNESS[best] - bL) ? s : best), STEPS[0]);
  for (const s of STEPS) {
    const C = base.chroma ?? (bC * CHROMA[s]) / CHROMA[anchor];
    palette[`${name}-${s}`] = base.pins?.[s] ?? (base.pins ? oklchToRgb(LIGHTNESS[s], C, h) : s === anchor ? base.rgb : oklchToRgb(LIGHTNESS[s], C, h));
  }
}

/* ---------- Contrast report ---------- */
let failures = 0;
const report = [];
for (const [theme, map] of Object.entries(THEMES)) {
  for (const [fg, bg, min] of PAIRS) {
    const ratio = contrast(palette[map[fg]], palette[map[bg]]);
    if (ratio < min) failures++;
    report.push(`${ratio < min ? 'FAIL' : 'ok  '} ${theme.padEnd(5)} ${fg} on ${bg}: ${ratio.toFixed(2)} (min ${min})`);
  }
}

/* ---------- CSS output ---------- */
const ch = (rgb) => rgb.join(', ');
const paletteCss = Object.entries(palette).map(([k, v]) => `  --${k}-rgb: ${ch(v)};`).join('\n');
const themeVars = (map, indent) =>
  Object.entries(map).map(([k, v]) => `${indent}--${k}-rgb: var(--${v}-rgb);\n${indent}--${k}: rgb(var(--${k}-rgb));`).join('\n');
const themeMap = Object.keys(palette).map((k) => `  --color-${k}: rgb(var(--${k}-rgb));`).join('\n');
const semanticMap = Object.keys(THEMES.light)
  .filter((k) => !['overlay', 'shadow-color'].includes(k))
  .map((k) => `  --color-${k}: var(--${k});`).join('\n');

const generated = `${START}

/* Palette: raw RGB channels. Use as rgb(var(--rose-600-rgb)) or rgba(var(--rose-600-rgb), 0.5). */
:root {
${paletteCss}
}

/* Light theme (default) */
:root,
[theme='light'] {
  color-scheme: light;
${themeVars(THEMES.light, '  ')}
}

/* Dark theme */
[theme='dark'] {
  color-scheme: dark;
${themeVars(THEMES.dark, '  ')}
}

/* No theme attribute yet (before JS runs): follow the system setting */
@media (prefers-color-scheme: dark) {
  :root:not([theme]) {
    color-scheme: dark;
${themeVars(THEMES.dark, '    ')}
  }
}

/* Tailwind: palette utilities (bg-rose-600, text-neutral-700, ...) */
@theme {
${themeMap}
}

/* Tailwind: semantic utilities (bg-brand, text-foreground-muted, border-border, ...) */
@theme inline {
${semanticMap}
}
${END}`;

// LF everywhere: a Windows checkout with core.autocrlf must not look "out of date"
const css = readFileSync(FILE, 'utf8').replaceAll('\r\n', '\n');
const [i, j] = [css.indexOf(START), css.indexOf(END)];
if (i < 0 || j < 0) throw new Error('generated markers not found in src/variables.css');
const next = css.slice(0, i) + generated + css.slice(j + END.length);

console.log(report.filter((l) => l.startsWith('FAIL')).join('\n') || 'All contrast checks passed.');
console.log(`${report.length - failures}/${report.length} pairs pass.`);
if (process.argv.includes('--check')) {
  if (next !== css) { console.error('variables.css is out of date: run npm run palette'); process.exit(1); }
  process.exit(failures ? 1 : 0);
}
if (failures) process.exitCode = 1;
writeFileSync(FILE, next);
console.log('variables.css updated.');
