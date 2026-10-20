// Generates the colour palette, the light/dark (and high-contrast, print) theme tokens, the tone
// utilities, the order-status tones and the chart colours for variables.css, and checks WCAG
// contrast for the semantic pairs plus how far apart the chart colours are (also for colour-blind eyes).
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
  neutral: {
    rgb: [240, 225, 215],
    chroma: 0.012,
    pins: { 50: [253, 248, 245], 200: [240, 225, 215], 950: [28, 22, 25] },
  },
  success: { rgb: [22, 163, 74] },
  warning: { rgb: [217, 119, 6] },
  error: { rgb: [220, 38, 38] },
  info: { rgb: [37, 99, 235] },
  // Extra hues for charts and category tags only (never for text or status meaning).
  teal: { rgb: [13, 148, 136] },
  violet: { rgb: [124, 58, 237] },
};

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const LIGHTNESS = {
  50: 0.975,
  100: 0.945,
  200: 0.89,
  300: 0.82,
  400: 0.74,
  500: 0.66,
  600: 0.58,
  700: 0.5,
  800: 0.42,
  900: 0.35,
  950: 0.27,
};
const CHROMA = {
  50: 0.12,
  100: 0.25,
  200: 0.45,
  300: 0.68,
  400: 0.88,
  500: 1,
  600: 1,
  700: 0.92,
  800: 0.82,
  900: 0.72,
  950: 0.6,
};

const STATUS = ['success', 'warning', 'error', 'info'];
// Every tone gets base, -hover, -foreground, -subtle, -subtle-foreground and a `tone-<name>` utility.
const TONES = ['brand', 'secondary', 'accent', ...STATUS, 'neutral'];
const CHARTS = 8;

// Order state machine (ARCHITECTURE: commerce) -> tone. <span data-order-status="DELIVERED">
const ORDER_STATUS = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'info',
  ALLOCATED: 'secondary',
  PICKED: 'secondary',
  PACKED: 'secondary',
  DISPATCHED: 'info',
  AT_HUB: 'info',
  OUT_FOR_DELIVERY: 'accent',
  DELIVERED: 'success',
  CANCELLED: 'neutral',
  RTO: 'error',
  RETURN_REQUESTED: 'warning',
  RETURNED: 'neutral',
};
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
    ...tone('neutral', 'neutral-700', 'white', 'neutral-100', 'neutral-800', 'neutral-800'),
    'price-discount': 'success-700',
    rating: 'gold-500',
    'focus-ring': 'rose-600',
    // Chart series: the same hue order in both themes (a series keeps its hue when the theme changes),
    // no green (red/green is the most common deficiency), neighbours apart for colour-blind eyes too.
    'chart-1': 'rose-600',
    'chart-2': 'info-500',
    'chart-3': 'teal-700',
    'chart-4': 'error-800',
    'chart-5': 'warning-500',
    'chart-6': 'gold-700',
    'chart-7': 'violet-800',
    'chart-8': 'plum-700',
    // Brand gradient: the same in both themes (white text on it); gradient text gets lighter in dark.
    'gradient-from': 'rose-600',
    'gradient-to': 'plum-800',
    'gradient-foreground': 'white',
    'gradient-text-from': 'rose-600',
    'gradient-text-to': 'plum-700',
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
    ...Object.assign(
      {},
      ...STATUS.map((s) => tone(s, `${s}-400`, 'neutral-950', `${s}-950`, `${s}-200`, `${s}-300`)),
    ),
    ...tone('neutral', 'neutral-300', 'neutral-950', 'neutral-800', 'neutral-200', 'neutral-200'),
    'price-discount': 'success-300',
    rating: 'gold-400',
    'focus-ring': 'rose-400',
    'chart-1': 'rose-400',
    'chart-2': 'info-300',
    'chart-3': 'teal-500',
    'chart-4': 'error-500',
    'chart-5': 'warning-300',
    'chart-6': 'gold-500',
    'chart-7': 'violet-500',
    'chart-8': 'plum-200',
    'gradient-from': 'rose-600',
    'gradient-to': 'plum-800',
    'gradient-foreground': 'white',
    'gradient-text-from': 'rose-300',
    'gradient-text-to': 'plum-200',
    overlay: 'black',
    'shadow-color': 'black',
  },
};

