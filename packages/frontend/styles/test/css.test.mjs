// The package CSS through a real Vite + Tailwind build (test/fixture/classes.html uses the classes),
// plus static checks of the source files.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { build } from 'vite';

const pkgDir = fileURLToPath(new URL('../', import.meta.url));
const root = fileURLToPath(new URL('./fixture/', import.meta.url));
const read = (file) => readFileSync(join(pkgDir, file), 'utf8').replaceAll('\r\n', '\n');
const MODULES = [
  'variables.css',
  'fonts.css',
  'base.css',
  'animations.css',
  'utilities.css',
  'content.css',
  'print.css',
];

let css = '';
let outDir = '';
before(async () => {
  outDir = await mkdtemp(join(tmpdir(), 'bq-css-'));
  await build({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [tailwindcss()],
    build: {
      outDir,
      emptyOutDir: true,
      cssMinify: false,
      rolldownOptions: { input: [join(root, 'classes.html')] },
    },
  });
  const file = (await readdir(join(outDir, 'assets'))).find((a) => a.endsWith('.css'));
  css = await readFile(join(outDir, 'assets', file), 'utf8');
});
after(() => rm(outDir, { recursive: true, force: true }));

/** The body of the first rule whose selector is exactly `selector` (unminified build output). */
function rule(selector) {
  const at = css.indexOf(`${selector} {`);
  assert.notEqual(at, -1, `${selector} is in the build`);
  return css.slice(at, css.indexOf('}', at) + 1);
}

