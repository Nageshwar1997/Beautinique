// Deliberate bugs for `npm run mutate -- --package backend-server-storage` (RULES §6): each one
// must make a test fail, unless `survives` says why it cannot. Keep this list in step with src/:
// the runner refuses a list whose `from` text no longer occurs exactly once.

interface Mutation {
  file: string;
  name: string;
  change: [string, string][];
  tests?: string;
  survives?: string;
}

const mutations: Mutation[] = [
  // keys
  {
    file: 'keys',
    name: 'extra key parts allowed',
    change: [['if (rest.length > 0) return undefined;', 'if (false) return undefined;']],
  },
  {
    file: 'keys',
    name: 'assetKey does not check its parts',
    change: [['if (parseKey(key) === undefined) {', 'if (false) {']],
  },
  {
    file: 'keys',
    name: 'purpose may start anywhere in the text',
    change: [['.regex(/^[a-z][a-z0-9_]*(?:', '.regex(/[a-z][a-z0-9_]*(?:']],
  },
  {
    file: 'keys',
    name: 'purpose may be 640 characters',
    change: [['.max(64)', '.max(640)']],
  },
  // inputs
  {
    file: 'inputs',
    name: 'no size limit allowed',
    change: [
      [
        'maxBytes: int().min(1).max(MAX_UPLOAD_BYTES)',
        'maxBytes: int().min(0).max(MAX_UPLOAD_BYTES)',
      ],
    ],
  },
  {
    file: 'inputs',
    name: 'size limit may pass the maximum',
    change: [
      [
        'maxBytes: int().min(1).max(MAX_UPLOAD_BYTES)',
        'maxBytes: int().min(1).max(MAX_UPLOAD_BYTES + 1)',
      ],
    ],
  },
  {
    file: 'inputs',
    name: 'tickets may last longer than a week',
    change: [['int().min(1).max(MAX_EXPIRY_SECONDS)', 'int().min(1).max(MAX_EXPIRY_SECONDS + 1)']],
  },
  {
    file: 'inputs',
    name: 'tickets last 90 seconds by default',
    change: [['secondsZod(900)', 'secondsZod(90)']],
  },
  {
    file: 'inputs',
    name: 'private URLs last 30 seconds by default',
    change: [['secondsZod(300)', 'secondsZod(30)']],
  },
  {
    file: 'inputs',
    name: 'width 0 allowed',
    change: [['width: int().min(1).max(MAX_WIDTH)', 'width: int().min(0).max(MAX_WIDTH)']],
  },
  {
    file: 'inputs',
    name: 'pages of 10 by default',
    change: [['.default(100)', '.default(10)']],
  },
  {
    file: 'inputs',
    name: 'pages may pass the maximum',
    change: [['int().min(1).max(MAX_LIST_LIMIT)', 'int().min(1).max(MAX_LIST_LIMIT + 1)']],
  },
  {
    file: 'inputs',
    name: 'wrong input passes through',
    change: [['if (result.success) return result.data;', 'return result.data as never;']],
  },
  {
    file: 'inputs',
    name: 'error does not name the field',
    change: [['issue?.path.length ?', 'false ?']],
  },
  // lifecycle
  {
    file: 'lifecycle',
    name: 'UNUSED cannot be cleaned up',
    change: [["UNUSED: ['USED', 'DELETING'],", "UNUSED: ['USED'],"]],
  },
  {
    file: 'lifecycle',
    name: 'USED may be used again',
    change: [["USED: ['DELETING'],", "USED: ['DELETING', 'USED'],"]],
  },
  {
    file: 'lifecycle',
    name: 'DELETING may come back',
    change: [["DELETING: ['DELETED'],", "DELETING: ['DELETED', 'USED'],"]],
  },
  {
    file: 'lifecycle',
    name: 'assertAssetMove allows everything',
    change: [['if (!canMoveAsset(from, to)) {', 'if (false) {']],
  },
  // memory adapter
  {
    file: 'memory',
    name: 'base URL keeps its trailing slash',
    change: [[".replace(/\\/+$/, '')", '']],
  },
  {
    file: 'memory',
    name: 'signatures compared by length only',
    change: [
      ['return a.length === b.length && timingSafeEqual(a, b);', 'return a.length === b.length;'],
    ],
  },
  {
    file: 'memory',
    name: 'signatures of another length crash',
    change: [
      ['return a.length === b.length && timingSafeEqual(a, b);', 'return timingSafeEqual(a, b);'],
    ],
  },
  {
    file: 'memory',
    name: 'ticket lasts 100x too short',
    change: [['input.expiresInSeconds * 1000', 'input.expiresInSeconds * 10']],
  },
  {
    file: 'memory',
    name: 'incomplete ticket not noticed',
    change: [['if (!key || !allowed || !maxBytes || !expiresAt || !signature) {', 'if (false) {']],
  },
  {
    file: 'memory',
    name: 'ticket signature not checked',
    change: [
      [
        "if (!sameSignature(signature, sign('upload', key, allowed, Number(maxBytes), expiresAt))) {",
        'if (false) {',
      ],
    ],
  },
  {
    file: 'memory',
    name: 'ticket valid at the moment it ends',
    change: [
      [
        'if (now().getTime() >= Date.parse(expiresAt)) {',
        'if (now().getTime() > Date.parse(expiresAt)) {',
      ],
    ],
  },
  {
    file: 'memory',
    name: 'ticket never expires',
    change: [['if (now().getTime() >= Date.parse(expiresAt)) {', 'if (false) {']],
  },
  {
    file: 'memory',
    name: 'other file types accepted',
    change: [['if (contentType !== allowed) {', 'if (false) {']],
  },
  {
    file: 'memory',
    name: 'file at exactly the limit refused',
    change: [
      ['if (body.byteLength > Number(maxBytes)) {', 'if (body.byteLength >= Number(maxBytes)) {'],
    ],
  },
  {
    file: 'memory',
    name: 'file over the limit accepted',
    change: [['if (body.byteLength > Number(maxBytes)) {', 'if (false) {']],
  },
  {
    file: 'memory',
    name: 'uploaded bytes shared with the caller',
    change: [
      [
        'files.set(key, { body: body.slice(), contentType, uploadedAt: now() });',
        'files.set(key, { body, contentType, uploadedAt: now() });',
      ],
    ],
    survives:
      'equivalent through the port: the bytes cannot be read back, only their size, which a shared array keeps',
  },
  {
    file: 'memory',
    name: 'private URL not signed',
    change: [["if (visibility === 'private') {", 'if (false) {']],
  },
  {
    file: 'memory',
    name: 'signature leaves the width out',
    change: [
      ["sign('url', input.key, input.width ?? '', expires)", "sign('url', input.key, '', expires)"],
    ],
  },
  {
    file: 'memory',
    name: 'URL time rounded up',
    change: [['Math.floor(now().getTime() / 1000)', 'Math.round(now().getTime() / 1000)']],
  },
  {
    file: 'memory',
    name: 'public URL needs a signature',
    change: [["if (found.visibility === 'public') return true;", 'if (false) return true;']],
  },
  {
    file: 'memory',
    name: 'private URL valid at the moment it ends',
    change: [['expires > now().getTime() / 1000 &&', 'expires >= now().getTime() / 1000 &&']],
  },
  {
    file: 'memory',
    name: 'private URL signature not checked',
    change: [
      [
        "sameSignature(parsed.searchParams.get('sig') ?? '', sign('url', key, width, expires))",
        'true',
      ],
    ],
  },
  {
    file: 'memory',
    name: 'copy of a missing file not noticed',
    change: [['if (!source) {', 'if (false) {']],
  },
  {
    file: 'memory',
    name: 'copy overwrites another asset',
    change: [['if (files.has(key)) {', 'if (false) {']],
  },
  {
    file: 'memory',
    name: 'copy keeps the old upload time',
    change: [
      [
        'const held = { ...source, body: source.body.slice(), uploadedAt: now() };',
        'const held = { ...source, body: source.body.slice() };',
      ],
    ],
  },
  {
    file: 'memory',
    name: 'copy shares the bytes',
    change: [
      [
        'const held = { ...source, body: source.body.slice(), uploadedAt: now() };',
        'const held = { ...source, uploadedAt: now() };',
      ],
    ],
    survives:
      'equivalent through the port: the bytes cannot be read back, only their size, which a shared array keeps',
  },
  {
    file: 'memory',
    name: 'list ignores the prefix',
    change: [['.filter((key) => key.startsWith(input.prefix))', '.filter(() => true)']],
  },
  {
    file: 'memory',
    name: 'list repeats the cursor file',
    change: [['key > input.cursor', 'key >= input.cursor']],
  },
  {
    file: 'memory',
    name: 'list not in key order',
    change: [['.toSorted();', ';']],
  },
  {
    file: 'memory',
    name: 'last full page has a cursor',
    change: [
      [
        'keys.length > input.limit && last !== undefined',
        'keys.length >= input.limit && last !== undefined',
      ],
    ],
  },
];

export default mutations;