// High contrast (`<html contrast="more">`, or the system setting): every text pair reaches 7:1 (WCAG
// AAA) and borders become visible boundaries. The Delivery app uses it for reading in sunlight.
const MORE = {
  light: {
    'foreground-muted': 'neutral-950',
    'foreground-subtle': 'neutral-800',
    border: 'neutral-600',
    'border-strong': 'neutral-800',
    'brand-text': 'rose-800',
    'price-discount': 'success-800',
    'focus-ring': 'rose-800',
  },
  dark: {
    'foreground-muted': 'neutral-50',
    'foreground-subtle': 'neutral-200',
    border: 'neutral-500',
    'border-strong': 'neutral-200',
    'brand-text': 'rose-200',
    'price-discount': 'success-200',
    'focus-ring': 'rose-300',
  },
};

// [foreground token, background token, minimum ratio]
const PAIRS = [
  ['foreground', 'background', 4.5],
  ['foreground', 'surface', 4.5],
  ['foreground', 'surface-muted', 4.5],
  ['foreground-muted', 'background', 4.5],
  ['foreground-muted', 'surface', 4.5],
  ['foreground-subtle', 'surface', 4.5],
  ['foreground-subtle', 'background', 4.5],
  ['foreground-inverse', 'surface-inverse', 4.5],
  ['border-strong', 'surface', 3],
  ['border-strong', 'background', 3],
  ['focus-ring', 'background', 3],
  ['focus-ring', 'surface', 3],
  ['brand-text', 'background', 4.5],
  ['brand-text', 'surface', 4.5],
  ['price-discount', 'surface', 4.5],
  ['rating', 'surface', 3],
  ...TONES.flatMap((t) => [
    [`${t}-foreground`, t, 4.5],
    [`${t}-foreground`, `${t}-hover`, 4.5],
    [`${t}-subtle-foreground`, `${t}-subtle`, 4.5],
    [t, 'surface', 3],
  ]),
  // Text on the brand gradient, and gradient text (large text only: 3:1).
  ['gradient-foreground', 'gradient-from', 4.5],
  ['gradient-foreground', 'gradient-to', 4.5],
  ...['gradient-text-from', 'gradient-text-to'].flatMap((t) => [
    [t, 'background', 3],
    [t, 'surface', 3],
  ]),
  // Chart marks are graphics: 3:1 against both page and card (WCAG 1.4.11).
  ...Array.from({ length: CHARTS }, (_, i) => [
    [`chart-${i + 1}`, 'surface', 3],
    [`chart-${i + 1}`, 'background', 3],
  ]).flat(),
];

// Extra pairs for the high-contrast themes: text at AAA, borders as real boundaries.
const MORE_PAIRS = [
  ['foreground-muted', 'surface', 7],
  ['foreground-muted', 'background', 7],
  ['foreground-subtle', 'surface', 7],
  ['foreground-subtle', 'background', 7],
  ['brand-text', 'surface', 7],
  ['brand-text', 'background', 7],
  ['price-discount', 'surface', 7],
  ['border', 'surface', 3],
  ['border', 'background', 3],
  ['border-strong', 'surface', 7],
  ['focus-ring', 'surface', 4.5],
];

