import type { ConfigDefinition, ConfigShape } from './define-config.ts';
import { parseEnvFile } from './parse-env-file.ts';
import { stripBom } from './utils/strip-bom.ts';

export const EXAMPLE_SECTIONS = ['DEVELOPMENT', 'TEST', 'PRODUCTION'] as const;

type Section = (typeof EXAMPLE_SECTIONS)[number];

const SECTION_LINE = /^#\s*\[(DEVELOPMENT|TEST|PRODUCTION)\]/;

/**
 * What is wrong in the `.env.example` of a service (docs/RULES.md RT-57), as lines of text. It holds
 * three parts, each from its marker (`# [DEVELOPMENT]`, `# [TEST]`, `# [PRODUCTION]`), and each one
 * must have every key of the config, once, and no key that the config does not have. Empty when it
 * is right. No value is ever in a line.
 */
export function envExampleProblems<S extends ConfigShape>(
  definition: ConfigDefinition<S>,
  text: string,
): string[] {
  const problems: string[] = [];
  // The lines before the first marker, and then the lines of each part with the number of its first line.
  const before: string[] = [];
  const chunks = new Map<Section, { first: number; lines: string[] }>();
  let target = before;

  stripBom(text)
    .split(/\r?\n/)
    .forEach((line, index) => {
      const header = SECTION_LINE.exec(line)?.[1] as Section | undefined;
      if (header === undefined) {
        target.push(line);
        return;
      }
      if (chunks.has(header)) {
        problems.push(`line ${String(index + 1)}: the [${header}] part appears twice`);
      }
      const chunk = { first: index + 2, lines: [] as string[] };
      chunks.set(header, chunk);
      target = chunk.lines;
    });

  const first = parseEnvFile(before.join('\n'));
  problems.push(...first.problems);
  if (Object.keys(first.values).length > 0) problems.push('a key comes before the first part');

  const expected = Object.keys(definition.keys);
  for (const section of EXAMPLE_SECTIONS) {
    const chunk = chunks.get(section);
    if (chunk === undefined) {
      problems.push(`the [${section}] part is missing`);
      continue;
    }
    const { values, problems: lineProblems } = parseEnvFile(chunk.lines.join('\n'), chunk.first);
    problems.push(...lineProblems.map((problem) => `[${section}] ${problem}`));
    for (const key of expected) {
      if (!Object.hasOwn(values, key)) problems.push(`[${section}] lacks ${key}`);
    }
    for (const key of Object.keys(values)) {
      if (!Object.hasOwn(definition.keys, key)) {
        problems.push(
          `[${section}] has ${key}, which is not a key of the ${definition.service} config`,
        );
      }
    }
  }
  return problems;
}
