#!/usr/bin/env node
/**
 * Beautinique font pipeline.
 *
 *   npm run fonts                 download the pinned sources (cached in node_modules/.cache), subset them and
 *                                 write src/fonts/*.woff2, the licences, src/fonts/manifest.json and the
 *                                 generated part of src/fonts.css
 *   npm run fonts:check           offline: shipped files match the manifest, fonts.css is current, and the files
 *                                 still have the rupee sign, the weight axis, tabular figures and Marathi forms
 *   node scripts/fonts.mjs --measure <font file> [postscriptName]
 *                                 print the metrics of a local font (used once for the Nirmala UI numbers below)
 *
 * Sources: google/fonts at a pinned commit, checked by sha256. Every family is OFL-1.1 with no Reserved Font Name,
 * so subsetting is allowed; each family's OFL.txt ships next to the files and the copyright/licence name records
 * stay inside every woff2.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as hb from 'harfbuzzjs';
import { fromBuffer } from '@capsizecss/unpack';

const require = createRequire(import.meta.url);
const subsetFont = require('subset-font');
const fontkit = require('fontkit');

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FONTS_DIR = join(ROOT, 'src/fonts');
const CSS_FILE = join(ROOT, 'src/fonts.css');
const MANIFEST_FILE = join(FONTS_DIR, 'manifest.json');
const CACHE_DIR = join(ROOT, 'node_modules/.cache/beautinique-fonts');
const START = '/* @generated:start - edit scripts/fonts.mjs, then run `npm run fonts` */';
const END = '/* @generated:end */';

/* ---------------------------------------------------------------- config */

const GOOGLE_FONTS = 'https://raw.githubusercontent.com/google/fonts/47d54ca1ebb14fd864695f1d39dc734f39017c33/';

const SOURCES = {
  jakarta: { path: 'ofl/plusjakartasans/PlusJakartaSans[wght].ttf', sha256: '89b3fb38aa0d275d7a731d0d817a4f1622b316b4d7fbdedcf02ee9099ff68bc8' },
  jakartaItalic: { path: 'ofl/plusjakartasans/PlusJakartaSans-Italic[wght].ttf', sha256: '9529eb888668b6a3c6dd75b6341a2fc5263fb6c9e788822e6117c29dd9e8b115' },
  fraunces: { path: 'ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf', sha256: '177ff6c0f14e5550a3c624247cd1189611d4eb65d000b14944c63d967958abbb' },
  frauncesItalic: { path: 'ofl/fraunces/Fraunces-Italic[SOFT,WONK,opsz,wght].ttf', sha256: 'b24448c43702fac4ee856781d461a0dfba8d8e594b6e8e190234b75fed2c0e01' },
  notoDevanagari: { path: 'ofl/notosansdevanagari/NotoSansDevanagari[wdth,wght].ttf', sha256: '14ec4af41f27482216d1c2229f417ff9b1425e1babb014e57d1d40d03229853e' },
};

const LICENSES = {
  'plus-jakarta-sans-OFL.txt': { path: 'ofl/plusjakartasans/OFL.txt', sha256: '995c7199cab65954f545996326755daee7b63cc6b42b06c13da1f9502ab08a99' },
  'fraunces-OFL.txt': { path: 'ofl/fraunces/OFL.txt', sha256: 'bdf4c22802eaf804f998195871c6b8938aac2ac14b2d78a8bd66a6f1eced833b' },
  'noto-sans-devanagari-OFL.txt': { path: 'ofl/notosansdevanagari/OFL.txt', sha256: 'a216f6f8d85c7228093e0ee5e258d9d377e6671f68acb4db1930b29583d0f331' },
};

/** Every face covers exactly these weights (the variable wght axis is cut to this range). */
const WEIGHT = { min: 300, max: 700 };

/** Fraunces: sharp (SOFT 0), no wonky letters (WONK 0), the refined display cut (opsz 72). */
const FRAUNCES_AXES = { SOFT: 0, WONK: 0, opsz: 72 };

