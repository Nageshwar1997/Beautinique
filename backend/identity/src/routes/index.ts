import { AppError, mountRoute } from '@beautinique/backend-server-kit';
import {
  type AppId,
  APPS,
  confirmAuthenticator,
  confirmTotpEnroll,
  createInvitation,
  createRole,
  disableAuthenticator,
  endGrant,
  endOtherSessions,
  endSession,
  endUserSessions,
  enrollAuthenticator,
  getMe,
  giveGrant,
  HEADERS,
  listGrants,
  listInvitations,
  listRoles,
  listSessions,
  loginRecovery,
  loginTotp,
  logout,
  newRecoveryCodes,
  passwordLogin,
  refreshCookieName,
  refreshSession,
  requestInvitationCode,
  requestPasswordCode,
  requestSignUpCode,
  resendOtp,
  resetAuthenticator,
  revokeInvitation,
  SIGN_UP_APPS,
  startTotpEnroll,
  STEP_UP_SECONDS,
  stepUp,
  updateRole,
  verifyOtp,
} from '@beautinique/shared-contracts';
import { type Request, Router } from 'express';

import * as authenticator from '../authenticator.ts';
import {
  clearSessionCookies,
  cookieOf,
  setAccessCookie,
  setSessionCookies,
  signedIn,
} from '../cookies.ts';
import * as login from '../login.ts';
import { me, myDevices } from '../me.ts';
import { type OtpDeps, requestCode, resendCode, verifyCode } from '../otp.ts';
import * as invitations from '../rbac/invitations.ts';
import * as manage from '../rbac/manage.ts';
import * as security from '../rbac/security.ts';
import type { Client } from '../sessions.ts';

/**
 * The app a request comes from, one of `allowed`. The gateway let it through only from that app's
 * own host and for a route that app may use (ARCHITECTURE §7.2); identity is reachable only behind
 * the gateway, and checks again.
 */
function appOf(req: Request, allowed: readonly AppId[] = APPS): AppId {
  const app = req.get(HEADERS.app);
  if (!(allowed as readonly (string | undefined)[]).includes(app)) {
    throw new AppError('APP_NOT_ALLOWED', 'This app cannot do this.');
  }
  return app as AppId;
}

/**
 * Who is at the other end: the IP as the gateway saw it (clientIp(), ARCHITECTURE §7.2) and the
 * browser's User-Agent. Evidence and My Devices only, never a check.
 */
const clientOf = (req: Request): Client => ({
  ip: req.get(HEADERS.clientIp) ?? 'unknown',
  userAgent: (req.get('user-agent') ?? '').slice(0, 512),
});

/**
 * identity's routes. Each one implements a route from @beautinique/shared-contracts with owner
 * 'identity', at the same path: the gateway forwards /api/v1<path> here as <path>.
 */
