// Every design token at once, by the rules they follow; there is no list of token names to keep up to
// date. Each theme defines the same tokens and the variants that must agree do agree. Rules that override
// each other come in the right order. Colours and their -rgb channels are never mixed up, and every
// var() points at something. Values have the right type. Every @theme token turns into its Tailwind
// utility: Tailwind's own compiler builds all of them at once, and the defaults we reset stay out.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { compile } from 'tailwindcss';

import { customProperties, parseBlocks, unescapeSelector } from './css-blocks.mjs';

const require = createRequire(import.meta.url);
const pkgDir = fileURLToPath(new URL('../', import.meta.url));
const read = (file) => readFileSync(join(pkgDir, file), 'utf8');
const strip = (value) => value.replace(/\s*!important$/, '');
const noComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Every stylesheet the package ships: the ones index.css imports. */
const MODULES = [...read('src/index.css').matchAll(/@import\s+['"]\.\/([\w-]+\.css)['"]/g)].map(
  (m) => `src/${m[1]}`,
);
const parsed = new Map(MODULES.map((file) => [file, parseBlocks(read(file))]));
const blocks = customProperties(read('src/variables.css'));

/** The block at `path`, or a failure that names it (the generator changed its selectors). */
function block(path) {
  const found = blocks.get(path);
  assert.ok(found, `variables.css has a block "${path}"`);
  return found;
}
const names = (path) => [...block(path).keys()].sort();
/** Names whose value differs between two blocks (or that one of them lacks). */
function differences(path, other) {
  const a = block(path);
  const b = block(other);
  return [...new Set([...a.keys(), ...b.keys()])].filter(
    (name) => strip(a.get(name) ?? '<missing>') !== strip(b.get(name) ?? '<missing>'),
  );
}
/** Every declaration in every module: [file, path, property, value]. */
const declarations = [...parsed].flatMap(([file, fileBlocks]) =>
  [...fileBlocks].flatMap(([path, decls]) =>
    [...decls].map(([property, value]) => [file, path, property, value]),
  ),
);

const LIGHT = ":root, [theme='light']";
const DARK = "[theme='dark']";
const AUTO_DARK = '@media (prefers-color-scheme: dark) > :root:not([theme])';
const PRINT = '@media print > :root, [theme]';
// high contrast: the attribute and the OS setting must give the same colours
const HC_LIGHT = [
  "[theme='light'][contrast='more'], :root:not([theme])[contrast='more']",
  "@media (prefers-contrast: more) > [theme='light']:not([contrast]), :root:not([theme]):not([contrast])",
];
const HC_DARK = [
  "[theme='dark'][contrast='more']",
  "@media (prefers-color-scheme: dark) > :root:not([theme])[contrast='more']",
  "@media (prefers-contrast: more) > [theme='dark']:not([contrast])",
  '@media (prefers-contrast: more) and (prefers-color-scheme: dark) > :root:not([theme]):not([contrast])',
];
const HC_ANY = ["[contrast='more']", '@media (prefers-contrast: more) > :root:not([contrast])'];

describe('themes', () => {
  test('light, dark, automatic dark and print define the same tokens', () => {
    const light = names(LIGHT);
    assert.ok(light.length > 100, 'the light theme has the semantic tokens');
    for (const path of [DARK, AUTO_DARK, PRINT]) {
      assert.deepEqual(names(path), light, `${path} defines exactly the light theme's tokens`);
    }
  });

  test('automatic dark equals [theme=dark], and print uses the light colours', () => {
    assert.deepEqual(differences(AUTO_DARK, DARK), []);
    assert.deepEqual(differences(PRINT, LIGHT), []);
  });

  test('high contrast: every way of asking for it gives the same colours, in both themes', () => {
    for (const path of HC_LIGHT.slice(1))
      assert.deepEqual(differences(path, HC_LIGHT[0]), [], path);
    for (const path of HC_DARK.slice(1)) assert.deepEqual(differences(path, HC_DARK[0]), [], path);
    assert.deepEqual(differences(HC_ANY[1], HC_ANY[0]), []);
    assert.deepEqual(
      names(HC_DARK[0]),
      names(HC_LIGHT[0]),
      'light and dark override the same tokens',
    );
    const light = new Set(names(LIGHT));
    assert.deepEqual(
      names(HC_LIGHT[0]).filter((name) => !light.has(name)),
      [],
      'high contrast only overrides tokens the themes have',
    );
  });

  test('rules that override each other come in the right order (with equal selectors the later wins)', () => {
    const order = [...blocks.keys()];
    const at = (path) => {
      const index = order.indexOf(path);
      assert.notEqual(index, -1, `variables.css has a block "${path}"`);
      return index;
    };
    assert.ok(at(AUTO_DARK) > at(LIGHT), 'automatic dark after light');
    assert.ok(
      at(HC_LIGHT[0]) > at(AUTO_DARK) && at(HC_DARK[0]) > at(AUTO_DARK),
      'high contrast after the themes',
    );
    assert.ok(
      at(HC_DARK[1]) > at(HC_LIGHT[0]),
      'automatic dark + contrast attribute after light + attribute',
    );
    assert.ok(at(HC_DARK[3]) > at(HC_LIGHT[1]), 'OS dark + more contrast after OS more contrast');
    const themed = [LIGHT, DARK, AUTO_DARK, ...HC_LIGHT, ...HC_DARK].map(at);
    assert.ok(at(PRINT) > Math.max(...themed), 'print comes last');
  });

  test('every tone and order status sets the same tone tokens', () => {
    const tones = [...blocks.keys()].filter((path) =>
      /^@utility tone-|^@layer components > \[data-order-status=|^@layer base > :root, \[theme\]$/.test(
        path,
      ),
    );
    assert.ok(
      tones.some((path) => path.startsWith('@utility tone-')),
      'the tone utilities are there',
    );
    assert.ok(
      tones.some((path) => path.includes('data-order-status')),
      'the order statuses are there',
    );
    const expected = names(tones[0]);
    for (const path of tones) assert.deepEqual(names(path), expected, path);
  });

  test('every colour and its -rgb channels name the same colour', () => {
    const wrong = [];
    for (const [path, decls] of blocks) {
      for (const [name, value] of decls) {
        const rgb = decls.get(`${name}-rgb`);
        if (rgb === undefined) continue;
        const own = strip(value) === `rgb(var(${name}-rgb))`;
        // an alias (--tone: var(--brand)) must alias the same colour's channels (--tone-rgb: var(--brand-rgb))
        const alias = /^var\((--[\w-]+)\)$/.exec(strip(value));
        const sameAlias = alias !== null && strip(rgb) === `var(${alias[1]}-rgb)`;
        if (!own && !sameAlias) wrong.push(`${path}: ${name}: ${value} / ${name}-rgb: ${rgb}`);
      }
    }
    assert.deepEqual(wrong, []);
  });

  test('@theme colours read their own token (palette: rgb(var(--x-rgb)), semantic: var(--x))', () => {
    const wrong = [];
    for (const [file, fileBlocks] of parsed) {
      for (const [path, decls] of fileBlocks) {
        if (!path.startsWith('@theme')) continue;
        for (const [name, value] of decls) {
          if (!name.startsWith('--color-')) continue;
          const token = name.slice('--color-'.length);
          const expected = path.includes('inline') ? `var(--${token})` : `rgb(var(--${token}-rgb))`;
          if (value !== expected)
            wrong.push(`${file} ${path}: ${name}: ${value} (expected ${expected})`);
        }
      }
    }
    assert.deepEqual(wrong, []);
  });
});

describe('references', () => {
  test('colours and -rgb channels are never mixed up', () => {
    const wrong = [];
    for (const [file, path, property, raw] of declarations) {
      const value = strip(raw);
      // channels may stand alone only as the whole value of another -rgb token
      if (property.endsWith('-rgb') && /^var\(--[\w-]+-rgb\)$/.test(value)) continue;
      const rest = value.replace(/rgba?\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, inner) => {
        for (const v of inner.matchAll(/var\(\s*(--[\w-]+)/g)) {
          if (!v[1].endsWith('-rgb'))
            wrong.push(`${file} ${path}: ${property}: a colour inside rgb(): ${raw}`);
        }
        return 'rgb()';
      });
      for (const v of rest.matchAll(/var\(\s*(--[\w-]+-rgb)\b/g)) {
        wrong.push(`${file} ${path}: ${property}: channels used as a colour (${v[1]}): ${raw}`);
      }
    }
    assert.deepEqual(wrong, []);
  });

  test('every var() points at one of our tokens, or at a documented element setting', () => {
    const defined = new Set(
      declarations.map(([, , property]) => property).filter((p) => p.startsWith('--')),
    );
    const readme = read('README.md');
    const wrong = [];
    for (const file of MODULES) {
      for (const m of noComments(read(file)).matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) {
        const [, name, fallback] = m;
        if (defined.has(name) || name.startsWith('--tw-')) continue;
        // var(--marquee-duration, 40s): a setting an element may set, so it needs a fallback and a README line
        if (fallback && readme.includes(`\`${name}\``)) continue;
        wrong.push(
          `${file}: ${name}${fallback ? ' (has a fallback but is not in README.md)' : ''}`,
        );
      }
    }
    assert.deepEqual([...new Set(wrong)], []);
  });

  test('hand-written CSS uses semantic tokens, never fixed palette colours (those do not follow the theme)', () => {
    const palette = new Set(
      [...block(':root').keys()].filter((name) => /^--[a-z]+-\d{2,3}(-rgb)?$/.test(name)),
    );
    assert.ok(palette.size > 50, 'the palette is in :root');
    const wrong = [];
    for (const file of MODULES.filter((f) => f !== 'src/variables.css')) {
      for (const m of noComments(read(file)).matchAll(/var\(\s*(--[\w-]+)/g)) {
        if (palette.has(m[1])) wrong.push(`${file}: ${m[1]}`);
      }
    }
    assert.deepEqual(wrong, []);
  });

  test('print styles apply only when printing', () => {
    const outside = [...parsed.get('src/print.css').keys()].filter(
      (path) => !path.includes('@media print'),
    );
    assert.deepEqual(outside, []);
  });
});

describe('values', () => {
  /** What a token of each namespace must look like, wherever it is defined. */
  const TYPES = {
    spacing: /^-?\d*\.?\d+(rem|px|em)$/,
    container: /^\d*\.?\d+(rem|px)$/,
    radius: /^\d*\.?\d+(rem|px)$/,
    breakpoint: /^\d*\.?\d+(rem|px)$/,
    aspect: /^\d+ \/ \d+$/,
    ease: /^(cubic-bezier\(([-\d.]+,\s*){3}[-\d.]+\)|linear)$/,
    duration: /^\d+m?s$/,
    z: /^-?\d+$/,
  };

  test('every spacing, size, radius, aspect, easing, duration and z-index value has the right form', () => {
    const wrong = [];
    for (const [file, path, property, value] of declarations) {
      const namespace = /^--([a-z]+)-/.exec(property)?.[1];
      const type = namespace && TYPES[namespace];
      if (type && !type.test(strip(value))) wrong.push(`${file} ${path}: ${property}: ${value}`);
    }
    assert.deepEqual(wrong, []);
  });

  test('the z-index scale goes up in the order it is written', () => {
    const z = [...block(':root')].filter(([name]) => name.startsWith('--z-'));
    assert.ok(z.length >= 5, 'the z-index scale is in :root');
    const out = z.filter(([, value], i) => i > 0 && Number(value) <= Number(z[i - 1][1]));
    assert.deepEqual(
      out.map(([name]) => name),
      [],
    );
  });
});

/**
 * The Tailwind utility each @theme namespace feeds, and the CSS property it sets. Longer namespaces
 * first (font-weight before font). --default-* tokens configure Tailwind and have no utility.
 */
const UTILITY = {
  'font-weight': (name) => [`font-${name}`, 'font-weight'],
  'inset-shadow': (name) => [`inset-shadow-${name}`, 'box-shadow'],
  'drop-shadow': (name) => [`drop-shadow-${name}`, 'filter'],
  'text-shadow': (name) => [`text-shadow-${name}`, 'text-shadow'],
  color: (name) => [`bg-${name}`, 'background-color'],
  spacing: (name) => [`h-${name}`, 'height'],
  container: (name) => [`max-w-${name}`, 'max-width'],
  aspect: (name) => [`aspect-${name}`, 'aspect-ratio'],
  radius: (name) => [`rounded-${name}`, 'border-radius'],
  shadow: (name) => [`shadow-${name}`, 'box-shadow'],
  ease: (name) => [`ease-${name}`, 'transition-timing-function'],
  animate: (name) => [`animate-${name}`, 'animation'],
  font: (name) => [`font-${name}`, 'font-family'],
  text: (name) => [`text-${name}`, 'font-size'],
  leading: (name) => [`leading-${name}`, 'line-height'],
  tracking: (name) => [`tracking-${name}`, 'letter-spacing'],
  blur: (name) => [`blur-${name}`, 'filter'],
  breakpoint: (name) => [`${name}:flex`, 'display'],
};
const NAMESPACES = Object.keys(UTILITY).sort((a, b) => b.length - a.length);

/** Tailwind's compiler over our CSS, resolving @import like Vite would. */
async function compileStyles() {
  return compile(`@import 'tailwindcss';\n@import './src/index.css';`, {
    base: pkgDir,
    loadStylesheet: async (id, base) => {
      const path =
        id.startsWith('.') || isAbsolute(id)
          ? resolve(base, id)
          : require.resolve(id === 'tailwindcss' ? 'tailwindcss/index.css' : id, { paths: [base] });
      return { path, base: dirname(path), content: await readFile(path, 'utf8') };
    },
    loadModule: async (id) => {
      throw new Error(
        `tokens.test compiles CSS only; teach compileStyles() to load "${id}" (@plugin/@config)`,
      );
    },
  });
}

describe('utilities', () => {
  /** @type {{ token: string, inline: boolean, candidate: string, property: string }[]} */
  const tokens = [];
  /** our reset namespaces (--color-*: initial) and the Tailwind defaults they must keep out */
  const defaults = [];
  /** @type {Map<string, Map<string, string>>} unescaped selector → declarations */
  const rules = new Map();
  let built = '';

  before(async () => {
    for (const [file, fileBlocks] of parsed) {
      for (const [path, decls] of fileBlocks) {
        if (!path.startsWith('@theme')) continue;
        assert.ok(
          !path.includes('reference'),
          `${file}: @theme reference tokens have no variable at runtime`,
        );
        for (const token of decls.keys()) {
          if (!token.startsWith('--') || token.startsWith('--default-')) continue;
          const namespace = NAMESPACES.find((ns) => token.startsWith(`--${ns}-`));
          assert.ok(
            namespace,
            `${file}: ${token} is in a namespace this test knows (add it to UTILITY)`,
          );
          const [candidate, property] = UTILITY[namespace](token.slice(namespace.length + 3));
          tokens.push({ token, inline: path.includes('inline'), candidate, property });
        }
      }
    }
    const ours = new Set(tokens.map((t) => t.token));
    const tailwindTheme = noComments(
      readFileSync(require.resolve('tailwindcss/theme.css'), 'utf8'),
    );
    const resets = new Set(
      [...noComments(MODULES.map(read).join('\n')).matchAll(/--([a-z-]+)-\*\s*:\s*initial/g)].map(
        (m) => m[1],
      ),
    );
    // README "Colours": Tailwind's default colours and shadows are removed, only Beautinique tokens exist
    for (const namespace of ['color', 'shadow']) {
      assert.ok(
        resets.has(namespace),
        `@theme resets --${namespace}-* (README: only Beautinique tokens)`,
      );
    }
    for (const namespace of resets) {
      assert.ok(UTILITY[namespace], `--${namespace}-* is reset; add the namespace to UTILITY`);
      for (const m of tailwindTheme.matchAll(new RegExp(`(--${namespace}-[\\w-]+)\\s*:`, 'g'))) {
        if (!ours.has(m[1])) defaults.push(UTILITY[namespace](m[1].slice(namespace.length + 3))[0]);
      }
    }
    const compiler = await compileStyles();
    built = compiler.build([...tokens.map((t) => t.candidate), ...defaults]);
    for (const [path, decls] of parseBlocks(built)) {
      const selector = unescapeSelector(path.split(' > ').at(-1));
      rules.set(selector, new Map([...(rules.get(selector) ?? []), ...decls]));
    }
  });

  test('every @theme token becomes its utility, reading the token', () => {
    assert.ok(tokens.length > 200, 'all the @theme tokens were found');
    const broken = tokens.flatMap(({ token, inline, candidate, property }) => {
      const rule = rules.get(`.${candidate}`);
      if (!rule) return [`${token}: no .${candidate} rule`];
      if (!rule.has(property)) return [`${token}: .${candidate} does not set ${property}`];
      // a plain @theme token is read through its variable; an inline one is copied in
      if (
        !inline &&
        property !== 'display' &&
        ![...rule.values()].some((v) => v.includes(`var(${token})`))
      ) {
        return [`${token}: .${candidate} does not read var(${token})`];
      }
      return [];
    });
    assert.deepEqual(broken, []);
  });

  test("Tailwind's default colours and shadows stay out (we reset those namespaces)", () => {
    assert.ok(defaults.length > 100, "Tailwind's default palette was found");
    assert.deepEqual(
      defaults.filter((candidate) => rules.has(`.${candidate}`)),
      [],
    );
  });

  test('every animation has its keyframes, ends in its final state, and every @theme keyframes is used', () => {
    const animations = tokens.filter((t) => t.token.startsWith('--animate-'));
    assert.ok(animations.length > 0, 'the animations were found');
    const keyframes = new Set(
      [...parsed.values()].flatMap((fileBlocks) =>
        [...fileBlocks.keys()].flatMap(
          (path) => /^@theme[^>]* > @keyframes ([\w-]+)/.exec(path)?.[1] ?? [],
        ),
      ),
    );
    const wrong = [];
    const used = new Set();
    for (const { token } of animations) {
      const name = token.slice('--animate-'.length);
      const value = [...parsed.values()]
        .flatMap((fileBlocks) => [...fileBlocks].filter(([p]) => p.startsWith('@theme')))
        .map(([, decls]) => decls.get(token))
        .find(Boolean);
      const frames = value?.split(' ')[0];
      used.add(frames);
      if (frames !== name) wrong.push(`${token} plays "${frames}", not "${name}"`);
      if (!keyframes.has(frames)) wrong.push(`${token}: no @keyframes ${frames}`);
      if (!/\bboth$|\binfinite\b/.test(value ?? ''))
        wrong.push(`${token} does not keep its end state (both)`);
      if (!built.includes(`@keyframes ${frames} {`))
        wrong.push(`animate-${name} builds without its keyframes`);
    }
    for (const name of keyframes)
      if (!used.has(name)) wrong.push(`@keyframes ${name} has no --animate token`);
    assert.deepEqual(wrong, []);
  });
});
