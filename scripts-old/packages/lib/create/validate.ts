import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { CATEGORIES, type Category } from '../context.ts';
import type { Workspace } from '../workspace.ts';
import { expectedName } from '../workspace.ts';

const NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const MAX_NPM_NAME = 214;

/** The folder name the user types, e.g. "utils" or "date-format". */
export function validateName(
  value: string,
  context: { root: string; scope: string; category: Category; workspace: Workspace },
): true | string {
  const name = value.trim();
  if (name === '') {
    return 'Enter a name.';
  }
  if (!NAME.test(name)) {
    return 'Use lowercase letters and digits, words joined by single hyphens (e.g. date-format).';
  }
  const prefix = CATEGORIES.find((c) => name === c || name.startsWith(`${c}-`));
  if (prefix) {
    return `Leave out "${prefix}": the category is added for you (@beautinique/${context.category}-<name>).`;
  }
  const full = expectedName(context.scope, context.category, name);
  if (full.length > MAX_NPM_NAME) {
    return `The full name ${full} is longer than npm allows (${String(MAX_NPM_NAME)}).`;
  }
  if (existsSync(join(context.root, 'packages', context.category, name))) {
    return `packages/${context.category}/${name} already exists.`;
  }
  if (context.workspace.byName.has(full)) {
    return `${full} already exists in the workspace.`;
  }
  return true;
}

export function validateDescription(value: string): true | string {
  const text = value.trim().replace(/\s+/g, ' ');
  if (text.length < 10) {
    return 'Write at least 10 characters.';
  }
  if (text.length > 200) {
    return 'Keep it under 200 characters.';
  }
  return /[a-z0-9]/i.test(text) ? true : 'Use real words.';
}

/** Comma separated; lowercased, de-duplicated. Empty is fine (the category keywords are always added). */
export function parseKeywords(value: string): string[] {
  return [
    ...new Set(
      value
        .split(',')
        .map((k) => k.trim().toLowerCase().replace(/\s+/g, '-'))
        .filter(Boolean),
    ),
  ];
}

export function validateKeywords(value: string): true | string {
  const keywords = parseKeywords(value);
  if (keywords.length > 10) {
    return 'Use at most 10 keywords.';
  }
  const bad = keywords.find(
    (k) => k.length < 2 || k.length > 30 || !/^[a-z0-9][a-z0-9.-]*$/.test(k),
  );
  return bad ? `"${bad}" is not a good keyword (2-30 characters: letters, digits, - and .).` : true;
}