export function routesOf(deps: OtpDeps): Router {
  const router = Router();

  mountRoute(router, requestSignUpCode, ({ body }, { req, requestId }) =>
    requestCode(deps, {
      app: appOf(req, SIGN_UP_APPS),
      email: body.email,
      purpose: 'sign-up',
      consent: body.consent,
      requestId,
    }),
  );

  mountRoute(router, requestPasswordCode, ({ body }, { req, requestId }) =>
    requestCode(deps, { app: appOf(req), email: body.email, purpose: 'password', requestId }),
  );

  mountRoute(router, resendOtp, ({ params }, { req, requestId }) =>
    resendCode(deps, { app: appOf(req), challengeId: params.challengeId, requestId }),
  );

  mountRoute(router, verifyOtp, async ({ params, body }, { req, res }) =>
    signedIn(
      res,
      await verifyCode(deps, {
        app: appOf(req),
        challengeId: params.challengeId,
        code: body.code,
        password: body.password,
        client: clientOf(req),
      }),
    ),
  );

  mountRoute(router, passwordLogin, async ({ body }, { req, res }) =>
    signedIn(
      res,
      await login.passwordLogin(deps, {
        app: appOf(req),
        email: body.email,
        password: body.password,
        client: clientOf(req),
      }),
    ),
  );

  mountRoute(router, loginTotp, async ({ params, body }, { req, res }) =>
    signedIn(
      res,
      await login.loginWithTotp(deps, {
        app: appOf(req),
        loginId: params.loginId,
        code: body.code,
        client: clientOf(req),
      }),
    ),
  );

  mountRoute(router, loginRecovery, async ({ params, body }, { req, res }) =>
    signedIn(
      res,
      await login.loginWithRecoveryCode(deps, {
        app: appOf(req),
        loginId: params.loginId,
        code: body.code,
        client: clientOf(req),
      }),
    ),
  );

  mountRoute(router, startTotpEnroll, ({ params }, { req }) =>
    login.startTotpEnroll(deps, { app: appOf(req), loginId: params.loginId }),
  );

  mountRoute(router, confirmTotpEnroll, async ({ params, body }, { req, res }) =>
    signedIn(
      res,
      await login.confirmTotpEnroll(deps, {
        app: appOf(req),
        loginId: params.loginId,
        code: body.code,
        client: clientOf(req),
      }),
    ),
  );

  mountRoute(router, refreshSession, async (_input, { req, res }) => {
    const app = appOf(req);
    try {
      const session = await deps.sessions.refresh({
        app,
        refreshToken: cookieOf(req, refreshCookieName(app)),
        client: clientOf(req),
      });
      setSessionCookies(res, session);
      return {
        user: session.user,
        sessionId: session.sessionId,
        expiresAt: session.expiresAt.toISOString(),
      };
    } catch (error) {
      // an ended session clears its cookies; a parallel refresh keeps the new ones
      if (error instanceof AppError && error.code === 'SESSION_EXPIRED') {
        clearSessionCookies(res, app);
      }
      throw error;
    }
  });

  mountRoute(router, logout, async (_input, { req, res }) => {
    const app = appOf(req);
    await deps.sessions.logout({ app, refreshToken: cookieOf(req, refreshCookieName(app)) });
    clearSessionCookies(res, app);
    return { signedOut: true as const };
  });

  // signed in: the gateway checked the access cookie and vouches with a passport
  mountRoute(router, getMe, async (_input, { req }) => me(deps, await deps.passport(req)));

  mountRoute(router, listSessions, async (_input, { req }) =>
    myDevices(deps, await deps.passport(req)),
  );

  mountRoute(router, endSession, async ({ params }, { req, res }) => {
    const passport = await deps.passport(req);
    const ended = await deps.sessions.end(passport.userId, params.sessionId);
    // this device's own session: its cookies go too
    if (ended && params.sessionId === passport.sessionId) clearSessionCookies(res, passport.app);
    return { ended };
  });

  mountRoute(router, endOtherSessions, async (_input, { req }) => {
    const passport = await deps.passport(req);
    return { ended: await deps.sessions.endOthers(passport.userId, passport.sessionId) };
  });

  // roles, grants and invitations (TASKS T3.3): identity checks who may, from its own grants
  mountRoute(router, listRoles, async ({ query }, { req }) =>
    manage.listRoles(deps, await deps.passport(req), query),
  );

  mountRoute(router, createRole, async ({ body }, { req }) =>
    manage.createRole(deps, await deps.passport(req), body),
  );

  mountRoute(router, updateRole, async ({ params, body }, { req }) =>
    manage.updateRole(deps, await deps.passport(req), params.roleKey, body),
  );

  mountRoute(router, listGrants, async ({ query }, { req }) =>
    manage.listGrants(deps, await deps.passport(req), query),
  );

  mountRoute(router, giveGrant, async ({ body }, { req }) =>
    manage.giveGrant(deps, await deps.passport(req), body),
  );

  mountRoute(router, endGrant, async ({ params }, { req }) =>
    manage.endGrant(deps, await deps.passport(req), params.grantId),
  );

  mountRoute(router, createInvitation, async ({ body }, { req, requestId }) =>
    invitations.createInvitation(deps, await deps.passport(req), body, requestId),
  );

  mountRoute(router, listInvitations, async ({ query }, { req }) =>
    invitations.listInvitations(deps, await deps.passport(req), query),
  );

  mountRoute(router, revokeInvitation, async ({ params }, { req }) =>
    invitations.revokeInvitation(deps, await deps.passport(req), params.invitationId),
  );

  mountRoute(router, requestInvitationCode, ({ body }, { req, requestId }) =>
    requestCode(deps, {
      app: appOf(req),
      email: body.email,
      purpose: 'invite',
      consent: body.consent,
      requestId,
    }),
  );

  // step-up and the Security Officer (TASKS T3.3 PR C)
  mountRoute(router, stepUp, async ({ body }, { req, res }) => {
    const passport = await deps.passport(req);
    const stepped = await login.stepUpWithTotp(deps, {
      userId: passport.userId,
      sessionId: passport.sessionId,
      proof: body,
    });
    setAccessCookie(res, stepped.app, stepped.accessToken);
    return {
      stepUpUntil: new Date(stepped.stepUpAt.getTime() + STEP_UP_SECONDS * 1000).toISOString(),
      recoveryCodesLeft: stepped.recoveryCodesLeft,
    };
  });

  // the authenticator from the account's own settings (ARCHITECTURE §9.2)
  mountRoute(router, enrollAuthenticator, async (_input, { req }) =>
    authenticator.enrollAuthenticator(deps, await deps.passport(req)),
  );

  mountRoute(router, confirmAuthenticator, async ({ body }, { req, requestId }) =>
    authenticator.confirmAuthenticator(deps, await deps.passport(req), { ...body, requestId }),
  );

  mountRoute(router, newRecoveryCodes, async (_input, { req, requestId }) =>
    authenticator.renewRecoveryCodes(deps, await deps.passport(req), requestId),
  );

  mountRoute(router, disableAuthenticator, async (_input, { req, requestId }) =>
    authenticator.disableAuthenticator(deps, await deps.passport(req), requestId),
  );

  mountRoute(router, resetAuthenticator, async ({ params }, { req, requestId }) =>
    security.resetAuthenticator(deps, await deps.passport(req), params.userId, requestId),
  );

  mountRoute(router, endUserSessions, async ({ params }, { req }) =>
    security.endUserSessions(deps, await deps.passport(req), params.userId),
  );

  return router;
}
