// Tailwind generates only the classes it finds in the files it scans, and it never scans
// node_modules: so every frontend package whose components carry classes ships a `tailwind.css`
// (`@source './dist'`), and whoever renders that package must import it in its CSS entry, or the
// classes are simply missing (an unstyled button, a list wider than the screen). This test is where
// that lives (owner, 2026-11-14): for every app (frontend/<app>) and every package playground, each
// @beautinique frontend package it uses, followed through the packages' own dependencies, that ships
// a tailwind.css is imported in its CSS; and a package with its own tailwind.css has its playground
// scan its own src (the playground is the editor's Tailwind entry for that package).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '../../..');
const PACKAGES = join(ROOT, 'packages/frontend');
const APPS = join(ROOT, 'frontend');
const PREFIX = '@beautinique/frontend-';

const folderOf = (name: string) => join(PACKAGES, name.slice(PREFIX.length));
const isPackage = (name: string) => existsSync(join(folderOf(name), 'package.json'));
const shipsCss = (name: string) => existsSync(join(folderOf(name), 'tailwind.css'));

/** The @beautinique frontend packages a folder's sources import (.ts, .tsx), not node_modules. */
function importsIn(dir: string): Set<string> {
  const found = new Set<string>();
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (entry === 'node_modules' || entry === 'dist' || entry === 'build') continue;
    if (statSync(path).isDirectory()) {
      for (const name of importsIn(path)) found.add(name);
    } else if (/\.tsx?$/.test(entry)) {
      for (const match of readFileSync(path, 'utf8').matchAll(
        /['"](@beautinique\/frontend-[a-z-]+)/g,
      )) {
        if (match[1] !== undefined && isPackage(match[1])) found.add(match[1]);
      }
    }
  }
  return found;
}

/** The packages, with every frontend package they depend on at run time, all the way down. */
function withDependencies(names: Iterable<string>): Set<string> {
  const all = new Set<string>();
  const queue = [...names];
  while (queue.length > 0) {
    const name = queue.pop();
    if (name === undefined || all.has(name)) continue;
    all.add(name);
    const manifest = JSON.parse(readFileSync(join(folderOf(name), 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    queue.push(...Object.keys(manifest.dependencies ?? {}).filter((dep) => dep.startsWith(PREFIX)));
  }
  return all;
}

const cssImports = (css: string) =>
  [...css.matchAll(/@import\s+['"](@beautinique\/frontend-[a-z-]+)\/tailwind\.css['"]/g)].map(
    (match) => match[1],
  );

const apps = readdirSync(APPS).filter((app) => existsSync(join(APPS, app, 'package.json')));
const packages = readdirSync(PACKAGES)
  .map((folder) => `${PREFIX}${folder}`)
  .filter((name) => isPackage(name) && existsSync(join(folderOf(name), 'playground')));

describe('every app imports the tailwind.css of each package it renders', () => {
  it.each(apps)('%s', (app) => {
    const entry = ['src/index.css', 'app/app.css']
      .map((file) => join(APPS, app, file))
      .find((file) => existsSync(file));
    expect(entry, `${app} has no CSS entry`).toBeDefined();
    const css = readFileSync(entry ?? '', 'utf8');
    expect(css).toMatch(/@import\s+['"]tailwindcss['"]/);
    const used = withDependencies(
      importsIn(join(APPS, app, existsSync(join(APPS, app, 'app')) ? 'app' : 'src')),
    );
    const needed = [...used].filter(shipsCss).sort();
    expect(cssImports(css).sort()).toEqual(expect.arrayContaining(needed));
  });
});

describe('every package playground styles what it shows', () => {
  it.each(packages)('%s', (name) => {
    const playground = join(folderOf(name), 'playground');
    const cssFile = readdirSync(playground).find((file) => file.endsWith('.css'));
    expect(cssFile, `${name} playground has no CSS`).toBeDefined();
    const css = readFileSync(join(playground, cssFile ?? ''), 'utf8');
    expect(css).toMatch(/@import\s+['"]tailwindcss['"]/);
    const used = withDependencies([...importsIn(playground), name]);
    used.delete(name);
    const needed = [...used].filter(shipsCss).sort();
    expect(cssImports(css).sort()).toEqual(expect.arrayContaining(needed));
    // its own components from source: the playground is where the editor's Tailwind finds them
    if (shipsCss(name)) expect(css).toMatch(/@source\s+['"]\.\.\/src['"]/);
  });
});
