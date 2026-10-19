/**
 * @beautinique/frontend-styles/vite: preloads the brand fonts so text renders in them from the first paint.
 *
 * It adds <link rel="preload" as="font"> to index.html with exactly the URL Vite gives the same file in the
 * CSS, so the browser downloads each font once. The Devanagari font is preloaded only for visitors whose saved
 * language is Hindi or Marathi (a tiny inline script reads localStorage before the CSS loads).
 *
 *   import { beautiniqueFonts } from '@beautinique/frontend-styles/vite';
 *   plugins: [react(), tailwindcss(), beautiniqueFonts({ preload: ['sans', 'display'], devanagari: { storageKey: 'bq-lang' } })]
 */
import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NAME = 'beautinique-fonts';
const FONTS_DIR = fileURLToPath(new URL('./fonts/', import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(FONTS_DIR, 'manifest.json'), 'utf8'));

const toPosix = (p) => p.replaceAll('\\', '/');
const sameFile = (a, b) => (process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b);
const joinUrl = (a, b) => (a.endsWith('/') ? a : `${a}/`) + b.replace(/^\/+/, '');

/** Inline script: preload the font only if localStorage[storageKey] is one of values. */
const conditionalPreload = (href, storageKey, values) =>
  `(function(){try{var v=localStorage.getItem(${JSON.stringify(storageKey)});` +
  `if(${JSON.stringify(values)}.indexOf(v)<0)return;var l=document.createElement('link');` +
  `l.rel='preload';l.as='font';l.type='font/woff2';l.crossOrigin='anonymous';` +
  `l.href=${JSON.stringify(href)};document.head.appendChild(l)}catch(e){}})()`;

/**
 * @param {import('./vite.d.ts').BeautiniqueFontsOptions} [options]
 * @returns {import('vite').Plugin}
 */
export function beautiniqueFonts({ preload = ['sans'], devanagari = false } = {}) {
  for (const key of preload) {
    if (key === 'devanagari' || !manifest.preload[key]) {
      throw new Error(`[${NAME}] preload: unknown font "${key}". Use ${Object.keys(manifest.preload).filter((k) => k !== 'devanagari').map((k) => `"${k}"`).join(' or ')}; Devanagari goes in the devanagari option.`);
    }
  }
  if (devanagari && typeof devanagari.storageKey !== 'string') throw new Error(`[${NAME}] devanagari.storageKey must be the localStorage key that holds the language`);

  const fonts = [
    ...preload.map((key) => ({ file: manifest.preload[key] })),
    ...(devanagari ? [{ file: manifest.preload.devanagari, when: { storageKey: devanagari.storageKey, values: devanagari.values ?? ['hi', 'mr'] } }] : []),
  ].map((f) => ({ ...f, path: toPosix(realpathSync(path.join(FONTS_DIR, f.file))) }));

  /** @type {import('vite').ResolvedConfig} */
  let config;

  return {
    name: NAME,
    configResolved(resolved) {
      config = resolved;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        return fonts.flatMap((font) => {
          let href;
          if (ctx.bundle) {
            const asset = builtAsset(font, ctx);
            // multi-page builds: only pages whose stylesheet uses this font get the preload
            if (!pageUsesFont(html, ctx, asset)) return [];
            href = builtHref(asset, ctx);
          } else href = devHref(font);
          return font.when
            ? // before the stylesheet <link>, otherwise the inline script waits for the CSS
              { tag: 'script', children: conditionalPreload(href, font.when.storageKey, font.when.values), injectTo: 'head-prepend' }
            : { tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: true }, injectTo: 'head' };
        });
      },
    },
  };

  function builtAsset(font, ctx) {
    const asset = Object.values(ctx.bundle).find(
      (o) => o.type === 'asset' && (o.originalFileNames ?? []).some((name) => sameFile(toPosix(path.resolve(config.root, name)), font.path)),
    );
    if (!asset) {
      throw new Error(
        `[${NAME}] ${font.file} is not in the build. Import '@beautinique/frontend-styles' in the app CSS ` +
          '(after @import "tailwindcss") and keep build.assetsInlineLimit from inlining .woff2 files.',
      );
    }
    return asset;
  }

  /** Vite has already linked the page's CSS (order 'post'): does one of those stylesheets reference the font? */
  function pageUsesFont(html, ctx, asset) {
    const fontName = path.posix.basename(asset.fileName);
    return Object.values(ctx.bundle).some(
      (o) => o.type === 'asset' && o.fileName.endsWith('.css') && html.includes(o.fileName) && String(o.source).includes(fontName),
    );
  }

  function builtHref(asset, ctx) {
    const relative = () => {
      const rel = path.posix.relative(path.posix.dirname(ctx.path), `/${asset.fileName}`);
      return rel.startsWith('.') ? rel : `./${rel}`;
    };
    // same URL the CSS gets when assets are served from a CDN (experimental.renderBuiltUrl)
    const custom = config.experimental?.renderBuiltUrl?.(asset.fileName, {
      type: 'asset',
      hostId: path.posix.relative(toPosix(config.root), toPosix(ctx.filename)),
      hostType: 'html',
      ssr: false,
    });
    if (typeof custom === 'string') return custom;
    if (custom?.relative) return relative();
    if (custom?.runtime) throw new Error(`[${NAME}] renderBuiltUrl returned a runtime URL for ${asset.fileName}; a preload in index.html needs a static URL`);
    if (config.base === '' || config.base.startsWith('.')) return relative();
    return joinUrl(config.base, asset.fileName);
  }

  // mirrors Vite's own dev URL for a file: root-relative inside the app, /@fs/ outside it (workspace packages)
  function devHref(font) {
    const root = toPosix(config.root).replace(/\/?$/, '/');
    const url = font.path.toLowerCase().startsWith(root.toLowerCase()) ? `/${font.path.slice(root.length)}` : path.posix.join('/@fs/', font.path);
    return joinUrl(joinUrl(config.server.origin ?? '', config.base), url);
  }
}

export default beautiniqueFonts;