/** Subsets (code points). Latin includes the rupee sign, so an English page needs one file per family. */
const SUBSETS = {
  latin: cps('0000-00FF 0131 0152-0153 02BB-02BC 02C6 02DA 02DC 0304 0308 0329 2000-200B 200E-206F 20AC 20B9 2122 2190-2193 2212 2215 FEFF FFFD'),
  devanagari: cps('0900-097F 1CD0-1CF9 200C-200D 20F0 25CC A830-A839 A8E0-A8FF'),
};
SUBSETS['latin-ext'] = cps('0100-02BA 02BD-02C5 02C7-02CC 02CE-02D7 02DD-02FF 1D00-1DBF 1E00-1E9F 1EF2-1EFF 20A0-20C0 2113 2C60-2C7F A720-A7FF').filter((c) => !SUBSETS.latin.includes(c));

/**
 * Output files: name -> source, subset and pinned axes (wght is always cut to WEIGHT).
 * tnum: the file must keep tabular figures (prices use the sans family; Fraunces has none).
 */
const FILES = {
  'plus-jakarta-sans-latin': { source: 'jakarta', subset: 'latin', tnum: true },
  'plus-jakarta-sans-latin-ext': { source: 'jakarta', subset: 'latin-ext' },
  'plus-jakarta-sans-italic-latin': { source: 'jakartaItalic', subset: 'latin', tnum: true },
  'plus-jakarta-sans-italic-latin-ext': { source: 'jakartaItalic', subset: 'latin-ext' },
  'fraunces-latin': { source: 'fraunces', subset: 'latin', axes: FRAUNCES_AXES },
  'fraunces-latin-ext': { source: 'fraunces', subset: 'latin-ext', axes: FRAUNCES_AXES },
  'fraunces-italic-latin': { source: 'frauncesItalic', subset: 'latin', axes: FRAUNCES_AXES },
  'fraunces-italic-latin-ext': { source: 'frauncesItalic', subset: 'latin-ext', axes: FRAUNCES_AXES },
  'noto-sans-devanagari': { source: 'notoDevanagari', subset: 'devanagari', axes: { wdth: 100 } },
};

/**
 * Families. Each style lists its files; each file becomes one @font-face with the unicode-range it really covers.
 * All faces of a family share font-weight/style descriptors, otherwise browsers do not merge them into one family.
 * Devanagari has no italic, so the italic style reuses the upright file (one download, no fake slant).
 */
const FAMILIES = [
  {
    name: 'Beautinique Sans',
    token: '--font-sans',
    generic: 'ui-sans-serif, system-ui, sans-serif',
    styles: {
      normal: ['plus-jakarta-sans-latin', 'plus-jakarta-sans-latin-ext', 'noto-sans-devanagari'],
      italic: ['plus-jakarta-sans-italic-latin', 'plus-jakarta-sans-italic-latin-ext', 'noto-sans-devanagari'],
    },
    metricsFrom: { latin: 'jakarta', devanagari: 'notoDevanagari' },
    /** Devanagari is drawn 4% larger so its headline sits between the Latin x-height and cap height. */
    devanagariSizeAdjust: 1.04,
    fallbacks: ['arial', 'roboto', 'nirmala'],
  },
  {
    name: 'Beautinique Display',
    token: '--font-display',
    generic: 'ui-serif, Georgia, serif',
    styles: {
      normal: ['fraunces-latin', 'fraunces-latin-ext', 'noto-sans-devanagari'],
      italic: ['fraunces-italic-latin', 'fraunces-italic-latin-ext', 'noto-sans-devanagari'],
    },
    metricsFrom: { latin: 'fraunces', devanagari: 'notoDevanagari' },
    devanagariSizeAdjust: 1.06,
    fallbacks: ['timesNewRoman', 'notoSerif', 'nirmala'],
  },
];

/**
 * Local fonts used while the web font loads, sized to match it (no reflow when it swaps in).
 * Latin metrics come from @capsizecss/metrics. Liberation Sans/Serif are metric clones of Arial/Times (Linux).
 */
