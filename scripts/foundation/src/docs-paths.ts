// The docs' paths check (D-019): every relative link in the docs points at a file or folder that is
// in the repository. Docs name a file by linking it, so a moved or deleted file shows here, with
// the doc and line. Backticked names are not checked: they also name planned files, branches and ids.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

// The docs: everything under docs/, and the root README.md and CLAUDE.md.
export function docFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.md')) files.push(path);
    }
  };
  if (existsSync(join(root, 'docs'))) walk(join(root, 'docs'));
  for (const file of ['README.md', 'CLAUDE.md']) {
    if (existsSync(join(root, file))) files.push(join(root, file));
  }
  return files.sort();
}

const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|#)/i;

export function linkProblems(root: string, file: string, text: string): string[] {
  const problems: string[] = [];
  let fenced = false;
  text.split(/\r?\n/).forEach((line, index) => {
    if (/^\s*(?:```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) return;
    for (const match of line.matchAll(LINK)) {
      const target = match[1] ?? '';
      if (EXTERNAL.test(target)) continue;
      // A `#heading` and a `:line` suffix point inside the file; the file itself must exist.
      const path = decodeURI(target.split('#')[0] ?? '').replace(/:\d+$/, '');
      if (path === '') continue;
      if (!existsSync(resolve(dirname(file), path))) {
        problems.push(
          `${relative(root, file).replaceAll('\\', '/')}:${String(index + 1)}: ${target} does not exist`,
        );
      }
    }
  });
  return problems;
}

export function docsPathProblems(root: string): string[] {
  return docFiles(root).flatMap((file) => linkProblems(root, file, readFileSync(file, 'utf8')));
}
