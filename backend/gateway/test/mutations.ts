// Deliberate bugs for `npm run mutate -- --package gateway` (RULES §6: the gateway decides who may
// call what, so its checks get mutations): each one must make a test fail, unless `survives` says
// why it cannot. The runner refuses a list whose `from` text no longer occurs exactly once.

import type { Mutation } from '../../../scripts/mutation/lib/list';

const mutations: Mutation[] = [
  // 1. origin secret
  {
    file: 'proxy',
    name: 'requests without the origin secret pass',
    change: [['    if (!fromVercel) {\n', '    if (false) {\n']],
    tests: 'origin secret',
  },
  {
    file: 'trust',
    name: 'only the first accepted secret counts (rotation broken)',
    change: [
      [
        'matched = timingSafeEqual(candidate, secret) || matched;',
        'matched = timingSafeEqual(candidate, secret);',
      ],
    ],
    tests: 'origin secret',
  },
  {
    file: 'trust',
    name: 'a missing header matches',
    change: [['if (given === undefined) return false;', "if (given === undefined) given = '';"]],
    tests: 'origin secret',
    survives: 'an empty header hashes to a value no 32+ character secret has: the same refusal',
  },
  {
    file: 'config',
    name: 'short origin secrets are accepted',
    change: [
      [
        'secrets.some((secret) => secret.length < 32)',
        'secrets.some((secret) => secret.length < 3)',
      ],
    ],
    tests: 'refuses wrong',
  },
  {
    file: 'config',
    name: 'any number of origin secrets',
    change: [['      secrets.length > 2 ||\n', '']],
    tests: 'refuses wrong',
  },
  // 2. app and host
  {
    file: 'proxy',
    name: 'the app host is not checked',
    change: [['if (!isApp(app) || !fromAppHost(req, app, apps)) {', 'if (!isApp(app)) {']],
    tests: 'own host',
  },
  {
    file: 'proxy',
    name: "another app's x-forwarded-host passes",
    change: [
      [
        'if (apps.appOf(forwarded) !== app) return false;',
        'if (apps.appOf(forwarded) === null) return false;',
      ],
    ],
    tests: 'own host',
  },
  {
    file: 'proxy',
    name: "another app's Host passes when there is no proxy",
    change: [['if (hostApp !== null && hostApp !== app) return false;', '']],
    tests: 'own host',
  },
  {
    file: 'proxy',
    name: 'the Origin is not checked',
    change: [['if (origin === undefined) return true;', 'return true;']],
    tests: 'own host',
  },
  {
    file: 'proxy',
    name: "an Origin that is no app's passes",
    change: [['    apps.appOf(fromHost) === app\n', '    true\n']],
    tests: 'own host',
  },
  {
    file: 'apps',
    name: 'any preview scope passes',
    change: [
      [
        '|[a-z0-9]{9})-${vercelScope}\\\\.vercel\\\\.app$`',
        '|[a-z0-9]{9})-[a-z0-9-]+\\\\.vercel\\\\.app$`',
      ],
    ],
    tests: 'own host',
  },
  {
    file: 'apps',
    name: 'host case and trailing dot are not normalised',
    change: [[".trim().toLowerCase().replace(/\\.$/, '')", '.trim()']],
    tests: 'own host',
  },
  {
    file: 'apps',
    name: 'Origin with another scheme passes',
    change: [
      ["return protocol === 'https:' || protocol === 'http:' ? host : null;", 'return host;'],
    ],
    tests: 'own host',
  },
  {
    file: 'proxy',
    name: 'the app may use any route',
    change: [['    if (!route.apps.includes(app)) {\n', '    if (false) {\n']],
    tests: 'known app',
  },
  // 3. access and idempotency
  {
    file: 'proxy',
    name: 'signed-in routes pass without sign-in',
    change: [
      [
        "    if (route.access.type !== 'public') {\n",
        "    if (route.access.type === 'permission') {\n",
      ],
    ],
    tests: 'sign-in',
  },
  {
    file: 'proxy',
    name: 'the Idempotency-Key is not needed',
    change: [
      ['if (route.idempotency && !IDEMPOTENCY_KEY.test(', 'if (false && !IDEMPOTENCY_KEY.test('],
    ],
    tests: 'Idempotency-Key',
  },
  {
    file: 'proxy',
    name: 'any Idempotency-Key text passes',
    change: [
      ['const IDEMPOTENCY_KEY = /^[\\x21-\\x7e]{1,255}$/;', 'const IDEMPOTENCY_KEY = /^.{1,}$/;'],
    ],
    tests: 'Idempotency-Key',
  },
  // 4. rate limits
  {
    file: 'proxy',
    name: 'a refused request still passes',
    change: [['      if (!result.allowed) {\n', '      if (false) {\n']],
    tests: 'budget',
  },
  {
    file: 'proxy',
    name: 'every client shares one bucket',
    change: [['`${route.rateLimit}:${ipKey(ip)}`', '`${route.rateLimit}:all`']],
    tests: 'budget',
  },
  {
    file: 'proxy',
    name: 'auth passes when Redis is down (fail open)',
    change: [['      if (FAIL_CLOSED.has(route.rateLimit)) {\n', '      if (false) {\n']],
    tests: 'Redis is down',
  },
  {
    file: 'proxy',
    name: 'every class fails closed',
    change: [['      if (FAIL_CLOSED.has(route.rateLimit)) {\n', '      if (true) {\n']],
    tests: 'Redis is down',
  },
  {
    file: 'rate-limits',
    name: 'no Retry-After on a refusal',
    change: [["...(result.allowed ? {} : { 'Retry-After': seconds(result.retryAfterMs) }),", '']],
    tests: 'budget',
  },
  {
    file: 'trust',
    name: 'x-real-ip counts without the origin secret',
    change: [['if (fromVercel && real !== undefined', 'if (real !== undefined']],
    tests: 'client IP',
  },
  {
    file: 'trust',
    name: 'any x-real-ip text is taken',
    change: [['real !== undefined && isIP(real) !== 0', 'real !== undefined']],
    tests: 'request id and a re-encoded path',
  },
  // 5. what reaches the owner, and what comes back
  {
    file: 'proxy',
    name: 'the origin secret goes on to the owner',
    change: [['  ORIGIN_SECRET_HEADER,\n', '']],
    tests: 'sends a request to its owner',
  },
  {
    file: 'proxy',
    name: "the client's x-real-ip goes on to the owner",
    change: [["  'x-real-ip',\n", '']],
    tests: 'sends a request to its owner',
  },
  {
    file: 'proxy',
    name: 'the gateway does not tell the client IP',
    change: [['  headers[HEADERS.clientIp.toLowerCase()] = ip;\n', '']],
    tests: 'sends a request to its owner',
  },
  {
    file: 'proxy',
    name: 'a cached route forwards cookies',
    change: [['!(route.cache && PERSONAL.has(name))', 'true']],
    tests: 'CDN only',
  },
  {
    file: 'proxy',
    name: 'a cached route passes Set-Cookie back',
    change: [["(route.cache && name === 'set-cookie')", 'false']],
    tests: 'CDN only',
  },
  {
    file: 'proxy',
    name: "the owner's public policy is kept",
    change: [["  return 'private, no-store';\n}", "  return upstream ?? 'private, no-store';\n}"]],
    tests: 'never let other answers be shared',
  },
  {
    file: 'proxy',
    name: 'gateway errors have no cache policy',
    change: [["    res.setHeader('Cache-Control', 'no-store');\n", '']],
    tests: 'never let other answers be shared',
  },
  {
    file: 'proxy',
    name: 'the stale window is left out',
    change: [
      [
        '    return `public, max-age=0, s-maxage=${String(sMaxAge)}${stale}`;',
        '    return `public, max-age=0, s-maxage=${String(sMaxAge)}`;',
      ],
    ],
    tests: 'CDN only',
  },
  // found by the review (2026-10-25)
  {
    file: 'proxy',
    name: 'a GET body is refused nowhere and piped to the owner (request smuggling)',
    change: [
      ['    if (BODYLESS.has(route.method) && hasBody) {\n', '    if (false) {\n'],
      [
        '  if (BODYLESS.has(route.method)) {\n    upstream.end();',
        '  if (false) {\n    upstream.end();',
      ],
    ],
    tests: 'smuggled',
  },
  {
    file: 'proxy',
    name: 'a GET body is not refused (the owner still gets none)',
    change: [['    if (BODYLESS.has(route.method) && hasBody) {\n', '    if (false) {\n']],
    tests: 'smuggled',
  },
  {
    file: 'proxy',
    name: 'a stalled answer is left hanging',
    change: [
      [
        '      pipeline(answer, res, (error) => {\n        if (error) res.destroy();\n      });',
        '      answer.pipe(res);',
      ],
    ],
    tests: 'stops halfway',
  },
  {
    file: 'proxy',
    name: 'Origin need not be the request host',
    change: [['    normalizeHost(fromHost) === normalizeHost(host) &&\n', '']],
    tests: 'own host',
  },
  {
    file: 'proxy',
    name: 'the owner is called after the caller left',
    change: [['    if (caller.gone) return;\n', '']],
    tests: 'caller leaves',
  },
  // 6. /status
  {
    file: 'status',
    name: 'any check name is echoed',
    change: [['if (CHECK_NAME.test(name)) checks[name]', 'checks[name]']],
    tests: 'degraded',
  },
  {
    file: 'status',
    name: 'a failing deployable leaves /status ok',
    change: [
      [
        "const degraded = entries.some(([, value]) => value.status === 'failing');",
        'const degraded = false;',
      ],
    ],
    tests: 'degraded',
  },
  {
    file: 'status',
    name: '/status asks the deployables every time',
    change: [['if (last === undefined || now - last.at >= reuseMs) {', 'if (true) {']],
    tests: 'every deployable and its checks',
  },
  // sign-in at the gateway (T3.2 PR B)
  {
    file: 'sessions',
    name: 'a token of any app',
    change: [
      ['          audience: tokenAudience(app),', "          audience: tokenAudience('customer'),"],
    ],
    tests: 'another app',
  },
  {
    file: 'sessions',
    name: 'an ended session passes',
    change: [['ended === 1 || (since', '(since']],
    tests: 'ended in Redis',
  },
  {
    file: 'sessions',
    name: 'a new password ends no token',
    change: [
      ['ended === 1 || (since !== null && claims.iat * 1000 <= Number(since))', 'ended === 1'],
    ],
    tests: 'ended in Redis',
  },
  {
    file: 'sessions',
    name: 'tokens issued after the end refused too',
    change: [['claims.iat * 1000 <= Number(since)', 'since !== ""']],
    tests: 'ended in Redis',
  },
  {
    file: 'sessions',
    name: 'unreadable keys taken for a bad token',
    change: [
      [
        '        known = await keys.keysFor(tokenKeyId(token));\n      } catch (error) {\n        throw unavailable(error);',
        '        known = await keys.keysFor(tokenKeyId(token));\n      } catch (error) {\n        throw signIn(error);',
      ],
    ],
    tests: 'fails closed',
  },
  {
    file: 'proxy',
    name: 'a client’s passport goes on',
    change: [['  HEADERS.passport.toLowerCase(),\n', '']],
    tests: 'no passport for a public route',
  },
  {
    file: 'proxy',
    name: 'permission routes open to anyone signed in',
    change: [["      if (route.access.type === 'permission') {", '      if (false) {']],
    tests: 'permission route',
  },
  {
    file: 'proxy',
    name: 'passport for every owner',
    change: [['passportAudience(route.owner)', "passportAudience('identity')"]],
    tests: '60-second passport',
  },
  {
    file: 'proxy',
    name: 'no passport to the owner',
    change: [['  if (passport) headers[HEADERS.passport.toLowerCase()] = passport;\n', '']],
    tests: '60-second passport',
  },
];

export default mutations;