const LOCAL_FONTS = {
  arial: {
    label: 'Arial',
    capsize: 'arial',
    regular: ['Arial', 'ArialMT', 'Liberation Sans', 'LiberationSans'],
    bold: ['Arial Bold', 'Arial-BoldMT', 'Liberation Sans Bold', 'LiberationSans-Bold'],
  },
  roboto: {
    label: 'Roboto',
    capsize: 'roboto',
    regular: ['Roboto', 'Roboto-Regular'],
    bold: ['Roboto Bold', 'Roboto-Bold'],
  },
  timesNewRoman: {
    label: 'Times',
    capsize: 'timesNewRoman',
    regular: ['Times New Roman', 'TimesNewRomanPSMT', 'Liberation Serif', 'LiberationSerif'],
    bold: ['Times New Roman Bold', 'TimesNewRomanPS-BoldMT', 'Liberation Serif Bold', 'LiberationSerif-Bold'],
  },
  notoSerif: {
    label: 'Noto Serif',
    capsize: 'notoSerif',
    regular: ['Noto Serif', 'NotoSerif-Regular', 'NotoSerif'],
    bold: ['Noto Serif Bold', 'NotoSerif-Bold'],
  },
  /**
   * Windows' Devanagari font. capsize has no Devanagari data, so the width is the shaped average advance of
   * DEVANAGARI_SAMPLE, measured with `--measure C:/Windows/Fonts/Nirmala.ttc NirmalaUI` (and NirmalaUI-Bold)
   * on Windows 11 (Nirmala UI version 1.46).
   */
  nirmala: {
    label: 'Devanagari',
    devanagari: true,
    regular: ['Nirmala UI', 'NirmalaUI'],
    bold: ['Nirmala UI Bold', 'NirmalaUI-Bold'],
    metrics: {
      regular: { unitsPerEm: 2048, ascent: 2210, descent: -514, lineGap: 0, avgWidth: 860.9 },
      bold: { unitsPerEm: 2048, ascent: 2210, descent: -514, lineGap: 0, avgWidth: 939.37 },
    },
  },
};

/** Hindi + Marathi words for the Devanagari width measurement. */
const DEVANAGARI_SAMPLE =
  'सौंदर्य उत्पाद लिपस्टिक काजल त्वचा देखभाल मॉइस्चराइज़र सनस्क्रीन खरीदें में जोड़ें मुफ़्त डिलीवरी ऑर्डर सुरक्षित भुगतान प्राकृतिक सामग्री क्रीम ' +
  'शाळा झाडे आणि फुले आमच्या दुकानात स्वागत आहे किंमत सवलत नवीन उत्पादने त्वचेसाठी केसांसाठी सुगंध श्रेणी';

/** OpenType name records kept in every file: copyright, family, style, unique id, full name, version, PostScript name, licence, licence URL. */
const NAME_IDS = [0, 1, 2, 3, 4, 5, 6, 13, 14];

/* ---------------------------------------------------------------- helpers */

function cps(spec) {
  return spec.split(' ').flatMap((part) => {
    const [a, b = a] = part.split('-').map((h) => parseInt(h, 16));
    return Array.from({ length: b - a + 1 }, (_, i) => a + i);
  });
}

function toRanges(codePoints) {
  const sorted = [...new Set(codePoints)].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < sorted.length; i++) {
    let j = i;
    while (sorted[j + 1] === sorted[j] + 1) j++;
    const hex = (n) => n.toString(16).toUpperCase().padStart(4, '0');
    out.push(i === j ? `U+${hex(sorted[i])}` : `U+${hex(sorted[i])}-${hex(sorted[j])}`);
    i = j;
  }
  return out.join(', ');
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const pct = (n) => `${(n * 100).toFixed(2)}%`;
const quote = (s) => `'${s}'`;
/** LF text, so a Windows checkout (core.autocrlf) compares and hashes like the files we wrote. */
const lf = (text) => text.replaceAll('\r\n', '\n');

/** Anything that shapes the output: this script (config + code) and the subsetting/measuring tools. */
const TOOLS = ['subset-font', 'harfbuzzjs', 'fontkit', '@capsizecss/unpack', '@capsizecss/metrics'];
const configHash = () =>
  sha256(JSON.stringify({ script: lf(readFileSync(fileURLToPath(import.meta.url), 'utf8')), tools: TOOLS.map((pkg) => `${pkg}@${version(pkg)}`) }));

