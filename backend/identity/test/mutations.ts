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
    change: [
      [
        '.countDocuments({ email }, { limit: 1 })) > 0);',
        '.countDocuments({ email }, { limit: 1 })) >= 0);',
      ],
    ],
    tests: 'unknown email',
  },
  {
    file: 'otp',
    name: 'no sign-up code for an unknown email',
    change: [['  const send =\n    signUp ||', '  const send =\n    false ||']],
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
        "adult: asksConsent && app === 'customer' && consent?.adult ? '1' : '0',",
        "adult: asksConsent && consent?.adult ? '1' : '0',",
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
      [
        " ||\n    (challenge.purpose !== 'sign-up' &&\n      challenge.purpose !== 'password' &&\n      challenge.purpose !== 'invite')",
        '',
      ],
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
        "    await clearFailures(deps.redis, deps.keys, email, { unlock: true });\n    await deps.sessions.endAll(user._id, 'password-changed');\n    deps.logger",
        "    await deps.sessions.endAll(user._id, 'password-changed');\n    deps.logger",
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
      [
        "if (!isNewUser && (await hasPassword(mongo, user._id, session))) return 'password-kept';",
        "if (false) return 'password-kept';",
      ],
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
      [
        '  if ((TOTP_REQUIRED_APPS as readonly string[]).includes(app) || access.mfaRequired) {',
        '  if (access.mfaRequired) {',
      ],
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
  // sessions (T3.2)
  {
    file: 'sessions',
    name: 'access token for every app',
    change: [
      ['        aud: tokenAudience(session.app),', "        aud: tokenAudience('customer'),"],
    ],
    tests: 'JWKS verifies',
  },
  {
    file: 'sessions',
    name: 'access token lives an hour',
    change: [['exp: iat + ACCESS_TOKEN_SECONDS,', 'exp: iat + 3600,']],
    tests: 'JWKS verifies',
  },
  {
    file: 'sessions',
    name: 'refresh without the token',
    change: [
      ['          refreshHash: hash,\n          revokedAt: null,', '          revokedAt: null,'],
    ],
    tests: 'made-up token|parallel tab',
  },
  {
    file: 'sessions',
    name: 'an ended session refreshes',
    change: [
      ['          refreshHash: hash,\n          revokedAt: null,', '          refreshHash: hash,'],
    ],
    tests: 'logs out',
  },
  {
    file: 'sessions',
    name: 'an expired session refreshes',
    change: [['          expiresAt: { $gt: new Date(at) },\n', '']],
    tests: '90 days',
  },
  {
    file: 'sessions',
    name: 'no idle end',
    change: [
      [
        '            : { lastSeenAt: { $gt: new Date(at - policy.idleMs) } }),',
        '            : {}),',
      ],
    ],
    tests: 'idle minutes',
  },
  {
    file: 'sessions',
    name: 'no 90-day cap',
    change: [
      [
        "expiresAt: { $min: [{ $add: ['$createdAt', policy.maxMs] }, until] },",
        'expiresAt: until,',
      ],
    ],
    tests: '90 days',
  },
  {
    file: 'sessions',
    name: 'a copy taken for a parallel tab',
    change: [['at - found.rotatedAt.getTime() < REFRESH_RACE_MS', 'true']],
    tests: 'parallel tab',
  },
  {
    file: 'sessions',
    name: 'a parallel tab taken for a copy',
    change: [
      [
        'if (found.rotatedAt && at - found.rotatedAt.getTime() < REFRESH_RACE_MS) {',
        'if (false) {',
      ],
    ],
    tests: 'parallel tab',
  },
  {
    file: 'sessions',
    name: 'any old token taken for a copy',
    change: [
      [
        'found?.revokedAt !== null || found.previousRefreshHash !== hash',
        'found?.revokedAt !== null',
      ],
    ],
    tests: 'made-up token',
  },
  {
    file: 'sessions',
    name: 'alarm for a session that ran out',
    change: [['      if (found.expiresAt.getTime() <= at || idle) throw sessionExpired();\n', '']],
    tests: 'idle minutes',
  },
  {
    file: 'sessions',
    name: 'logout leaves the gateway in the dark',
    change: [
      [
        "      if (ended.modifiedCount === 1) {\n        await revokeAtGateway(sessionId);\n        logger.info({ app, sessionId }, 'signed out');",
        "      if (ended.modifiedCount === 1) {\n        logger.info({ app, sessionId }, 'signed out');",
      ],
    ],
    tests: 'logs out',
  },
  {
    file: 'sessions',
    name: 'logout without the token',
    change: [
      [
        '{ _id: sessionId, app, refreshHash: refreshHashOf(keys, refreshToken), revokedAt: null },',
        '{ _id: sessionId, app, revokedAt: null },',
      ],
    ],
    tests: 'logs out',
  },
  {
    file: 'sessions',
    name: 'a new password ends no session',
    change: [
      ['        { userId, revokedAt: null },', '        { userId: null, revokedAt: null },'],
    ],
    tests: 'every session of an account',
  },
  {
    file: 'sessions',
    name: 'a new password not told to the gateway',
    change: [
      [
        "      await inRedis(() => redis.set(revokedUserKey(userId), String(at), 'PX', REVOKE_TTL_MS));\n",
        '',
      ],
    ],
    tests: 'every session of an account',
  },
  {
    file: 'otp',
    name: 'a new password keeps the sessions',
    change: [
      [
        "    await clearFailures(deps.redis, deps.keys, email, { unlock: true });\n    await deps.sessions.endAll(user._id, 'password-changed');\n    deps.logger",
        '    await clearFailures(deps.redis, deps.keys, email, { unlock: true });\n    deps.logger',
      ],
    ],
    tests: 'every session of an account',
  },
  {
    file: 'signing-keys',
    name: 'keys never rotate',
    change: [['now() - newest.createdAt.getTime() >= ROTATE_AFTER_MS', 'false']],
    tests: 'signing keys',
  },
  {
    file: 'signing-keys',
    name: 'JWKS drops the old key at once',
    change: [['new Date(now() - PUBLISH_FOR_MS)', 'new Date(now() - ROTATE_AFTER_MS)']],
    tests: 'signing keys',
  },
  {
    file: 'cookies',
    name: 'access cookie readable by scripts',
    change: [
      [
        '  res.cookie(accessCookieName(session.app), session.accessToken, {\n    httpOnly: true,\n',
        '  res.cookie(accessCookieName(session.app), session.accessToken, {\n',
      ],
    ],
    tests: 'two cookies',
  },
  {
    file: 'cookies',
    name: 'refresh cookie sent everywhere',
    change: [
      [
        "    sameSite: 'strict',\n    path: REFRESH_COOKIE_PATH,\n    maxAge:",
        "    sameSite: 'strict',\n    path: '/',\n    maxAge:",
      ],
    ],
    tests: 'two cookies',
  },
  {
    file: 'cookies',
    name: 'refresh cookie Lax',
    change: [
      [
        "    sameSite: 'strict',\n    path: REFRESH_COOKIE_PATH,\n    maxAge:",
        "    sameSite: 'lax',\n    path: REFRESH_COOKIE_PATH,\n    maxAge:",
      ],
    ],
    tests: 'two cookies',
  },
  {
    file: 'cookies',
    name: 'tokens left in the answer',
    change: [
      [
        '  const { session, ...answer } = result;\n  if (session) setSessionCookies(res, session);\n  return answer as WithoutSession<T>;',
        '  if (result.session) setSessionCookies(res, result.session);\n  return result as WithoutSession<T>;',
      ],
    ],
    tests: 'keeps every token out',
  },
  {
    file: 'routes/index',
    name: 'an ended session keeps its cookies',
    change: [
      [
        "      if (error instanceof AppError && error.code === 'SESSION_EXPIRED') {",
        '      if (false) {',
      ],
    ],
    tests: 'made-up token',
  },
  // signed-in routes (T3.2 PR B)
  {
    file: 'me',
    name: 'an ended session still answers',
    change: [
      [
        '.findOne({ _id: passport.sessionId, userId: passport.userId, revokedAt: null });',
        '.findOne({ _id: passport.sessionId, userId: passport.userId });',
      ],
    ],
    tests: 'ended session',
  },
  {
    file: 'me',
    name: 'every session marked current',
    change: [['current: session._id === passport.sessionId,', 'current: true,']],
    tests: 'My Devices',
  },
  {
    file: 'sessions',
    name: 'another account’s session ends',
    change: [
      [
        '        { _id: sessionId, userId, revokedAt: null },',
        '        { _id: sessionId, revokedAt: null },',
      ],
    ],
    tests: 'never another account',
  },
  {
    file: 'sessions',
    name: 'end-others ends this one too',
    change: [['_id: { $ne: keep } }', '}']],
    tests: 'never another account',
  },
  {
    file: 'routes/index',
    name: 'any device’s end clears this one’s cookies',
    change: [['if (ended && params.sessionId === passport.sessionId)', 'if (ended)']],
    tests: 'never another account',
  },

  // T3.3: who may sign in where (grants)
  {
    file: 'login',
    name: 'sign-in without a grant in the app',
    change: [['  if (!access.allowed) throw invalidCredentials();\n', '']],
    tests: 'like a wrong password',
  },
  {
    file: 'login',
    name: 'a role that asks an authenticator does not',
    change: [[' || access.mfaRequired) {', ') {']],
    tests: 'Seller Finance or Account Owner',
  },
  {
    file: 'sessions',
    name: 'a session for an app without a grant',
    change: [['      if (!access.allowed) throw invalidCredentials();\n', '']],
    tests: 'whoever asks',
  },
  {
    file: 'sessions',
    name: 'refresh keeps a session whose grant ended',
    change: [['        if (!access.allowed) {', '        if (false) {']],
    tests: 'no grant left',
  },
  {
    file: 'sessions',
    name: 'tokens always carry av 0',
    change: [['        av: authzVersion,', '        av: 0,']],
    tests: 'authz version',
  },
  {
    file: 'rbac/grants',
    name: 'a grant counts before it starts',
    change: [['{ $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },', '{},']],
    tests: 'not before it starts',
  },
  {
    file: 'rbac/grants',
    name: 'a grant counts after it ran out',
    change: [['{ $or: [{ validTo: null }, { validTo: { $gt: now } }] },', '{},']],
    tests: 'not before it starts',
  },
  {
    file: 'rbac/grants',
    name: 'an ended grant still counts',
    change: [
      [
        'export const activeAt = (now: Date) => ({\n  active: true,\n',
        'export const activeAt = (now: Date) => ({\n',
      ],
    ],
    tests: 'not before it starts|seat comes back',
  },
  {
    file: 'rbac/grants',
    name: 'a new grant does not raise the authz version',
    change: [
      ['{ $inc: { authzVersion: 1 }, $set: { updatedAt: now } }', '{ $set: { updatedAt: now } }'],
    ],
    tests: 'authz version|raises the authz version',
  },
  {
    file: 'rbac/grants',
    name: 'roles that ask an authenticator never do',
    change: [
      [
        'mfaRequired: roles.some((role) => role.mfaRequired), authzVersion',
        'mfaRequired: false, authzVersion',
      ],
    ],
    tests: 'Seller Finance or Account Owner',
  },
  {
    file: 'users',
    name: 'no grant at sign-up',
    change: [
      [
        '    await giveSignUpGrant(mongo, session, { userId: user._id, app: input.app, now });\n',
        '',
      ],
    ],
    tests: 'sign-up grants',
  },
  {
    file: 'rbac/migrations',
    name: 'migration gives Customer without the 18+ declaration',
    change: [["(app === 'customer' && user.ageDeclaredAt === null)", 'false']],
    tests: 'before T3.3',
  },
  {
    file: 'rbac/bootstrap',
    name: 'a third Master',
    change: [['if (holders.length >= MASTER_SEATS) {', 'if (holders.length > MASTER_SEATS) {']],
    tests: 'at most two',
  },
  {
    file: 'rbac/bootstrap',
    name: 'two at once both take the last Master seat',
    change: [['{ $inc: { seatClaims: 1 } }', '{ $inc: { seatClaims: 0 } }']],
    tests: 'never to both',
  },
  {
    file: 'rbac/sync',
    name: 'the sync retires Master’s own sub-roles',
    change: [['{ system: true, retired: false, _id: { $nin:', '{ retired: false, _id: { $nin:']],
    tests: 'never touches Master',
  },

  // T3.3 PR B: giving, ending and seeing roles, invitations
  {
    file: 'rbac/grants',
    name: 'a retired role still opens its app',
    change: [
      [
        '{ _id: { $in: grants.map((grant) => grant.role) }, retired: false },',
        '{ _id: { $in: grants.map((grant) => grant.role) } },',
      ],
    ],
    tests: 'renews their holders',
  },
  {
    file: 'rbac/grants',
    name: 'grant changes never reach the gateway',
    change: [['if tonumber(ARGV[1]) > current then', 'if false then']],
    tests: 'State Admin a state|ends a role at once|renews their holders',
  },
  {
    file: 'rbac/grants',
    name: 'ending a grant does not raise the authz version',
    change: [
      [
        '  await raiseAuthzVersion(mongo, session, ended.userId, now);\n  return ended;',
        '  return ended;',
      ],
    ],
    tests: 'ends a role at once',
  },
  {
    file: 'rbac/authority',
    name: 'an appointer role without the right to give still gives',
    change: [['      own.permissions.includes(grantManage.key) &&\n', '']],
    tests: 'keeps the right to give',
  },
  {
    file: 'rbac/authority',
    name: 'any role gives any role',
    change: [['      role.appointedBy.includes(own._id) &&\n', '']],
    tests: 'only the roles they appoint',
  },
  {
    file: 'rbac/authority',
    name: 'a scope wider than the giver’s',
    change: [['      scopeWithin(grant.scope, inner, chainOf),', '      true,']],
    tests: 'only the roles they appoint',
  },
  {
    file: 'rbac/authority',
    name: 'unknown state ids',
    change: [["if (scope.type === 'state' && !scope.ids.every(isStateId)) {", 'if (false) {']],
    tests: 'refuses what does not fit',
  },
  {
    file: 'rbac/authority',
    name: 'hubs and cities before the location master',
    change: [['  if (NOT_KNOWN_YET.has(scope.type)) {', '  if (false) {']],
    tests: 'refuses what does not fit',
  },
  {
    file: 'rbac/authority',
    name: 'a self scope for someone else',
    change: [['    if (scope.ids.join() !== wanted.join()) {', '    if (false) {']],
    tests: 'own account',
  },
  {
    file: 'rbac/authority',
    name: 'an end in the past',
    change: [['validTo.getTime() <= now.getTime()', 'false']],
    tests: 'refuses what does not fit',
  },
  {
    file: 'rbac/authority',
    name: 'a retired role is given',
    change: [
      [
        "  if (role.retired) problems.push({ path: ['role'], message: 'This role is retired' });\n",
        '',
      ],
    ],
    tests: 'renews their holders',
  },
  {
    file: 'rbac/authority',
    name: 'a reviewer sees nothing',
    change: [
      ['const reviewer = !own.permissions.includes(grantManage.key);', 'const reviewer = false;'],
    ],
    tests: 'who sees which grants|a reviewer every role',
  },
  {
    file: 'rbac/authority',
    name: 'an appointer sees every role',
    change: [['...(reviewer ? {} : { role: { $in: givable } })', '...{}']],
    tests: 'a reviewer every role',
  },
  {
    file: 'rbac/authority',
    name: 'an appointer sees every scope',
    change: [["        grant.scope.type === 'global'\n", '        true\n']],
    tests: 'a reviewer every role',
  },
  {
    file: 'rbac/manage',
    name: 'a role to oneself',
    change: [
      [
        "  if (body.userId === passport.userId) throw forbidden('Nobody gives a role to themselves.');\n",
        '',
      ],
    ],
    tests: 'refuses what does not fit',
  },
  {
    file: 'rbac/manage',
    name: 'ending one’s own role',
    change: [
      [
        "  if (grant.userId === passport.userId) throw forbidden('Nobody ends their own role.');\n",
        '',
      ],
    ],
    tests: 'ends a role at once',
  },
  {
    file: 'rbac/manage',
    name: 'anyone ends a role',
    change: [['if (!role || !appointingGrant(caller, role, grant.scope)) {', 'if (!role) {']],
    tests: 'ends a role at once',
  },
  {
    file: 'rbac/manage',
    name: 'a shipped role changes through the API',
    change: [["  if (role.system) throw forbidden('A shipped role changes only in code.');\n", '']],
    tests: 'renews their holders',
  },
  {
    file: 'rbac/manage',
    name: 'holders keep their old tokens after a change',
    change: [['const renew = allows(role) !== allows(next);', 'const renew = false;']],
    tests: 'renews their holders',
  },
  {
    file: 'rbac/manage',
    name: 'an appointer role loses the right to give',
    change: [
      ['if (!next.permissions.includes(grantManage.key) || next.retired) {', 'if (false) {'],
    ],
    tests: 'keeps the right to give',
  },
  {
    file: 'rbac/manage',
    name: 'a sub-role that makes roles',
    change: [['if (role.permissions.includes(roleManage.key)) {', 'if (false) {']],
    tests: 'make a sub-role',
  },
  {
    file: 'rbac/manage',
    name: 'grants listed without the right to read them',
    change: [['  requirePermission(caller, grantRead.key);\n  const visible', '  const visible']],
    tests: 'a reviewer every role',
  },
  {
    file: 'rbac/invitations',
    name: 'an invitation outlives its inviter’s right',
    change: [
      [
        'if (role && !role.retired && appointingGrant(inviter, role, invitation.scope)) {',
        'if (role) {',
      ],
    ],
    tests: 'dies with the inviter',
  },
  {
    file: 'rbac/invitations',
    name: 'inviting oneself',
    change: [
      ["  if (me?.email === body.email) throw forbidden('Nobody invites themselves.');\n", ''],
    ],
    tests: 'inviting oneself',
  },
  {
    file: 'rbac/invitations',
    name: 'a code for an invitation that ran out',
    change: [
      [
        "      { email, app, status: 'pending', expiresAt: { $gt: now } },\n      { limit: 1 },",
        "      { email, app, status: 'pending' },\n      { limit: 1 },",
      ],
    ],
    tests: 'runs out',
  },
  {
    file: 'rbac/invitations',
    name: 'an accepted invitation stays pending',
    change: [["{ $set: { status: 'accepted', endedAt: now, endedBy: userId } }", '{ $set: {} }']],
    tests: 'accepts with an email code',
  },
  {
    file: 'otp',
    name: 'an invitation code for any email',
    change: [['? await hasInvitation(deps.mongo, { email, app })', '? true']],
    tests: 'accepts with an email code',
  },
  {
    file: 'otp',
    name: 'an invitation into a sign-up app without its consent',
    change: [
      ["const asksConsent = signUp || purpose === 'invite';", 'const asksConsent = signUp;'],
    ],
    tests: 'consent',
  },
];

export default mutations;
