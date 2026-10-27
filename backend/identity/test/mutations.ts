// Deliberate bugs for `npm run mutate -- --package identity` (RULES §6: sign-up and sign-in decide
// who gets into an account, so their checks get mutations): each one must make a test fail,
// unless `survives` says why it cannot. The runner refuses a list whose `from` text no longer
// occurs exactly once.

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
    name: 'a password code goes out for an unknown email',
    change: [['const send = signUp || hasAccount;', 'const send = true;']],
    tests: 'unknown email',
  },
  {
    file: 'otp',
    name: 'no sign-up code for an unknown email',
    change: [['const send = signUp || hasAccount;', 'const send = hasAccount;']],
    tests: 'makes the account',
  },
  {
    file: 'otp',
    name: 'no even answer time',
    change: [['    if (left > 0) await sleep(left);\n', '']],
    tests: 'same time',
  },
  {
    file: 'otp',
    name: 'adult declared from any app',
    change: [
      [
        "adult: signUp && app === 'customer' && consent?.adult ? '1' : '0',",
        "adult: signUp && consent?.adult ? '1' : '0',",
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
    change: [['    challenge.app !== app ||\n', '']],
    tests: 'only in the app',
  },
  {
    file: 'otp',
    name: 'a code of the old sign-in kind still works',
    change: [
      [" ||\n    (challenge.purpose !== 'sign-up' && challenge.purpose !== 'password')", ''],
    ],
    tests: 'before sign-in by password',
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
    tests: 'sealed code to notify|two requests',
  },
  {
    file: 'otp',
    name: 'breached passwords allowed',
    change: [['if (await deps.breached(password)) throw passwordBreached();', '']],
    tests: 'breached',
  },
  {
    file: 'otp',
    name: 'a new password leaves the lock',
    change: [
      [
        "    await clearFailures(deps.redis, deps.keys, email, { unlock: true });\n    deps.logger.info({ userId: user._id, app }, 'password set with an email code');",
        "    deps.logger.info({ userId: user._id, app }, 'password set with an email code');",
      ],
    ],
    tests: 'locks an account',
  },
  {
    file: 'otp',
    name: 'a password-set sign-up signs in',
    change: [["  if (outcome !== 'account-made') {", '  if (false) {']],
    tests: 'made with Google|keeps the password',
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
    name: 'a consent row for every code',
    change: [['if (isNewUser || declaredNow || !known) {', 'if (true) {']],
    tests: 'records the new app',
  },
  {
    file: 'users',
    name: 'another app’s consent not recorded',
    change: [
      [
        '{ userId: user._id, app, version: legalVersion },',
        '{ userId: user._id, version: legalVersion },',
      ],
    ],
    tests: 'records the new app',
  },
  {
    file: 'users',
    name: 'new legal version not recorded',
    change: [['{ userId: user._id, app, version: legalVersion },', '{ userId: user._id, app },']],
    tests: 'records the new app',
  },
  {
    file: 'users',
    name: 'a sign-up replaces the password',
    change: [
      ['if (!isNewUser && (await hasPassword(mongo, user._id, session))) {', 'if (false) {'],
    ],
    tests: 'keeps the password',
  },
  // the password
  {
    file: 'password',
    name: 'any hash fits',
    change: [['return key.length === want.length && timingSafeEqual(key, want);', 'return true;']],
    tests: 'alike',
  },
  {
    file: 'password',
    name: 'breach list ignored',
    change: [['if (hashSuffix === suffix && Number(count) > 0) return true;', '']],
    tests: 'breached',
  },
  {
    file: 'password',
    name: 'padding lines count as breached',
    change: [
      [
        'if (hashSuffix === suffix && Number(count) > 0) return true;',
        'if (Number(count) >= 0) return true;',
      ],
    ],
    tests: 'breached|makes the account',
  },
  {
    file: 'password',
    name: 'fail-closed when the check is away',
    change: [
      [
        "        'breached-password check unavailable; the password is allowed',\n      );\n      return false;",
        "        'breached-password check unavailable; the password is allowed',\n      );\n      return true;",
      ],
    ],
    tests: 'breached',
  },
  {
    file: 'password',
    name: 'no rehash of older settings',
    change: [['  !hash.startsWith(', '  false && !hash.startsWith(']],
    tests: 'older settings',
  },
  {
    file: 'password',
    name: 'weaker argon2',
    change: [['memory: 19_456, passes: 2,', 'memory: 8_192, passes: 1,']],
    tests: 'makes the account',
  },
  {
    file: 'password',
    name: 'no limit on waiting hashes',
    change: [['if (waiting >= MAX_WAITING_HASHES) throw passwordsBusy();', '']],
    survives:
      'needs 33 sign-ins waiting on one hash at once; the queue itself is not timed by a test',
  },
  // signing in and the lock
  {
    file: 'login',
    name: 'a locked account signs in',
    change: [['if (locked || !right || !user', 'if (!right || !user']],
    tests: 'locks an account',
  },
  {
    file: 'login',
    name: 'any password fits',
    change: [['if (locked || !right || !user', 'if (locked || !user']],
    tests: 'alike',
  },
  {
    file: 'login',
    name: 'wrong passwords not counted',
    change: [
      [
        '    await recordFailure(deps.redis, deps.keys, email);\n    throw invalidCredentials();',
        '    throw invalidCredentials();',
      ],
    ],
    tests: 'locks an account',
  },
  {
    file: 'login',
    name: 'a right password alone resets the count',
    change: [
      [
        '  const now = new Date();\n  if (needsRehash(hash)) {',
        '  await clearFailures(deps.redis, deps.keys, email);\n  const now = new Date();\n  if (needsRehash(hash)) {',
      ],
    ],
    tests: 'toward the account lock',
  },
  {
    file: 'login',
    name: 'no authenticator asked once set up',
    change: [['  if (credentials.totp) {', '  if (false) {']],
    tests: 'every app for a code',
  },
  {
    file: 'login',
    name: 'internal apps without the authenticator',
    change: [
      ['  if ((TOTP_REQUIRED_APPS as readonly string[]).includes(app)) {', '  if (false) {'],
    ],
    tests: 'internal app',
  },
  {
    file: 'login',
    name: 'second step from another app',
    change: [['    login.app !== app ||\n', '']],
    tests: 'its own app',
  },
  {
    file: 'login',
    name: 'second step at another stage',
    change: [[' ||\n    login.stage !== stage', '']],
    tests: 'its own app|before a secret',
  },
  {
    file: 'login',
    name: 'unlimited second-step tries',
    change: [
      ['if (tries > LOGIN_MAX_TRIES ||', 'if (false ||'],
      ['  if (tries >= LOGIN_MAX_TRIES) {\n', '  if (false) {\n'],
    ],
    tests: '5 tries',
  },
  {
    file: 'login',
    name: 'second step goes on while locked',
    change: [
      [
        'if (tries > LOGIN_MAX_TRIES || (await isLocked(deps.redis, deps.keys, login.email))) {',
        'if (tries > LOGIN_MAX_TRIES) {',
      ],
    ],
    tests: 'toward the account lock',
    survives:
      'equivalent where tested: the lock is checked again at the password step, and a locked sign-in cannot get a second step',
  },
  {
    file: 'login',
    name: 'wrong codes not counted toward the lock',
    change: [
      [
        '  await recordFailure(deps.redis, deps.keys, login.email);\n  if (tries >= LOGIN_MAX_TRIES) {',
        '  if (tries >= LOGIN_MAX_TRIES) {',
      ],
    ],
    tests: 'toward the account lock',
  },
  {
    file: 'login',
    name: 'a second step works twice',
    change: [
      [
        'if ((await inRedis(() => deps.redis.del(loginKey(loginId)))) === 0) throw loginExpired();',
        '',
      ],
    ],
    tests: 'each code works once',
  },
  {
    file: 'login',
    name: 'an authenticator code works twice',
    change: [["{ _id: login.userId, 'totp.lastStep': { $lt: step } },", '{ _id: login.userId },']],
    tests: 'each code works once',
  },
  {
    file: 'login',
    name: 'a recovery code works twice',
    change: [
      [
        'recoveryCodes: { $elemMatch: { hash, usedAt: null } }',
        'recoveryCodes: { $elemMatch: { hash } }',
      ],
    ],
    tests: 'recovery code once',
  },
  {
    file: 'login',
    name: 'an authenticator set up over another',
    change: [['{ _id: login.userId, totp: { $exists: false } },', '{ _id: login.userId },']],
    survives:
      'two sign-ins setting up at once: the second confirm finds one saved; a race no test times',
  },
  {
    file: 'login',
    name: 'a wrong first code saves the authenticator',
    change: [
      [
        '  if (step === null) return wrongTry(deps, loginId, login, tries, totpInvalid);\n  await finish',
        '  await finish',
      ],
    ],
    tests: 'wrong first code',
  },
  {
    file: 'login',
    name: 'set-up stage lives 5 minutes',
    change: [
      [
        "const ttl = login.stage === 'enroll' ? ENROLL_TTL_MS : LOGIN_TTL_MS;",
        'const ttl = LOGIN_TTL_MS;',
      ],
    ],
    tests: '10 minutes',
  },
  {
    file: 'lockout',
    name: 'never locks',
    change: [['  if (failures >= MAX_FAILURES) {', '  if (false) {']],
    tests: 'locks an account',
  },
  {
    file: 'lockout',
    name: 'locks one try later',
    change: [['  if (failures >= MAX_FAILURES) {', '  if (failures > MAX_FAILURES) {']],
    tests: 'locks an account',
  },
  {
    file: 'lockout',
    name: 'lock for 15 minutes',
    change: [
      ["set(lockKey(index), '1', 'PX', LOCK_MS)", "set(lockKey(index), '1', 'PX', FAIL_WINDOW_MS)"],
    ],
    tests: 'locks an account',
  },
  {
    file: 'lockout',
    name: 'the count never ends',
    change: [[".pexpire(key, FAIL_WINDOW_MS, 'NX')", ".pexpire(key, LOCK_MS * 1000, 'NX')"]],
    survives: 'the 15-minute window: no test waits it out; the key gets a TTL either way',
  },
  {
    file: 'lockout',
    name: 'unlock keeps the lock',
    change: [
      [
        'const keysToDelete = unlock ? [failKey(index), lockKey(index)] : [failKey(index)];',
        'const keysToDelete = [failKey(index)];',
      ],
    ],
    tests: 'locks an account',
  },
];

export default mutations;
