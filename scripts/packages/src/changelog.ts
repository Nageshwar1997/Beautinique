// CHANGELOG entries from Conventional Commits (RULES CR-11): commits grouped by type.
export interface Commit {
  subject: string;
}

const GROUPS: [type: string, title: string][] = [
  ['feat', 'Features'],
  ['fix', 'Fixes'],
  ['perf', 'Performance'],
  ['refactor', 'Refactors'],
  ['docs', 'Documentation'],
  ['test', 'Tests'],
  ['build', 'Build'],
  ['ci', 'CI'],
  ['chore', 'Chores'],
  ['style', 'Style'],
  ['revert', 'Reverts'],
];
const CONVENTIONAL = /^(\w+)(?:\(([^)]*)\))?(!?):\s*(.+)$/;

// A commit subject is text from outside; characters that Markdown would act on are escaped.
export function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_{}[\]<>()#+!|~&]/g, '\\$&');
}

function describe(subject: string): { type: string; text: string } {
  const match = CONVENTIONAL.exec(subject);
  if (!match || !GROUPS.some(([type]) => type === match[1]))
    return { type: 'other', text: subject };
  const scope = match[2] ? `${match[2]}: ` : '';
  return { type: match[1] ?? 'other', text: `${scope}${match[4] ?? ''}` };
}

// One version's entry: `## <version> (<date>)`, then a section for each type that has commits.
export function changelogEntry(
  version: string,
  date: string,
  commits: Commit[],
  extra: string[] = [],
): string {
  const lines = [`## ${version} (${date})`, ''];
  const grouped = new Map<string, string[]>();
  for (const commit of commits) {
    const { type, text } = describe(commit.subject);
    grouped.set(type, [...(grouped.get(type) ?? []), escapeMarkdown(text)]);
  }
  const sections: [string, string[]][] = [
    ...GROUPS.map(([type, title]) => [title, grouped.get(type) ?? []] as [string, string[]]),
    ['Other', grouped.get('other') ?? []],
    ['Dependencies', extra],
  ];
  for (const [title, items] of sections) {
    if (items.length === 0) continue;
    lines.push(`### ${title}`, '', ...items.map((item) => `- ${item}`), '');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

// Puts the entry under the title line, above the older entries.
export function addEntry(changelog: string, entry: string): string {
  const [title = '', ...rest] = changelog.split('\n');
  const older = rest.join('\n').replace(/^\n+/, '');
  return `${title}\n\n${entry}${older === '' ? '' : `\n${older}`}`;
}
