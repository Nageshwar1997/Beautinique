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
  teal: { rgb: [13, 148, 136], chartOnly: true },
  violet: { rgb: [124, 58, 237], chartOnly: true },
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
// The tone every element has until a tone-* class or an order status sets another (README: Tones).
const DEFAULT_TONE = 'brand';
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
// High contrast for a tone: a deeper (light) or lighter (dark) solid colour, so its text reaches 7:1.
const strongTone = (name, base, fg, hover) => ({
  [name]: base,
  [`${name}-hover`]: hover,
  [`${name}-foreground`]: fg,
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
    // the ring on an inverse strip (surface-inverse utility): light rose shows on the dark strip
    'focus-ring-inverse': 'rose-400',
    // brand text (links, current page) on that strip: the surface-inverse utility swaps it in
    'brand-text-inverse': 'rose-300',
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
    'focus-ring-inverse': 'rose-700',
    'brand-text-inverse': 'rose-700',
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
// AAA), including the text on tones (buttons, badges) and on the brand gradient, and borders become
// visible boundaries. The Delivery app uses it for reading in sunlight. Light and dark override the
// same tokens (some keep their normal colour, which is already strong enough).
const MORE = {
  light: {
    'foreground-muted': 'neutral-950',
    'foreground-subtle': 'neutral-800',
    border: 'neutral-600',
    'border-strong': 'neutral-800',
    'brand-text': 'rose-800',
    'price-discount': 'success-800',
    'focus-ring': 'rose-800',
    'focus-ring-inverse': 'rose-300',
    'brand-text-inverse': 'rose-200',
    ...strongTone('brand', 'rose-800', 'white', 'rose-900'),
    ...strongTone('secondary', 'plum-800', 'white', 'plum-900'),
    ...strongTone('accent', 'gold-800', 'white', 'gold-900'),
    ...Object.assign({}, ...STATUS.map((s) => strongTone(s, `${s}-800`, 'white', `${s}-900`))),
    ...strongTone('neutral', 'neutral-800', 'white', 'neutral-900'),
    'neutral-subtle-foreground': 'neutral-900',
    'gradient-from': 'rose-800',
  },
  dark: {
    'foreground-muted': 'neutral-50',
    'foreground-subtle': 'neutral-200',
    border: 'neutral-500',
    'border-strong': 'neutral-200',
    'brand-text': 'rose-200',
    'price-discount': 'success-200',
    'focus-ring': 'rose-300',
    'focus-ring-inverse': 'rose-800',
    'brand-text-inverse': 'rose-800',
    ...strongTone('brand', 'rose-300', 'neutral-950', 'rose-200'),
    ...strongTone('secondary', 'plum-300', 'neutral-950', 'plum-200'),
    ...strongTone('accent', 'gold-300', 'neutral-950', 'gold-200'),
    ...Object.assign(
      {},
      ...STATUS.map((s) => strongTone(s, `${s}-300`, 'neutral-950', `${s}-200`)),
    ),
    ...strongTone('neutral', 'neutral-300', 'neutral-950', 'neutral-200'),
    'neutral-subtle-foreground': 'neutral-100',
    'gradient-from': 'rose-800',
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
  ['focus-ring-inverse', 'surface-inverse', 3],
  ['brand-text', 'background', 4.5],
  ['brand-text', 'surface', 4.5],
  ['brand-text-inverse', 'surface-inverse', 4.5],
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

// Extra pairs for the high-contrast themes: all text at AAA (also on tones and the gradient), borders
// as real boundaries, the focus ring stronger than normal.
const MORE_PAIRS = [
  ...TONES.flatMap((t) => [
    [`${t}-foreground`, t, 7],
    [`${t}-foreground`, `${t}-hover`, 7],
    [`${t}-subtle-foreground`, `${t}-subtle`, 7],
  ]),
  ['gradient-foreground', 'gradient-from', 7],
  ['gradient-foreground', 'gradient-to', 7],
  ['focus-ring-inverse', 'surface-inverse', 4.5],
  ['foreground-muted', 'surface', 7],
  ['foreground-muted', 'background', 7],
  ['foreground-subtle', 'surface', 7],
  ['foreground-subtle', 'background', 7],
  ['brand-text', 'surface', 7],
  ['brand-text', 'background', 7],
  ['brand-text-inverse', 'surface-inverse', 7],
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

let failures = 0;
const report = [];
const check = (ok, line) => {
  if (!ok) failures++;
  report.push(`${ok ? 'ok  ' : 'FAIL'} ${line}`);
};

/* ---------- Every theme has every token, and every token is a palette colour ---------- */
// First, so a missing or misspelled token is named here instead of breaking the maths below.
const lightTokens = Object.keys(THEMES.light);
for (const [theme, map] of Object.entries(THEMES)) {
  const missing = lightTokens.filter((token) => !(token in map));
  const extra = Object.keys(map).filter((token) => !(token in THEMES.light));
  check(
    missing.length === 0 && extra.length === 0,
    `${theme} has the same tokens as light${missing.length ? `; missing: ${missing.join(', ')}` : ''}${
      extra.length ? `; only in ${theme}: ${extra.join(', ')}` : ''
    }`,
  );
}
for (const [theme, overrides] of Object.entries(MORE)) {
  const unknown = Object.keys(overrides).filter((token) => !(token in (THEMES[theme] ?? {})));
  check(
    theme in THEMES && unknown.length === 0,
    `high contrast for ${theme} overrides only ${theme} tokens${unknown.length ? `; unknown: ${unknown.join(', ')}` : ''}`,
  );
}
for (const [name, map] of [
  ...Object.entries(THEMES),
  ...Object.entries(MORE).map(([theme, overrides]) => [`${theme}+more`, overrides]),
]) {
  const bad = Object.entries(map).filter(([, colour]) => !palette[colour]);
  check(
    bad.length === 0,
    `every ${name} token is a palette colour${bad.length ? `; not in the palette: ${bad.map(([t, c]) => `${t}: ${c}`).join(', ')}` : ''}`,
  );
}

/* ---------- Contrast report ---------- */
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
    const [a, b] = [palette[map[fg]], palette[map[bg]]];
    if (!a || !b) {
      check(false, `${name.padEnd(10)} ${fg} on ${bg}: ${a ? bg : fg} is not defined`);
      continue;
    }
    const ratio = contrast(a, b);
    check(ratio >= min, `${name.padEnd(10)} ${fg} on ${bg}: ${ratio.toFixed(2)} (min ${min})`);
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
  if (colours.some((c) => !c)) {
    check(false, `${theme.padEnd(10)} charts: chart-1 … chart-${CHARTS} are not all defined`);
    continue;
  }
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

/* ---------- Meaning: what a contrast ratio cannot see ---------- */
// The colour family of a palette entry: rose-600 → rose. White, black and every grey scale (a family
// whose mid step has almost no chroma, like neutral) count as one "grey" family.
const GREYS = new Set([
  'white',
  'black',
  ...Object.keys(BASES).filter((f) => rgbToOklch(palette[`${f}-500`])[1] < 0.03),
]);
const family = (colour) => {
  const name = colour.replace(/-\d+$/, '');
  return GREYS.has(name) ? 'grey' : name;
};
// Tokens whose hue means something: a tone, a status, a chart series, the brand, a rating. Text on a
// solid colour (-foreground), the plain text, surfaces, borders, the overlay and shadows may change hue.
const carriesHue = (token) =>
  !/^(foreground|background|surface|border|overlay|shadow-color)/.test(token) &&
  !(token.endsWith('-foreground') && !token.endsWith('-subtle-foreground'));
const CHART_ONLY = Object.keys(BASES).filter((f) => BASES[f].chartOnly);
// The smallest contrast against the surface that still reads as a tint or a line (1.00 = invisible).
const VISIBLE = 1.05;

for (const { name, map } of variants) {
  const rgb = (token) => palette[map[token]];
  // a missing or misspelled token was named above; skip what needs it instead of failing on it twice
  const has = (...tokens) => tokens.every((token) => palette[map[token]]);
  for (const t of TONES) {
    if (
      !has(
        'surface',
        ...['', '-hover', '-foreground', '-subtle', '-subtle-foreground'].map((p) => `${t}${p}`),
      )
    ) {
      continue;
    }
    // Contrast is the same both ways, so a swapped pair passes it: the subtle background must sit near
    // the surface and its text far from it, and the tint must still be visible.
    const tint = contrast(rgb(`${t}-subtle`), rgb('surface'));
    check(
      tint < contrast(rgb(`${t}-subtle-foreground`), rgb('surface')),
      `${name.padEnd(10)} ${t}-subtle is the tint, ${t}-subtle-foreground its text`,
    );
    check(
      tint >= VISIBLE,
      `${name.padEnd(10)} ${t}-subtle is visible on the surface: ${tint.toFixed(2)} (min ${VISIBLE})`,
    );
    // Hover moves away from the label (darker under white text, lighter under dark text), never back.
    check(
      contrast(rgb(`${t}-foreground`), rgb(`${t}-hover`)) >
        contrast(rgb(`${t}-foreground`), rgb(t)),
      `${name.padEnd(10)} ${t}-hover gives its text more contrast than ${t}`,
    );
    // A tone is one hue: hover, tint and tint text are shades of it (a brand button never hovers plum).
    const off = ['-hover', '-subtle', '-subtle-foreground']
      .map((part) => `${t}${part}`)
      .filter((token) => family(map[token]) !== family(map[t]));
    check(
      off.length === 0,
      `${name.padEnd(10)} ${t}: hover and tint stay in its hue${off.length ? ` (${off.map((x) => `${x}: ${map[x]}`).join(', ')})` : ''}`,
    );
  }
  if (has('border', 'surface')) {
    const line = contrast(rgb('border'), rgb('surface'));
    check(
      line >= VISIBLE,
      `${name.padEnd(10)} border is visible on the surface: ${line.toFixed(2)} (min ${VISIBLE})`,
    );
  }
  // Contrast is symmetric here too: the inverse strip must be the opposite of the page, not a copy of it.
  if (has('surface-inverse', 'background')) {
    const inverse = contrast(rgb('surface-inverse'), rgb('background'));
    check(
      inverse >= 4.5,
      `${name.padEnd(10)} surface-inverse is the opposite of the page: ${inverse.toFixed(2)} (min 4.5)`,
    );
  }
  const misuse = Object.entries(map).filter(
    ([token, colour]) => !token.startsWith('chart-') && CHART_ONLY.includes(family(colour)),
  );
  check(
    misuse.length === 0,
    `${name.padEnd(10)} ${CHART_ONLY.join(' and ')} only in charts${misuse.length ? ` (${misuse.map(([t, c]) => `${t}: ${c}`).join(', ')})` : ''}`,
  );
}

// A token keeps its hue when the theme changes (a chart series, a status, the brand), and high contrast
// only makes it lighter or darker. The brand gradient is the same in every theme.
for (const [theme, map] of Object.entries(THEMES)) {
  if (theme === 'light') continue;
  for (const token of lightTokens.filter(
    (t) => carriesHue(t) && palette[map[t]] && palette[THEMES.light[t]],
  )) {
    check(
      family(map[token]) === family(THEMES.light[token]),
      `${token} keeps its hue in ${theme} (${THEMES.light[token]} / ${map[token]})`,
    );
  }
  for (const token of ['gradient-from', 'gradient-to', 'gradient-foreground']) {
    check(
      map[token] === THEMES.light[token],
      `${token} is the same in ${theme} and light (${THEMES.light[token]} / ${map[token]})`,
    );
  }
}
for (const [theme, overrides] of Object.entries(MORE)) {
  for (const [token, colour] of Object.entries(overrides)) {
    const base = THEMES[theme]?.[token];
    if (!base || !carriesHue(token) || !palette[colour] || !palette[base]) continue;
    check(
      family(colour) === family(base),
      `${theme}+more ${token} keeps its hue (${base} / ${colour})`,
    );
  }
}

// What the README documents must be what the code does: the order status table, the default tone and
// the chart hue order. Only the README's "### Order status" section is read.
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8').replaceAll(
  '\r\n',
  '\n',
);
const toneList = TONES.join(', ');
const section = /^### Order status\n([\s\S]*?)(?=^#{1,3} )/m.exec(readme)?.[1] ?? '';
const rows = section.split('\n').filter((l) => l.trim().startsWith('|'));
const header = (rows[0] ?? '').split('|').map((c) => c.trim().toLowerCase());
const [toneCol, statusCol] = [header.indexOf('tone'), header.indexOf('status')];
check(
  toneCol > 0 && statusCol > 0,
  'the README has a Tone | Status table under "### Order status"',
);
const documented = {};
for (const row of rows.slice(2)) {
  const cells = row.split('|').map((c) => c.trim());
  const tone = cells[toneCol]?.replaceAll('`', '');
  const statuses = [...(cells[statusCol] ?? '').matchAll(/`([A-Z][A-Z0-9_]*)`/g)].map((m) => m[1]);
  if (!tone || statuses.length === 0) {
    check(false, `README order status row is not "tone | \`STATUS\`, ...": ${row.trim()}`);
    continue;
  }
  check(
    TONES.includes(tone),
    `README order status row uses ${tone}${TONES.includes(tone) ? '' : `, which is not a tone (${toneList})`}`,
  );
  for (const status of statuses) (documented[status] ??= []).push(tone);
}
for (const [status, tone] of Object.entries(ORDER_STATUS)) {
  if (!TONES.includes(tone))
    check(false, `order status ${status} uses ${tone}, which is not a tone (${toneList})`);
}
for (const status of new Set([...Object.keys(ORDER_STATUS), ...Object.keys(documented)])) {
  const tones = documented[status] ?? [];
  if (tones.length > 1) {
    check(
      false,
      `order status ${status} is listed more than once in the README (${tones.join(', ')})`,
    );
    continue;
  }
  check(
    tones[0] === ORDER_STATUS[status],
    `order status ${status} is ${ORDER_STATUS[status] ?? 'missing'} here and ${tones[0] ?? 'missing'} in the README`,
  );
}
const documentedDefault = /Default tone:?\s*`([a-z]+)`/.exec(readme)?.[1];
if (!TONES.includes(DEFAULT_TONE))
  check(false, `DEFAULT_TONE ${DEFAULT_TONE} is not a tone (${toneList})`);
check(
  documentedDefault === DEFAULT_TONE,
  `default tone is ${DEFAULT_TONE} here and ${documentedDefault ?? 'missing'} in the README ("Default tone \`name\`")`,
);
// A chart series is named by its hue in the README: (rose, blue, teal, red, orange, gold, violet, plum)
const HUE_NAMES = { info: 'blue', error: 'red', warning: 'orange', success: 'green' };
const chartHues = Array.from({ length: CHARTS }, (_, i) =>
  family(THEMES.light[`chart-${i + 1}`] ?? ''),
)
  .map((f) => HUE_NAMES[f] ?? f)
  .join(', ');
const documentedHues = /series ka hue same rehta hai \(([a-z, ]+)\)/.exec(readme)?.[1];
check(
  documentedHues === chartHues,
  `chart hue order is (${chartHues}) here and (${documentedHues ?? 'missing'}) in the README`,
);

/* ---------- CSS output ---------- */
const ch = (rgb) => rgb.join(', ');
const paletteCss = Object.entries(palette)
  .map(([k, v]) => `  --${k}-rgb: ${ch(v)};`)
  .join('\n');
// Luminance where black and white text have the same contrast: darker backgrounds are dark schemes.
const SCHEME_CROSSOVER = 0.179;
const schemeOf = (colour) => (luminance(palette[colour]) < SCHEME_CROSSOVER ? 'dark' : 'light');
const themeVars = (map, indent, important = false) => {
  const imp = important ? ' !important' : '';
  // a block that sets the page background also tells the browser its scheme (native controls, scrollbars)
  const scheme = map.background
    ? [`${indent}color-scheme: ${schemeOf(map.background)}${imp};`]
    : [];
  return [
    ...scheme,
    ...Object.entries(map).map(
      ([k, v]) =>
        `${indent}--${k}-rgb: var(--${v}-rgb)${imp};\n${indent}--${k}: rgb(var(--${k}-rgb))${imp};`,
    ),
  ].join('\n');
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
${themeVars(THEMES.light, '  ')}
}

/* Dark theme */
[theme='dark'] {
${themeVars(THEMES.dark, '  ')}
}

/* No theme attribute yet (before JS runs): follow the system setting */
@media (prefers-color-scheme: dark) {
  :root:not([theme]) {
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
   text-tone-foreground, bg-tone-subtle ... The default tone is ${DEFAULT_TONE}. */
@layer base {
  :root,
  [theme] {
${toneVars(DEFAULT_TONE, '    ')}
  }
}

${toneUtilities}

/* Order status -> tone, the same in every app: <span data-order-status="OUT_FOR_DELIVERY">.
   In the components layer, so a tone-* class on the element still wins. */
@layer components {
${orderStatusCss}
}
${END}`;

// The generated CSS itself: every block that sets the page background declares exactly the scheme of
// that background (native controls, scrollbars and form fields then match it), and no other block sets
// a scheme. The default tone block is there and uses DEFAULT_TONE.
const blocksOut = [...generated.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => [
  selector
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim()
    .replace(/\s+/g, ' '),
  body,
]);
const withBackground = blocksOut.filter(([, body]) => /--background-rgb:/.test(body));
check(withBackground.length >= 4, 'light, dark, automatic dark and print blocks are generated');
for (const [selector, body] of blocksOut) {
  const background = /--background-rgb: var\(--([\w-]+)-rgb\)/.exec(body)?.[1];
  const schemes = [...body.matchAll(/color-scheme:\s*([^;]*);/g)].map((m) =>
    m[1].replace(/\s*!important$/, ''),
  );
  if (!background) {
    if (schemes.length) check(false, `${selector}: sets color-scheme but not the background`);
    continue;
  }
  const expected = palette[background] ? schemeOf(background) : 'unknown';
  check(
    schemes.length === 1 && schemes[0] === expected,
    `${selector}: color-scheme ${schemes.join(' + ') || 'missing'} on a ${expected} background (${background})`,
  );
}
const defaultTone = /@layer base \{\s*:root,\s*\[theme\] \{([^{}]*)\}/.exec(generated)?.[1] ?? '';
check(
  defaultTone.includes(`--tone: var(--${DEFAULT_TONE});`) &&
    defaultTone.includes(`--tone-rgb: var(--${DEFAULT_TONE}-rgb);`),
  `the default tone block (@layer base > :root, [theme]) is generated with ${DEFAULT_TONE}`,
);

// LF everywhere: a Windows checkout with core.autocrlf must not look "out of date"
const css = readFileSync(FILE, 'utf8').replaceAll('\r\n', '\n');
const [i, j] = [css.indexOf(START), css.indexOf(END)];
if (i < 0 || j < 0) throw new Error('generated markers not found in src/variables.css');
const next = css.slice(0, i) + generated + css.slice(j + END.length);

// --verbose prints every check with its number, not only the failures
if (process.argv.includes('--verbose')) console.log(report.join('\n'));
else
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
