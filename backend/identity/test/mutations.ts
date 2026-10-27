// Deliberate bugs for `npm run mutate -- --package identity` (RULES §6: sign-in decides who gets an
// account, so its checks get mutations): each one must make a test fail, unless `survives` says
// why it cannot. The runner refuses a list whose `from` text no longer occurs exactly once.

import type { Mutation } from '../../../scripts/mutation/lib/list';

const mutations: Mutation[] = [
  // asking for a code
  {
    file: 'otp',
    name: 'no consent asked',
    change: [['  if (problems.length > 0) {\n', '  if (false) {\n']],
    tests: 'asks the terms',
  },
  {
    file: 'otp',
    name: 'no hourly email limit',
    change: [['if (count > deps.emailLimitPerHour) throw', 'if (false) throw']],
    tests: 'hourly limit',
  },
  {
    file: 'otp',
    name: 'unknown emails sign up in every app',
    change: [
      [
        'const signUp = !hasAccount && (SIGN_UP_APPS as readonly string[]).includes(app);',
        'const signUp = !hasAccount;',
      ],
    ],
    tests: 'unknown email',
  },
  {
    file: 'otp',
    name: 'a code goes out for an unknown email without sign-up',
    change: [['const send = hasAccount || signUp;', 'const send = true;']],
    tests: 'unknown email',
  },
  {
    file: 'otp',
    name: 'no even answer time',
    change: [['    if (left > 0) await sleep(left);\n', '']],
    tests: 'same time as an account',
  },
  {
    file: 'otp',
    name: 'adult declared from any app',
    change: [
      [
        "adult: app === 'customer' && consent?.adult ? '1' : '0',",
        "adult: consent?.adult ? '1' : '0',",
      ],
    ],
    tests: 'made elsewhere',
  },
  {
    file: 'otp',
    name: 'challenge kept without TTL',
    change: [
      ['.hset(key, challenge).pexpire(key, OTP_TTL_MS).exec()', '.hset(key, challenge).exec()'],
    ],
    tests: 'sealed code to notify',
  },
  // new codes
  {
    file: 'otp',
    name: 'resend without wait',
    change: [['if (Number(challenge.resendAfter) > now) throw otpResendTooSoon();', '']],
    tests: 'new code a minute later',
    survives: 'equivalent for behaviour: the RESEND script checks the wait again (-3)',
  },
  {
    file: 'otp',
    name: 'script lets a resend through too soon',
    change: [
      [
        "if tonumber(redis.call('HGET', KEYS[1], 'resendAfter')) > tonumber(ARGV[5]) then return -3 end",
        '',
      ],
      ['if (Number(challenge.resendAfter) > now) throw otpResendTooSoon();', ''],
    ],
    tests: 'new code a minute later',
  },
  {
    file: 'otp',
    name: 'unlimited resends',
    change: [
      ['if resends >= tonumber(ARGV[4]) then return -2 end', ''],
      ['if (Number(challenge.resends) >= OTP_MAX_RESENDS) throw otpResendLimit();', ''],
    ],
    tests: 'new code a minute later',
  },
  {
    file: 'otp',
    name: 'tries not reset by a new code',
    change: [["'codeHash', ARGV[1], 'attempts', 0, 'resends'", "'codeHash', ARGV[1], 'resends'"]],
    tests: 'own 5 tries',
  },
  {
    file: 'otp',
    name: 'resend from another app',
    change: [
      [
        '  if (challenge.email === undefined || challenge.app !== app) throw otpExpired();\n  const now',
        '  if (challenge.email === undefined) throw otpExpired();\n  const now',
      ],
    ],
    tests: 'only in the app',
  },
  // checking a code
  {
    file: 'otp',
    name: 'code from another app accepted',
    change: [
      [
        'if (challenge.email === undefined || challenge.codeHash === undefined || challenge.app !== app) {',
        'if (challenge.email === undefined || challenge.codeHash === undefined) {',
      ],
    ],
    tests: 'only in the app',
  },
  {
    file: 'otp',
    name: 'unlimited tries',
    change: [
      ['  if (tries > OTP_MAX_TRIES) {\n', '  if (false) {\n'],
      ['    if (tries >= OTP_MAX_TRIES) {\n', '    if (false) {\n'],
    ],
    tests: '5 tries',
  },
  {
    file: 'otp',
    name: 'last wrong try leaves the challenge',
    change: [['    if (tries >= OTP_MAX_TRIES) {\n', '    if (tries > OTP_MAX_TRIES) {\n']],
    tests: '5 tries',
  },
  {
    file: 'otp',
    name: 'a decoy challenge takes a code',
    change: [["challenge.send === '1' && sameHash(", 'sameHash(']],
    tests: 'unknown email',
    survives: 'equivalent: a decoy stores the hash of a random value, so no 6-digit code fits it',
  },
  {
    file: 'otp',
    name: 'any code fits',
    change: [
      ["const right =\n    challenge.send === '1' && sameHash(", 'const right = true || sameHash('],
    ],
    tests: '5 tries',
  },
  {
    file: 'otp',
    name: 'a code works twice',
    change: [['if ((await inRedis(() => deps.redis.del(key))) === 0) throw otpExpired();', '']],
    tests: 'works once|two requests',
  },
  {
    file: 'otp',
    name: 'try counted on a gone challenge',
    change: [["if redis.call('EXISTS', KEYS[1]) == 0 then return -1 end\nreturn", 'return']],
    survives: 'a challenge that expires between the read and the try: no test can time it',
  },
  {
    file: 'otp',
    name: 'Redis errors become 500',
    change: [['    throw otpUnavailable(error);', '    throw error;']],
    tests: '503',
  },
  // accounts and consent
  {
    file: 'users',
    name: 'sign-up makes no account',
    change: [['    if (signUp) {\n', '    if (false) {\n']],
    tests: 'makes the account',
  },
  {
    file: 'users',
    name: 'no 18-or-older date at sign-up',
    change: [['ageDeclaredAt: consent.adult ? now : null,', 'ageDeclaredAt: null,']],
    tests: 'makes the account',
  },
  {
    file: 'users',
    name: 'later declaration ignored',
    change: [['if (!isNewUser && consent.adult && user.ageDeclaredAt === null) {', 'if (false) {']],
    tests: 'made elsewhere',
  },
  {
    file: 'users',
    name: 'a consent row at every sign-in',
    change: [
      ['if (isNewUser || declaredNow || latest?.version !== legalVersion) {', 'if (true) {'],
    ],
    tests: 'only when something is new',
  },
  {
    file: 'users',
    name: 'new legal version not recorded',
    change: [
      [
        'if (isNewUser || declaredNow || latest?.version !== legalVersion) {',
        'if (isNewUser || declaredNow) {',
      ],
    ],
    tests: 'only when something is new',
  },
];

export default mutations;