/* ---------- Colour maths (sRGB <-> OKLab/OKLCH) ---------- */
const toLin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
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
  const a = C * Math.cos(h),
    b = C * Math.sin(h);
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
  let lo = 0,
    hi = C,
    lin = oklchToLinear(L, C, h);
  if (!inGamut(lin)) {
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear(L, mid, h))) lo = mid;
      else hi = mid;
    }
    lin = oklchToLinear(L, lo, h);
  }
  return lin.map((c) => Math.round(Math.min(1, Math.max(0, fromLin(c))) * 255));
}
const luminance = (rgb) => {
  const [r, g, b] = rgb.map(toLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/* ---------- Build scales ---------- */
const palette = { white: [255, 255, 255], black: [0, 0, 0] };
for (const [name, base] of Object.entries(BASES)) {
  const [bL, bC, h] = rgbToOklch(base.rgb);
  const anchor = STEPS.reduce(
    (best, s) => (Math.abs(LIGHTNESS[s] - bL) < Math.abs(LIGHTNESS[best] - bL) ? s : best),
    STEPS[0],
  );
  for (const s of STEPS) {
    const C = base.chroma ?? (bC * CHROMA[s]) / CHROMA[anchor];
    palette[`${name}-${s}`] =
      base.pins?.[s] ??
      (base.pins
        ? oklchToRgb(LIGHTNESS[s], C, h)
        : s === anchor
          ? base.rgb
          : oklchToRgb(LIGHTNESS[s], C, h));
  }
}

/* ---------- Contrast report ---------- */
let failures = 0;
const report = [];
const variants = Object.keys(THEMES).flatMap((theme) => [
  { name: theme, map: THEMES[theme], pairs: PAIRS },
  {
    name: `${theme}+more`,
    map: { ...THEMES[theme], ...MORE[theme] },
    pairs: [...PAIRS, ...MORE_PAIRS],
  },
]);
for (const { name, map, pairs } of variants) {
  for (const [fg, bg, min] of pairs) {
    const ratio = contrast(palette[map[fg]], palette[map[bg]]);
    if (ratio < min) failures++;
    report.push(
      `${ratio < min ? 'FAIL' : 'ok  '} ${name.padEnd(10)} ${fg} on ${bg}: ${ratio.toFixed(2)} (min ${min})`,
    );
  }
}

/* ---------- Chart colours: far enough apart, also for colour-blind eyes ---------- */
// OKLab distance between two sRGB colours, optionally after simulating a colour vision deficiency
// (Machado et al. 2009, full severity, applied in linear RGB).
const CVD = {
  normal: null,
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};
const simulate = (rgb, matrix) => {
  if (!matrix) return rgb;
  const lin = rgb.map(toLin);
  return matrix.map((row) =>
    Math.round(Math.min(1, Math.max(0, fromLin(row.reduce((s, m, k) => s + m * lin[k], 0)))) * 255),
  );
};
const oklab = (rgb) => {
  const [L, C, h] = rgbToOklch(rgb);
  return [L, C * Math.cos(h), C * Math.sin(h)];
};
const distance = (x, y) => Math.hypot(...oklab(x).map((v, k) => v - oklab(y)[k]));
// Every pair apart for normal vision; neighbouring series (1-2, 2-3 ...) apart for every deficiency.
const CHART_MIN = { all: 0.11, neighbours: 0.11 };
for (const theme of Object.keys(THEMES)) {
  const colours = Array.from(
    { length: CHARTS },
    (_, i) => palette[THEMES[theme][`chart-${i + 1}`]],
  );
  for (const [vision, matrix] of Object.entries(CVD)) {
    const seen = colours.map((c) => simulate(c, matrix));
    const pairs =
      vision === 'normal'
        ? seen.flatMap((a, i) => seen.slice(i + 1).map((b, k) => [i, i + 1 + k, a, b]))
        : seen.slice(1).map((b, i) => [i, i + 1, seen[i], b]);
    const min = vision === 'normal' ? CHART_MIN.all : CHART_MIN.neighbours;
    const [i, k, , , d] = pairs
      .map(([p, q, a, b]) => [p, q, a, b, distance(a, b)])
      .reduce((lo, cur) => (cur[4] < lo[4] ? cur : lo));
    if (d < min) failures++;
    report.push(
      `${d < min ? 'FAIL' : 'ok  '} ${theme.padEnd(10)} charts (${vision}): closest chart-${i + 1}/chart-${k + 1} ${d.toFixed(3)} (min ${min})`,
    );
  }
}

/* ---------- CSS output ---------- */
const ch = (rgb) => rgb.join(', ');
const paletteCss = Object.entries(palette)
  .map(([k, v]) => `  --${k}-rgb: ${ch(v)};`)
  .join('\n');
const themeVars = (map, indent, important = false) => {
  const imp = important ? ' !important' : '';
  return Object.entries(map)
    .map(
      ([k, v]) =>
        `${indent}--${k}-rgb: var(--${v}-rgb)${imp};\n${indent}--${k}: rgb(var(--${k}-rgb))${imp};`,
    )
    .join('\n');
};
const TONE_PARTS = ['', '-hover', '-foreground', '-subtle', '-subtle-foreground'];
const toneVars = (t, indent) =>
  [
    `${indent}--tone-rgb: var(--${t}-rgb);`,
    ...TONE_PARTS.map((p) => `${indent}--tone${p}: var(--${t}${p});`),
  ].join('\n');
const toneUtilities = TONES.map((t) => `@utility tone-${t} {\n${toneVars(t, '  ')}\n}`).join(
  '\n\n',
);
const orderStatusCss = Object.entries(ORDER_STATUS)
  .map(([status, t]) => `  [data-order-status='${status}'] {\n${toneVars(t, '    ')}\n  }`)
  .join('\n\n');
const toneMap = TONE_PARTS.map((p) => `  --color-tone${p}: var(--tone${p});`).join('\n');
const themeMap = Object.keys(palette)
  .map((k) => `  --color-${k}: rgb(var(--${k}-rgb));`)
  .join('\n');
const semanticMap = Object.keys(THEMES.light)
  // gradient stops only feed the gradient utilities, they are not solid-colour utilities
  .filter((k) => !['overlay', 'shadow-color'].includes(k) && !/^gradient-(from|to|text-)/.test(k))
  .map((k) => `  --color-${k}: var(--${k});`)
  .join('\n');

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

/* High contrast: <html contrast="more">, or the system setting when the attribute is absent
   (contrast="normal" opts out). Text reaches 7:1 and borders become visible boundaries. */
[theme='light'][contrast='more'],
:root:not([theme])[contrast='more'] {
${themeVars(MORE.light, '  ')}
}

[theme='dark'][contrast='more'] {
${themeVars(MORE.dark, '  ')}
}

@media (prefers-color-scheme: dark) {
  :root:not([theme])[contrast='more'] {
${themeVars(MORE.dark, '    ')}
  }
}

@media (prefers-contrast: more) {
  [theme='light']:not([contrast]),
  :root:not([theme]):not([contrast]) {
${themeVars(MORE.light, '    ')}
  }

  [theme='dark']:not([contrast]) {
${themeVars(MORE.dark, '    ')}
  }
}

@media (prefers-contrast: more) and (prefers-color-scheme: dark) {
  :root:not([theme]):not([contrast]) {
${themeVars(MORE.dark, '    ')}
  }
}

/* Print: always the light theme (a dark page wastes ink and prints badly) */
@media print {
  :root,
  [theme] {
    color-scheme: light !important;
${themeVars(THEMES.light, '    ', true)}
  }
}

/* Tailwind: palette utilities (bg-rose-600, text-neutral-700, ...) */
@theme {
${themeMap}
}

/* Tailwind: semantic utilities (bg-brand, text-foreground-muted, border-border, bg-chart-1, ...)
   and the current tone (bg-tone, text-tone-foreground, bg-tone-subtle, ...) */
@theme inline {
${semanticMap}
${toneMap}
}

/* Tones: one component, any colour. tone-success sets --tone, --tone-hover, --tone-foreground,
   --tone-subtle and --tone-subtle-foreground (and --tone-rgb); the component uses bg-tone,
   text-tone-foreground, bg-tone-subtle ... The default tone is brand. */
@layer base {
  :root,
  [theme] {
${toneVars('brand', '    ')}
  }
}

${toneUtilities}

/* Order status -> tone, the same in every app: <span data-order-status="OUT_FOR_DELIVERY">.
   In the components layer, so a tone-* class on the element still wins. */
@layer components {
${orderStatusCss}
}
${END}`;

// LF everywhere: a Windows checkout with core.autocrlf must not look "out of date"
const css = readFileSync(FILE, 'utf8').replaceAll('\r\n', '\n');
const [i, j] = [css.indexOf(START), css.indexOf(END)];
if (i < 0 || j < 0) throw new Error('generated markers not found in src/variables.css');
const next = css.slice(0, i) + generated + css.slice(j + END.length);

console.log(report.filter((l) => l.startsWith('FAIL')).join('\n') || 'All colour checks passed.');
console.log(`${report.length - failures}/${report.length} checks pass.`);
if (process.argv.includes('--check')) {
  if (next !== css) {
    console.error('variables.css is out of date: run npm run palette');
    process.exit(1);
  }
  process.exit(failures ? 1 : 0);
}
if (failures) process.exitCode = 1;
writeFileSync(FILE, next);
console.log('variables.css updated.');
