/**
 * @beautinique/frontend-styles/vite: preloads the brand fonts so text renders in them from the first paint.
 *
 * It adds <link rel="preload" as="font"> to index.html with exactly the URL Vite gives the same file in the
 * CSS, so the browser downloads each font once.
 *
 *   import { beautiniqueFonts } from '@beautinique/frontend-styles/vite';
 *   plugins: [react(), tailwindcss(), beautiniqueFonts({ preload: ['sans', 'display'] })]
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

/**
 * @param {import('./vite.d.ts').BeautiniqueFontsOptions} [options]
 * @returns {import('vite').Plugin}
 */
export function beautiniqueFonts({ preload = ['sans'] } = {}) {
  for (const key of preload) {
    if (!Object.hasOwn(manifest.preload, key)) {
      throw new Error(`[${NAME}] preload: unknown font "${key}". Use ${Object.keys(manifest.preload).map((k) => `"${k}"`).join(' or ')}.`);
    }
  }

  const fonts = preload.map((key) => ({ file: manifest.preload[key], path: toPosix(realpathSync(path.join(FONTS_DIR, manifest.preload[key]))) }));

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
          return { tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: true }, injectTo: 'head' };
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
