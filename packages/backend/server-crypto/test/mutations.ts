// Deliberate bugs for `npm run mutate -- --package backend-server-crypto` (RULES §6): each one
// must make a test fail, unless `survives` says why it cannot. Keep this list in step with src/:
// the runner refuses a list whose `from` text no longer occurs exactly once.

import type { Mutation } from '../../../../scripts/mutation/lib/list';

const mutations: Mutation[] = [
  {
    file: 'keys',
    name: 'any key id accepted',
    change: [['if (at <= 0 || !KEY_ID.test(id)) {', 'if (at <= 0) {']],
  },
  {
    file: 'keys',
    name: 'short keys accepted',
    change: [['if (key.length !== KEY_BYTES) {', 'if (false) {']],
  },
  {
    file: 'keys',
    name: 'no key accepted',
    change: [
      [
        "if (!first) throw new CryptoError('FIELD_KEYS: give at least one key');",
        "if (!first) return { encryption: { current: '', keys: new Map() }, blindIndex: { id: '', key: Buffer.alloc(0) } };",
      ],
    ],
  },
  {
    file: 'keys',
    name: 'duplicate key id accepted',
    change: [['if (keys.has(id)) throw', 'if (false) throw']],
  },
  {
    file: 'keys',
    name: 'index key may equal a field key',
    change: [['if (key.equals(indexKey)) {', 'if (false) {']],
  },
  {
    file: 'keys',
    name: 'last key seals',
    change: [['current: first[0]', 'current: entries.at(-1)?.[0] ?? first[0]']],
  },
  {
    file: 'keys',
    name: 'generated keys too short',
    change: [['return randomBytes(KEY_BYTES).toString', 'return randomBytes(16).toString']],
  },
  {
    file: 'fields',
    name: 'empty context allowed',
    change: [["if (context.trim() === '') {", 'if (false) {']],
  },
  {
    file: 'fields',
    name: 'fixed IV',
    change: [['const iv = randomBytes(IV_BYTES);', 'const iv = Buffer.alloc(IV_BYTES);']],
  },
  {
    file: 'fields',
    name: 'context not bound when sealing',
    change: [["  cipher.setAAD(Buffer.from(context, 'utf8'));\n", '']],
  },
  {
    file: 'fields',
    name: 'context not checked when opening',
    change: [["    decipher.setAAD(Buffer.from(context, 'utf8'));\n", '']],
  },
  {
    file: 'fields',
    name: 'part count not checked',
    change: [['    parts.length !== 5 ||\n', '']],
  },
  {
    file: 'fields',
    name: 'version not checked',
    change: [['    version !== VERSION ||\n', '']],
  },
  {
    file: 'fields',
    name: 'IV and tag size not checked',
    change: [['if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {', 'if (false) {']],
    survives:
      'equivalent: Node GCM rejects a wrong IV or tag size itself; the check only gives a clearer message',
  },
  {
    file: 'fields',
    name: 'every value needs re-encrypting',
    change: [['return parseSealed(sealed).keyId !== keys.encryption.current;', 'return true;']],
  },
  {
    file: 'fields',
    name: 'field and value run together',
    change: [["    .update('\\0')\n", '']],
  },
  {
    file: 'fields',
    name: 'field left out of the index',
    change: [["    .update(field, 'utf8')\n", '']],
  },
  {
    file: 'fields',
    name: 'empty field name allowed',
    change: [["if (field.trim() === '') throw", 'if (false) throw']],
  },
  {
    file: 'fields',
    name: 'index without its key id',
    change: [['return `${keys.blindIndex.id}.${mac}`;', 'return mac;']],
  },
  {
    file: 'fields',
    name: 'short values shown',
    change: [["if (value.length <= visible) return 'X'.repeat(value.length);", '']],
  },
  {
    file: 'fields',
    name: 'sealed before normalising',
    change: [
      ['enc: encryptField(keys, normalized, context),', 'enc: encryptField(keys, value, context),'],
    ],
  },
  {
    file: 'fields',
    name: 'index before normalising',
    change: [['idx: blindIndex(keys, field, normalized),', 'idx: blindIndex(keys, field, value),']],
  },
  {
    file: 'fields',
    name: 'mask before normalising',
    change: [['masked: maskTail(normalized, visible),', 'masked: maskTail(value, visible),']],
  },
];

export default mutations;
