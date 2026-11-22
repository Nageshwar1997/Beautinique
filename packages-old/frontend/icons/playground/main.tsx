// Playground: every icon at a few sizes, in both themes, through the same pipeline as the apps.
import './playground.css';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { Icon } from '../src/index';
import * as icons from '../src/index';

const all = Object.entries(icons).filter(
  (entry): entry is [string, Icon] => entry[0].startsWith('Icon') && typeof entry[1] === 'function',
);

function Playground() {
  const [dark, setDark] = useState(false);
  return (
    <>
      <header className="container-page mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-brand-gradient mr-auto text-3xl font-medium">
          Beautinique icons ({all.length})
        </h1>
        <button
          type="button"
          aria-pressed={dark}
          className="border-border-strong bg-surface inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
          onClick={() => {
            const next = !dark;
            document.documentElement.setAttribute('theme', next ? 'dark' : 'light');
            setDark(next);
          }}
        >
          {dark ? <icons.IconSun /> : <icons.IconMoon />}
          Dark theme
        </button>
      </header>
      <main id="main" className="container-page">
        <section className="bg-surface border-border mb-6 rounded-lg border p-4" aria-label="Logo">
          <div className="flex flex-wrap items-end gap-6">
            <icons.BrandLogo size={40} label="Beautinique" />
            <icons.BrandLogo layout="stacked" size={120} label="Beautinique, stacked" />
            <icons.BrandMark size={32} label="Beautinique mark" />
            <icons.BrandMark size={16} label="Beautinique mark, small" />
            <icons.BrandLogo size={24} monochrome label="Beautinique, one colour" />
          </div>
        </section>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3">
          {all.map(([name, Component]) => (
            <li key={name} className="bg-surface border-border rounded-lg border p-4">
              <div className="text-brand-text flex items-end gap-3">
                <Component size={16} />
                <Component size={24} />
                <Component size={32} />
              </div>
              <p className="mt-3 font-mono text-xs">{name}</p>
            </li>
          ))}
        </ul>
        <section className="mt-8" aria-labelledby="credits">
          <h2 id="credits" className="text-lg font-semibold">
            Icon credits
          </h2>
          <ul className="text-foreground-muted mt-2 text-sm">
            {icons.ICON_CREDITS.map((credit) => (
              <li key={credit.prefix}>
                {credit.name} by <a href={credit.authorUrl}>{credit.author}</a>,{' '}
                <a href={credit.licenseUrl}>{credit.license}</a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

const root = document.getElementById('root');
if (root) {
  document.documentElement.setAttribute('theme', 'light');
  createRoot(root).render(
    <StrictMode>
      <Playground />
    </StrictMode>,
  );
}
