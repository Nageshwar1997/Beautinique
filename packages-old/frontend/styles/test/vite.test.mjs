// Real Vite + Tailwind builds of test/fixture with the font preload plugin.
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { build, createServer } from 'vite';
import { beautiniqueFonts } from '../src/vite.js';

const root = fileURLToPath(new URL('./fixture/', import.meta.url));
const outDirs = [];
after(() => Promise.all(outDirs.map((d) => rm(d, { recursive: true, force: true }))));

/** pages: the HTML entries to build (default index.html); html = the first one, htmls = all of them. */
async function buildFixture(options, { base, pages = ['index.html'], experimental } = {}) {
  const outDir = await mkdtemp(join(tmpdir(), 'bq-fonts-'));
  outDirs.push(outDir);
  await build({
    root,
    base,
    experimental,
    configFile: false,
    logLevel: 'silent',
    plugins: [tailwindcss(), beautiniqueFonts(options)],
    build: {
      outDir,
      emptyOutDir: true,
      rolldownOptions: { input: pages.map((p) => join(root, p)) },
    },
  });
  const assets = await readdir(join(outDir, 'assets'));
  const cssFile = assets.find((a) => a.endsWith('.css'));
  const htmls = Object.fromEntries(
    await Promise.all(pages.map(async (p) => [p, await readFile(join(outDir, p), 'utf8')])),
  );
  return {
    html: htmls[pages[0]],
    htmls,
    css: cssFile ? await readFile(join(outDir, 'assets', cssFile), 'utf8') : '',
    assets,
  };
}

/** The one emitted file for a font (hash is 8 characters, so -latin does not also match -latin-ext). */
function emitted(assets, name) {
  const files = assets.filter((a) => new RegExp(`^${name}-[\\w-]{8}\\.woff2$`).test(a));
  assert.equal(files.length, 1, `${name} should be emitted exactly once, got ${files.join(', ')}`);
  return files[0];
}

describe('beautiniqueFonts() in a build', () => {
  test('preloads exactly the hashed files the CSS uses', async () => {
    const { html, css, assets } = await buildFixture({ preload: ['sans', 'display'] });
    for (const name of ['plus-jakarta-sans-latin', 'fraunces-latin']) {
      const file = emitted(assets, name);
      assert.ok(css.includes(`/assets/${file}`), `CSS references ${file}`);
      assert.ok(
        html.includes(
          `<link rel="preload" as="font" type="font/woff2" href="/assets/${file}" crossorigin>`,
        ),
        `index.html preloads ${file}`,
      );
    }
    assert.equal((html.match(/rel="preload"/g) ?? []).length, 2);
    assert.ok(!html.includes('<script>'), 'no inline script (nothing for a CSP to allow)');
  });

  test('defaults to the sans font only', async () => {
    const { html, assets } = await buildFixture();
    assert.ok(html.includes(`/assets/${emitted(assets, 'plus-jakarta-sans-latin')}`));
    assert.equal((html.match(/rel="preload"/g) ?? []).length, 1);
  });

  test('respects an absolute base', async () => {
    const { html, css, assets } = await buildFixture({}, { base: '/shop/' });
    const file = emitted(assets, 'plus-jakarta-sans-latin');
    assert.ok(css.includes(`/shop/assets/${file}`));
    assert.ok(html.includes(`href="/shop/assets/${file}"`));
  });

  test('respects a relative base', async () => {
    const { html, assets } = await buildFixture({}, { base: './' });
    assert.ok(html.includes(`href="./assets/${emitted(assets, 'plus-jakarta-sans-latin')}"`));
  });

  test('uses the CDN URL from experimental.renderBuiltUrl, like the CSS', async () => {
    const cdn = (file) => `https://cdn.example.com/${file}`;
    const { html, css, assets } = await buildFixture({}, { experimental: { renderBuiltUrl: cdn } });
    const file = emitted(assets, 'plus-jakarta-sans-latin');
    assert.ok(css.includes(`https://cdn.example.com/assets/${file}`));
    assert.ok(html.includes(`href="https://cdn.example.com/assets/${file}"`));
  });

  test('renderBuiltUrl { relative: true } gives a page-relative preload', async () => {
    const { html, assets } = await buildFixture(
      {},
      { experimental: { renderBuiltUrl: () => ({ relative: true }) } },
    );
    assert.ok(html.includes(`href="./assets/${emitted(assets, 'plus-jakarta-sans-latin')}"`));
  });

  test('rejects a runtime renderBuiltUrl (a preload needs a static URL)', async () => {
    // only for the fonts: Vite itself refuses runtime URLs for its own HTML assets
    const runtime = (file, { hostType }) =>
      hostType === 'html' && file.endsWith('.woff2')
        ? { runtime: `window.cdn(${JSON.stringify(file)})` }
        : undefined;
    await assert.rejects(
      buildFixture({}, { experimental: { renderBuiltUrl: runtime } }),
      /runtime URL/,
    );
  });

  test('multi-page build: only pages that load the styles get the preloads', async () => {
    const { htmls, assets } = await buildFixture(
      { preload: ['sans', 'display'] },
      { pages: ['index.html', 'nocss.html'] },
    );
    for (const name of ['plus-jakarta-sans-latin', 'fraunces-latin'])
      assert.ok(htmls['index.html'].includes(`/assets/${emitted(assets, name)}`));
    assert.ok(
      !htmls['nocss.html'].includes('rel="preload"'),
      'no preload on a page without the styles',
    );
  });

  test('fails loudly when the app does not import the styles', async () => {
    await assert.rejects(
      buildFixture({}, { pages: ['nocss.html'] }),
      /plus-jakarta-sans-latin\.woff2 is not in the build/,
    );
  });
});

describe('beautiniqueFonts() options', () => {
  test('rejects unknown fonts', () => {
    assert.throws(() => beautiniqueFonts({ preload: ['serif'] }), /unknown font "serif"/);
    assert.throws(() => beautiniqueFonts({ preload: ['toString'] }), /unknown font "toString"/);
  });
});

describe('beautiniqueFonts() in dev', () => {
  test('preload URLs are served and match the CSS', async () => {
    const server = await createServer({
      root,
      configFile: false,
      logLevel: 'silent',
      plugins: [tailwindcss(), beautiniqueFonts({ preload: ['sans', 'display'] })],
      server: { port: 0, strictPort: false },
    });
    await server.listen();
    try {
      const origin = server.resolvedUrls.local[0].replace(/\/$/, '');
      const html = await (await fetch(`${origin}/`)).text();
      const hrefs = [
        ...html.matchAll(/rel="preload" as="font" type="font\/woff2" href="([^"]+)"/g),
      ].map((m) => m[1]);
      assert.equal(hrefs.length, 2);
      const css = await (await fetch(`${origin}/style.css?direct`)).text();
      for (const href of hrefs) {
        assert.ok(css.includes(href), `dev CSS uses ${href}`);
        const res = await fetch(origin + href);
        assert.equal(res.status, 200, href);
        assert.match(res.headers.get('content-type') ?? '', /font\/woff2/);
      }
    } finally {
      await server.close();
    }
  });
});