function fail(message) {
  console.error(`fonts: ${message}`);
  process.exit(1);
}

async function download(entry) {
  const cached = join(CACHE_DIR, entry.sha256);
  if (existsSync(cached) && sha256(readFileSync(cached)) === entry.sha256) return readFileSync(cached);
  const url = GOOGLE_FONTS + encodeURI(entry.path);
  const res = await fetch(url);
  if (!res.ok) fail(`download failed (${res.status}): ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (sha256(buf) !== entry.sha256) fail(`sha256 mismatch for ${entry.path}: got ${sha256(buf)}`);
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cached, buf);
  return buf;
}

function codePointsText(codePoints) {
  return codePoints.map((c) => String.fromCodePoint(c)).join('');
}

/** A static instance (TrueType) of a variable font, for measuring. */
function instance(buf, axes) {
  const text = codePointsText([...SUBSETS.latin, ...SUBSETS.devanagari]);
  return subsetFont(buf, text, { targetFormat: 'truetype', variationAxes: axes });
}

/** Average shaped advance per code point of DEVANAGARI_SAMPLE, in font units. */
function devanagariWidth(buf, { index = 0, variations = {} } = {}) {
  const font = new hb.Font(new hb.Face(new hb.Blob(new Uint8Array(buf)), index));
  font.setVariations(Object.entries(variations).map(([tag, value]) => new hb.Variation(tag, value)));
  let advance = 0;
  let count = 0;
  for (const word of DEVANAGARI_SAMPLE.split(' ')) {
    const buffer = new hb.Buffer();
    buffer.addText(word);
    buffer.setLanguage('hi');
    buffer.guessSegmentProperties();
    hb.shape(font, buffer);
    advance += buffer.getGlyphPositions().reduce((sum, p) => sum + p.xAdvance, 0);
    count += [...word].length;
  }
  return advance / count;
}

/** Shaped glyph ids, for the Marathi/conjunct checks. */
function shapeIds(sfnt, text, language) {
  const font = new hb.Font(new hb.Face(new hb.Blob(new Uint8Array(sfnt))));
  const buffer = new hb.Buffer();
  buffer.addText(text);
  buffer.setLanguage(language);
  buffer.guessSegmentProperties();
  hb.shape(font, buffer);
  return buffer.getGlyphInfos().map((g) => g.codepoint);
}

/**
 * Fallback overrides (capsize / next/font formula), generalised for a face that itself has a size-adjust:
 * the fallback must take the same width and the same ascent/descent as the web face.
 */
function overrides(web, local, faceSizeAdjust = 1) {
  const sizeAdjust = (faceSizeAdjust * (web.avgWidth / web.unitsPerEm)) / (local.avgWidth / local.unitsPerEm);
  const em = (web.unitsPerEm * sizeAdjust) / faceSizeAdjust;
  return {
    sizeAdjust: pct(sizeAdjust),
    ascentOverride: pct(web.ascent / em),
    descentOverride: pct(Math.abs(web.descent) / em),
    lineGapOverride: pct(web.lineGap / em),
  };
}

/* ---------------------------------------------------------------- build */

async function build() {
  const sources = {};
  for (const [key, entry] of Object.entries(SOURCES)) sources[key] = await download(entry);

  mkdirSync(FONTS_DIR, { recursive: true });
  const files = {};
  for (const [name, spec] of Object.entries(FILES)) {
    const subset = SUBSETS[spec.subset];
    const axes = { ...spec.axes, wght: WEIGHT };
    const woff2 = await subsetFont(sources[spec.source], codePointsText(subset), {
      targetFormat: 'woff2',
      variationAxes: axes,
      preserveNameIds: NAME_IDS,
    });
    writeFileSync(join(FONTS_DIR, `${name}.woff2`), woff2);
    const covered = fontkit.create(Buffer.from(woff2)).characterSet.filter((c) => subset.includes(c));
    files[name] = { bytes: woff2.length, sha256: sha256(woff2), unicodeRange: toRanges(covered) };
    console.log(`  ${name}.woff2  ${(woff2.length / 1024).toFixed(1)} KB  (${covered.length} code points)`);
  }

  const licenses = {};
  for (const [out, entry] of Object.entries(LICENSES)) {
    const text = await download(entry);
    writeFileSync(join(FONTS_DIR, out), text);
    licenses[out] = { sha256: entry.sha256 };
  }

  const metrics = {};
  for (const family of FAMILIES) {
    const latinSource = SOURCES[family.metricsFrom.latin] && family.metricsFrom.latin;
    const latinAxes = Object.values(FILES).find((f) => f.source === latinSource)?.axes ?? {};
    const devaSource = family.metricsFrom.devanagari;
    const devaAxes = Object.values(FILES).find((f) => f.source === devaSource)?.axes ?? {};
    const latin = {};
    const devanagari = {};
    for (const [weight, value] of [['regular', 400], ['bold', 700]]) {
      const m = await fromBuffer(await instance(sources[latinSource], { ...latinAxes, wght: value }));
      latin[weight] = { unitsPerEm: m.unitsPerEm, ascent: m.ascent, descent: m.descent, lineGap: m.lineGap, avgWidth: m.xWidthAvg };
      const d = await fromBuffer(await instance(sources[devaSource], { ...devaAxes, wght: value }));
      devanagari[weight] = {
        unitsPerEm: d.unitsPerEm,
        ascent: d.ascent,
        descent: d.descent,
        lineGap: d.lineGap,
        avgWidth: devanagariWidth(sources[devaSource], { variations: { ...devaAxes, wght: value } }),
      };
    }
    const fallbacks = {};
    for (const key of family.fallbacks) {
      const local = LOCAL_FONTS[key];
      fallbacks[key] = {};
      for (const weight of ['regular', 'bold']) {
        const localMetrics = local.devanagari ? local.metrics[weight] : await capsizeMetrics(local.capsize, weight);
        fallbacks[key][weight] = local.devanagari
          ? overrides(devanagari[weight], localMetrics, family.devanagariSizeAdjust)
          : overrides(latin[weight], localMetrics);
      }
    }
    metrics[family.name] = { latin, devanagari, fallbacks };
  }

  // the files the Vite plugin (src/vite.js) can preload: each family's upright Latin file, plus Devanagari
  const preload = {};
  for (const family of FAMILIES) preload[family.token.replace('--font-', '')] = `${family.styles.normal.find((n) => FILES[n].subset === 'latin')}.woff2`;
  preload.devanagari = `${Object.keys(FILES).find((n) => FILES[n].subset === 'devanagari')}.woff2`;

  const manifest = {
    note: 'Generated by scripts/fonts.mjs. Do not edit.',
    configHash: configHash(),
    preload,
    tools: { 'subset-font': version('subset-font'), harfbuzzjs: version('harfbuzzjs'), harfbuzz: hb.versionString() },
    sources: Object.fromEntries(Object.entries(SOURCES).map(([k, v]) => [k, GOOGLE_FONTS + v.path])),
    files,
    licenses,
    metrics,
  };
  writeFileSync(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(CSS_FILE, withGenerated(readCss(), render(manifest)));
  console.log(`fonts: wrote ${Object.keys(files).length} files, ${Object.keys(licenses).length} licences, fonts.css`);
}

async function capsizeMetrics(name, weight) {
  const m = (await import(`@capsizecss/metrics/${name}${weight === 'bold' ? '/700' : ''}`)).default;
  return { unitsPerEm: m.unitsPerEm, ascent: m.ascent, descent: m.descent, lineGap: m.lineGap, avgWidth: m.xWidthAvg };
}

function version(pkg) {
  // walk up from the entry file: some packages do not export ./package.json
  for (let dir = dirname(require.resolve(pkg)); dir !== dirname(dir); dir = dirname(dir)) {
    const file = join(dir, 'package.json');
    if (existsSync(file) && JSON.parse(readFileSync(file, 'utf8')).name === pkg) return JSON.parse(readFileSync(file, 'utf8')).version;
  }
  return 'unknown';
}

/* ---------------------------------------------------------------- css */

function render(manifest) {
  const blocks = [];
  const tokens = [];
  for (const family of FAMILIES) {
    blocks.push(`/* ${family.name} */`);
    for (const [style, names] of Object.entries(family.styles)) {
      for (const name of names) {
        const isDeva = FILES[name].subset === 'devanagari';
        blocks.push(
          [
            '@font-face {',
            `  font-family: ${quote(family.name)};`,
            `  font-style: ${style};`,
            `  font-weight: ${WEIGHT.min} ${WEIGHT.max};`,
            '  font-display: swap;',
            `  src: url('./fonts/${name}.woff2') format('woff2');`,
            ...(isDeva ? [`  size-adjust: ${pct(family.devanagariSizeAdjust)};`] : []),
            `  unicode-range: ${manifest.files[name].unicodeRange};`,
            '}',
          ].join('\n'),
        );
      }
    }
    const stack = [quote(family.name)];
    for (const key of family.fallbacks) {
      const local = LOCAL_FONTS[key];
      const fallbackName = `${family.name} Fallback ${local.label}`;
      stack.push(quote(fallbackName));
      for (const [weight, range] of [['regular', '100 549'], ['bold', '550 900']]) {
        const o = manifest.metrics[family.name].fallbacks[key][weight];
        blocks.push(
          [
            '@font-face {',
            `  font-family: ${quote(fallbackName)};`,
            `  font-weight: ${range};`,
            `  src: ${local[weight].map((n) => `local(${quote(n)})`).join(', ')};`,
            `  size-adjust: ${o.sizeAdjust};`,
            `  ascent-override: ${o.ascentOverride};`,
            `  descent-override: ${o.descentOverride};`,
            `  line-gap-override: ${o.lineGapOverride};`,
            '}',
          ].join('\n'),
        );
      }
    }
    tokens.push(`  ${family.token}: ${[...stack, family.generic].join(', ')};`);
  }
  return [...blocks, `@theme {\n${tokens.join('\n')}\n}`].join('\n\n');
}

function readCss() {
  if (existsSync(CSS_FILE)) return lf(readFileSync(CSS_FILE, 'utf8'));
  return `/**\n * @beautinique/frontend-styles: fonts. See scripts/fonts.mjs and the README.\n */\n\n${START}\n${END}\n`;
}

function withGenerated(css, body) {
  const a = css.indexOf(START);
  const b = css.indexOf(END);
  if (a < 0 || b < a) fail('fonts.css has no @generated markers');
  return `${css.slice(0, a + START.length)}\n${body}\n${css.slice(b)}`;
}

/* ---------------------------------------------------------------- check */

function check() {
  const problems = [];
  if (!existsSync(MANIFEST_FILE)) fail('src/fonts/manifest.json is missing; run `npm run fonts`');
  const manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf8'));
  if (manifest.configHash !== configHash()) problems.push('scripts/fonts.mjs or its tools changed since the last build; run `npm run fonts`');

  const expected = new Set([...Object.keys(FILES).map((n) => `${n}.woff2`), ...Object.keys(LICENSES), 'manifest.json']);
  for (const f of readdirSync(FONTS_DIR)) if (!expected.has(f)) problems.push(`unexpected file src/fonts/${f}`);

  const sfnts = {};
  for (const [name, spec] of Object.entries(FILES)) {
    const file = join(FONTS_DIR, `${name}.woff2`);
    if (!existsSync(file)) {
      problems.push(`missing src/fonts/${name}.woff2`);
      continue;
    }
    const buf = readFileSync(file);
    if (sha256(buf) !== manifest.files[name]?.sha256) problems.push(`${name}.woff2 does not match the manifest`);
    if (buf.subarray(0, 4).toString('latin1') !== 'wOF2') problems.push(`${name}.woff2 is not woff2`);
    const font = fontkit.create(buf);
    const wght = font.variationAxes.wght;
    if (!wght || wght.min !== WEIGHT.min || wght.max !== WEIGHT.max) problems.push(`${name}: wght axis is not ${WEIGHT.min}-${WEIGHT.max}`);
    if (spec.subset === 'latin') {
      if (!font.characterSet.includes(0x20b9)) problems.push(`${name}: no rupee sign (U+20B9)`);
      if (spec.tnum && !font.availableFeatures.includes('tnum')) problems.push(`${name}: no tabular figures (tnum)`);
    }
    if (spec.subset === 'devanagari') sfnts[name] = font;
  }

  for (const [out, entry] of Object.entries(LICENSES)) {
    const file = join(FONTS_DIR, out);
    if (!existsSync(file) || sha256(lf(readFileSync(file, 'utf8'))) !== entry.sha256) problems.push(`licence ${out} is missing or changed`);
  }

  if (existsSync(CSS_FILE) && manifest.files) {
    const css = readCss();
    if (css !== withGenerated(css, render(manifest))) problems.push('src/fonts.css is stale; run `npm run fonts`');
  } else problems.push('src/fonts.css is missing');

  return { problems, devanagari: Object.keys(sfnts) };
}

async function checkShaping(names) {
  const problems = [];
  for (const name of names) {
    const sfnt = await subsetFont(readFileSync(join(FONTS_DIR, `${name}.woff2`)), codePointsText(SUBSETS.devanagari), { targetFormat: 'truetype' });
    // Marathi uses its own forms of ल and श (OpenType locl for MAR)
    if (shapeIds(sfnt, 'ल श', 'mr').join() === shapeIds(sfnt, 'ल श', 'hi').join()) problems.push(`${name}: Marathi forms (locl) are missing`);
    // क्ष must form one conjunct glyph, not क + visible virama + ष
    if (shapeIds(sfnt, 'क्ष', 'hi').length !== 1) problems.push(`${name}: the conjunct क्ष does not form`);
    // eyelash ra: र + virama + ZWJ + य must not show a visible virama (the cmap glyph, or the one र् ends with)
    const virama = [fontkit.create(Buffer.from(sfnt)).glyphForCodePoint(0x94d).id, shapeIds(sfnt, 'र्', 'mr').at(-1)];
    if (shapeIds(sfnt, 'र्\u200dय', 'mr').some((id) => virama.includes(id))) problems.push(`${name}: eyelash ra (ZWJ) does not form`);
  }
  return problems;
}

/* ---------------------------------------------------------------- measure */

/** harfbuzzjs cannot read WOFF/WOFF2: decompress those to TrueType (all glyphs kept). */
async function shapeable(buf) {
  const signature = buf.subarray(0, 4).toString('latin1');
  return signature === 'wOF2' || signature === 'wOFF' ? subsetFont(buf, '', { targetFormat: 'truetype', keepAllGlyphs: true }) : buf;
}

async function measure(file, postscriptName) {
  const buf = readFileSync(file);
  let font = fontkit.create(buf);
  let index = 0;
  if (font.fonts) {
    index = font.fonts.findIndex((f) => f.postscriptName === postscriptName);
    if (index < 0) fail(`${postscriptName} not in ${file}: ${font.fonts.map((f) => f.postscriptName).join(', ')}`);
    font = font.fonts[index];
  }
  console.log(
    JSON.stringify({
      fullName: font.fullName,
      postscriptName: font.postscriptName,
      version: font.version,
      unitsPerEm: font.unitsPerEm,
      ascent: font.ascent,
      descent: font.descent,
      lineGap: font.lineGap,
      avgWidth: font.characterSet.includes(0x915) ? Number(devanagariWidth(await shapeable(buf), { index }).toFixed(2)) : null,
    }),
  );
}

/* ---------------------------------------------------------------- main */

const args = process.argv.slice(2);
if (args[0] === '--measure') {
  await measure(args[1], args[2]);
} else if (args[0] === '--check') {
  const { problems, devanagari } = check();
  problems.push(...(await checkShaping(devanagari)));
  if (problems.length) fail(`${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  console.log(`fonts: ok (${Object.keys(FILES).length} files, ${Object.keys(LICENSES).length} licences, fonts.css current, rupee + tnum + Marathi forms present)`);
} else {
  await build();
}