describe('package files', () => {
  test('index.css imports every module, and package.json exports each one', () => {
    const index = read('src/index.css');
    const { exports } = JSON.parse(read('package.json'));
    for (const file of MODULES) {
      assert.ok(index.includes(`@import './${file}';`), `index.css imports ${file}`);
      assert.equal(exports[`./${file}`], `./src/${file}`, `package.json exports ./${file}`);
    }
  });

  test('hand-written CSS uses tokens, never colour literals', () => {
    for (const file of MODULES) {
      let text = read(`src/${file}`).replace(/\/\*[\s\S]*?\*\//g, '');
      // generated parts carry the raw palette on purpose
      text = text.replace(/@generated:start[\s\S]*?@generated:end/g, '');
      if (file === 'variables.css') {
        text = text.slice(0, text.indexOf('--rose-50-rgb'));
      }
      if (file === 'fonts.css') continue; // generated font faces and fallbacks only
      const literal = text.match(
        /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(\s*[\d.]|(?<![\w-])(?:white|black)(?![\w-])/i,
      );
      assert.equal(literal, null, `${file} has a colour literal: ${literal?.[0]}`);
    }
  });
});

describe('the build', () => {
  test('defines every variable it uses (no silent fallbacks to nothing)', () => {
    const defined = new Set([...css.matchAll(/(?:^|[;{\s])(--[\w-]+)\s*:/g)].map((m) => m[1]));
    for (const m of css.matchAll(/@property\s+(--[\w-]+)/g)) defined.add(m[1]);
    const missing = [...css.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)]
      .map((m) => m[1])
      .filter((v) => !defined.has(v));
    assert.deepEqual([...new Set(missing)], []);
  });

  test('tones: tone-* sets the --tone-* variables, bg-tone & co. use them', () => {
    const success = rule('.tone-success');
    for (const part of ['', '-hover', '-foreground', '-subtle', '-subtle-foreground']) {
      assert.ok(
        success.includes(`--tone${part}: var(--success${part});`),
        `tone-success sets --tone${part}`,
      );
    }
    assert.ok(success.includes('--tone-rgb: var(--success-rgb);'));
    assert.ok(rule('.tone-neutral').includes('--tone: var(--neutral);'));
    assert.ok(rule('.bg-tone').includes('background-color: var(--tone)'));
    assert.ok(
      rule('.text-tone-subtle-foreground').includes('color: var(--tone-subtle-foreground)'),
    );
  });

  test('order status maps to a tone in the components layer, so a tone-* class still wins', () => {
    const at = css.indexOf('[data-order-status="DELIVERED"]');
    assert.notEqual(at, -1);
    assert.ok(css.lastIndexOf('@layer components', at) > css.lastIndexOf('@layer base', at));
    assert.ok(css.slice(at, at + 200).includes('--tone: var(--success);'));
    const statuses = [...css.matchAll(/\[data-order-status="(\w+)"\]/g)].map((m) => m[1]);
    assert.deepEqual(statuses, [
      'PENDING_PAYMENT',
      'CONFIRMED',
      'ALLOCATED',
      'PICKED',
      'PACKED',
      'DISPATCHED',
      'AT_HUB',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RTO',
      'RETURN_REQUESTED',
      'RETURNED',
    ]);
  });

  test('layout, touch and media tokens become utilities', () => {
    assert.ok(rule('.h-header').includes('height: var(--spacing-header)'));
    assert.ok(rule('.pb-bottom-nav').includes('var(--spacing-bottom-nav)'));
    assert.ok(rule('.w-sidebar').includes('var(--spacing-sidebar)'));
    assert.ok(rule('.size-touch').includes('var(--spacing-touch)'));
    assert.ok(rule('.max-w-page').includes('var(--container-page)'));
    assert.ok(rule('.aspect-banner').includes('var(--aspect-banner)'));
    assert.match(css, /--spacing-touch: 2\.75rem/);
    assert.match(css, /--spacing-touch-lg: 3rem/);
    assert.match(rule('.bg-chart-1'), /background-color: var\(--chart-1\)/);
  });

  test('page container and skip link', () => {
    assert.match(rule('.container-page'), /max-width: var\(--container-page\)/);
    assert.match(rule('.container-page'), /padding-inline: 1rem/);
    assert.match(
      css,
      /@media \(min-width: 40rem\) \{\s+\.container-page \{\s+padding-inline: 1\.5rem/,
    );
    assert.match(rule('.skip-link'), /translate: 0 calc\(-100% - 1\.5rem\)/);
    assert.match(rule('.skip-link:focus, .skip-link:focus-visible'), /translate: 0 0|translate: 0/);
  });

  test('touch targets give small controls a 44px / 48px hit area', () => {
    assert.match(
      rule('.touch-target:before'),
      /min-width: var\(--spacing-touch\);\s+min-height: var\(--spacing-touch\)/,
    );
    assert.match(rule('.touch-target-lg:before'), /min-width: var\(--spacing-touch-lg\)/);
  });

  test('focus utilities draw the same ring as base.css, thicker in high contrast', () => {
    for (const s of ['.focus-ring:focus-visible', '.focus-ring-within:has(:focus-visible)']) {
      assert.match(rule(s), /outline: var\(--focus-ring-width\) solid var\(--focus-ring\)/);
    }
    assert.match(
      rule('.focus-ring-inset:focus-visible'),
      /outline-offset: calc\(var\(--focus-ring-width\) \* -1\)/,
    );
    assert.match(
      rule(':focus-visible'),
      /outline: var\(--focus-ring-width\) solid var\(--focus-ring\)/,
    );
    assert.match(css, /\[contrast="more"\] \{\s+--focus-ring-width: 3px/);
  });

  test('surface-inverse sets the strip colours and the inverse focus ring for everything inside', () => {
    const inverse = rule('.surface-inverse');
    assert.match(inverse, /background-color: var\(--surface-inverse\)/);
    assert.match(inverse, /color: var\(--foreground-inverse\)/);
    assert.match(inverse, /--focus-ring: var\(--focus-ring-inverse\)/);
    assert.match(inverse, /--focus-ring-rgb: var\(--focus-ring-inverse-rgb\)/);
  });

  test('moving things stop with reduced motion', () => {
    // the build writes 0ms as 0s
    assert.match(
      css,
      /@media \(prefers-reduced-motion: reduce\) \{\s+:root \{\s+--duration-fast: 0m?s;\s+--duration-base: 0m?s;\s+--duration-slow: 0m?s;/,
    );
    assert.match(css, /prefers-reduced-motion: reduce\) \{\s+\.skeleton:after \{\s+display: none/);
    assert.match(
      css,
      /prefers-reduced-motion: reduce\) \{\s+\.progress-indeterminate:before \{\s+width: 50%;\s+animation: none/,
    );
    assert.match(css, /prefers-reduced-motion: reduce\) \{\s+\.marquee \{\s+animation: none/);
    // hover, keyboard focus and a pause button (data-paused) all pause it
    assert.match(
      css,
      /\.marquee:hover, \.marquee:focus-within, \.marquee\[data-paused\] \{\s+animation-play-state: paused/,
    );
  });

  test('animations use the motion tokens, and only used keyframes are shipped', () => {
    assert.match(css, /--animate-fade-in: fade-in var\(--duration-base\) var\(--ease-enter\) both/);
    for (const used of ['fade-in', 'scale-out', 'rise-in', 'shake']) {
      assert.match(css, new RegExp(`@keyframes ${used} \\{`), `${used} keyframes`);
    }
    for (const unused of ['pop', 'slide-in-from-top', 'slide-out-to-left', 'sink-out']) {
      assert.doesNotMatch(css, new RegExp(`@keyframes ${unused} \\{`), `${unused} is not shipped`);
    }
  });

  test('gradient text falls back to plain text in forced-colors mode', () => {
    const at = css.indexOf('@media (forced-colors: active)');
    assert.notEqual(at, -1);
    const block = css.slice(at, css.indexOf('}', at));
    assert.ok(block.includes('.text-brand-gradient'));
    assert.match(block, /-webkit-text-fill-color: canvastext/i);
    assert.match(block, /\bcolor: canvastext/i);
    assert.match(block, /background-image: none/);
    assert.match(rule('.bg-brand-gradient'), /color: var\(--gradient-foreground\)/);
  });

  test('safe-area paddings use env() with a zero fallback', () => {
    assert.match(rule('.pb-safe'), /padding-bottom: env\(safe-area-inset-bottom, 0px\)/);
    assert.match(rule('.px-safe'), /padding-left: env\(safe-area-inset-left, 0px\)/);
  });

  test('high contrast and print themes are in the build', () => {
    assert.match(
      css,
      /\[theme="dark"\]\[contrast="more"\] \{\s+--foreground-muted-rgb: var\(--neutral-50-rgb\)/,
    );
    assert.match(css, /@media \(prefers-contrast: more\)/);
    assert.match(
      css,
      /@media print \{\s+:root, \[theme\] \{\s+color-scheme: light !important;\s+--background-rgb: var\(--neutral-50-rgb\) !important/,
    );
  });

  test('rich text handles Quill 2 lists down to the last indent level', () => {
    for (const selector of [
      '.rich-text :where(ol:has( > li[data-list]))',
      '.rich-text :where(li[data-list="bullet"] > .ql-ui):before',
      '.rich-text :where(li[data-list="ordered"].ql-indent-8 > .ql-ui):before',
      '.rich-text :where(.ql-indent-8)',
      '.rich-text :where(iframe.ql-video)',
    ]) {
      assert.ok(css.includes(selector), `${selector} is in the build`);
    }
    assert.match(css, /content: counter\(ql-8, lower-roman\) "\."/);
    assert.match(rule('.rich-text :where(ol:has( > li[data-list]))'), /list-style: none/);
    assert.match(rule('.rich-text :where(a)'), /color: var\(--brand-text\)/);
    assert.match(rule('.rich-text :where(a)'), /text-decoration: underline/);
  });
});
