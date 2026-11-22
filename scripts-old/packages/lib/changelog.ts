import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Context } from './context.ts';
import { formatFile } from './format.ts';
import { type CommitInfo, commitsSince, lastTag } from './git.ts';
import type { RangeChange, ReleaseItem } from './plan.ts';

const HEADER =
  '# Changelog\n\nAll notable changes to this package. Versions follow [Semantic Versioning](https://semver.org).\n';

const SECTIONS: { title: string; match: RegExp }[] = [
  { title: 'Breaking changes', match: /^\w+(\([^)]*\))?!:/ },
  { title: 'Features', match: /^feat(\([^)]*\))?:/ },
  { title: 'Fixes', match: /^fix(\([^)]*\))?:/ },
  { title: 'Performance', match: /^perf(\([^)]*\))?:/ },
];
const IGNORED = /^(chore\(release\)|release:|Merge )/;

/**
 * A commit subject as plain markdown text: characters that would start emphasis, links or raw HTML are
 * escaped (a subject like "fix: <script> in **name**" must not render as HTML or bold). `code spans`
 * are kept as they are.
 */
export function escapeMarkdown(text: string): string {
  return text
    .split(/(`[^`]+`)/)
    .map((part, i) => (i % 2 === 1 ? part : part.replace(/[\\*_<>[\]]/g, '\\$&')))
    .join('');
}

/** Groups Conventional Commit subjects into changelog sections. */
export function groupCommits(commits: CommitInfo[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const { hash, subject } of commits) {
    if (IGNORED.test(subject)) {
      continue;
    }
    const section = SECTIONS.find((s) => s.match.test(subject))?.title ?? 'Other changes';
    const text = subject.replace(/^\w+(\([^)]*\))?!?:\s*/, '');
    groups.set(section, [...(groups.get(section) ?? []), `${escapeMarkdown(text)} (${hash})`]);
  }
  return groups;
}

/** The markdown for one release of one package. */
export function renderEntry(
  item: Pick<ReleaseItem, 'to' | 'reason'>,
  date: string,
  commits: CommitInfo[],
  ranges: Pick<RangeChange, 'dep' | 'to'>[],
): string {
  const lines = [`## ${item.to} (${date})`, ''];
  if (item.reason === 'new' && commits.length === 0) {
    lines.push('Initial release.', '');
  }
  const groups = groupCommits(commits);
  const order = [...SECTIONS.map((s) => s.title), 'Other changes'];
  for (const title of order) {
    const entries = groups.get(title);
    if (entries) {
      lines.push(`### ${title}`, '', ...entries.map((e) => `- ${e}`), '');
    }
  }
  if (ranges.length > 0) {
    lines.push('### Dependencies', '', ...ranges.map((r) => `- ${r.dep} ${r.to}`), '');
  }
  if (lines.length === 2) {
    lines.push(
      item.reason === 'dependent'
        ? '- Released with updated dependencies.'
        : '- Maintenance release.',
      '',
    );
  }
  return lines.join('\n');
}

/** CHANGELOG.md with the new entry on top (below the header); unchanged if it already has this version. */
export function prependEntry(existing: string | null, version: string, entry: string): string {
  const current = existing ?? HEADER;
  if (current.includes(`\n## ${version} (`)) {
    return current;
  }
  const at = current.indexOf('\n## ');
  return at === -1
    ? `${current.trimEnd()}\n\n${entry}`
    : `${current.slice(0, at + 1)}${entry}\n${current.slice(at + 1)}`;
}

/** New CHANGELOG.md text per released package, from its commits since its last tag. */
export async function buildChangelogs(
  ctx: Context,
  items: ReleaseItem[],
  rangeChanges: RangeChange[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  for (const item of items) {
    const file = join(item.pkg.dir, 'CHANGELOG.md');
    const existing = existsSync(file) ? readFileSync(file, 'utf8').replaceAll('\r\n', '\n') : null;
    const since = await lastTag(ctx, item.pkg.name);
    const commits = await commitsSince(ctx, since, item.pkg.relDir);
    const ranges = rangeChanges.filter(
      (r) => r.pkg.name === item.pkg.name && r.field !== 'devDependencies',
    );
    const entry = renderEntry(item, ctx.today(), commits, ranges);
    const next = prependEntry(existing, item.to, entry);
    if (next !== existing) {
      result.set(file, await formatFile(file, next));
    }
  }
  return result;
}
