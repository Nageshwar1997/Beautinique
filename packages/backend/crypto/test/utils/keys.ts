import { newKeyText, parseKeyring, type Keyring } from '../../src/keyring.ts';

/** A keyring of new random keys with these ids, the first the current one. */
export function keyringOf(name: string, ...ids: string[]): Keyring {
  return parseKeyring(ids.map((id) => newKeyText(id)).join(','), name);
}

/** The same keys again, in another order or with some left out: a keyring after a rotation. */
export function reorder(text: string, ids: readonly string[], name: string): Keyring {
  const byId = new Map(text.split(',').map((entry) => [entry.split(':')[0], entry] as const));
  return parseKeyring(ids.map((id) => byId.get(id)).join(','), name);
}
