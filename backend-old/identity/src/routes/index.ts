import { AppError, mountRoute } from '@beautinique/backend-server-kit';
import { toObjectId } from '@beautinique/backend-server-mongo';
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
  finishSocialSignIn,
  finishSocialSignUp,
  getMe,
  getSocialSignUp,
  giveGrant,
  HEADERS,
  listGrants,
  listInvitations,
  listRoles,
  listSessions,
  listSocialProviders,
  loginRecovery,
  loginTotp,
  logout,
  newRecoveryCodes,
  OAUTH_SIGN_UP_SECONDS,
  OAUTH_STATE_SECONDS,
  oauthSignUpCookieName,
  oauthStateCookieName,
  passwordLogin,
  refreshCookieName,
  refreshSession,
  removeSignInMethod,
  requestInvitationCode,
  requestPasswordCode,
  requestSignUpCode,
  resendOtp,
  resetAuthenticator,
  revokeInvitation,
  SIGN_UP_APPS,
  SOCIAL_APPS,
  startSocialSignIn,
  startTotpEnroll,
  STEP_UP_SECONDS,
  stepUp,
  updateRole,
  verifyOtp,
} from '@beautinique/shared-contracts';
import { type Request, type Response, Router } from 'express';

import { type AuditCaller, auditRefusal } from '../audit.ts';
import * as authenticator from '../authenticator.ts';
import {
  clearSessionCookies,
  cookieOf,
  setAccessCookie,
  setOAuthCookie,
  setSessionCookies,
  signedIn,
} from '../cookies.ts';
import * as login from '../login.ts';
import { me, myDevices } from '../me.ts';
import * as oauth from '../oauth.ts';
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
 * Who is at the other end: the IP as the gateway saw it (clientIp(), ARCHITECTURE §7.2; only the
 * gateway reaches identity) and the browser's User-Agent. Evidence and My Devices, and the IP's
 * own sign-in lock and share of an email's codes (QA DR-003); never a grant or a sign-in by itself.
 */
const clientOf = (req: Request): Client => ({
  ip: req.get(HEADERS.clientIp) ?? 'unknown',
  userAgent: (req.get('user-agent') ?? '').slice(0, 512),
});

/** The caller of an audited route: their passport, the client and the request id (T4.1 PR C). */
const auditCallerOf = async (
  deps: OtpDeps,
  req: Request,
  requestId: string,
): Promise<AuditCaller> => ({
  ...(await deps.passport(req)),
  client: clientOf(req),
  requestId,
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
      ip: clientOf(req).ip,
    }),
  );

  mountRoute(router, requestPasswordCode, ({ body }, { req, requestId }) =>
    requestCode(deps, {
      app: appOf(req),
      email: body.email,
      purpose: 'password',
      requestId,
      ip: clientOf(req).ip,
    }),
  );

  mountRoute(router, resendOtp, ({ params }, { req, requestId }) =>
    resendCode(deps, {
      app: appOf(req),
      challengeId: params.challengeId,
      requestId,
      ip: clientOf(req).ip,
    }),
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
    login.startTotpEnroll(deps, {
      app: appOf(req),
      loginId: params.loginId,
      ip: clientOf(req).ip,
    }),
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
    const ended = await deps.sessions.end(
      toObjectId(passport.userId),
      toObjectId(params.sessionId, { field: 'sessionId' }),
    );
    // this device's own session: its cookies go too
    if (ended && params.sessionId === passport.sessionId) clearSessionCookies(res, passport.app);
    return { ended };
  });

  mountRoute(router, endOtherSessions, async (_input, { req }) => {
    const passport = await deps.passport(req);
    return {
      ended: await deps.sessions.endOthers(
        toObjectId(passport.userId),
        toObjectId(passport.sessionId),
      ),
    };
  });

  // roles, grants and invitations (TASKS T3.3): identity checks who may, from its own grants
  mountRoute(router, listRoles, async ({ query }, { req }) =>
    manage.listRoles(deps, await deps.passport(req), query),
  );

  // a staff action identity refuses (403) is kept in the audit log as denied (owner, 2026-11-15)
  mountRoute(router, createRole, async ({ body }, { req, requestId }) => {
    const caller = await auditCallerOf(deps, req, requestId);
    return auditRefusal(
      deps.mongo,
      deps.logger,
      {
        action: 'iam.roles.create',
        caller,
        resource: { type: 'role', id: `${body.app}.c_${body.slug}` },
        // what was asked, in short: a refused body is never checked, and an event stays small
        after: { name: body.name, permissionCount: body.permissions.length },
      },
      () => manage.createRole(deps, caller, body),
    );
  });

  mountRoute(router, updateRole, async ({ params, body }, { req, requestId }) => {
    const caller = await auditCallerOf(deps, req, requestId);
    return auditRefusal(
      deps.mongo,
      deps.logger,
      {
        action: 'iam.roles.update',
        caller,
        resource: { type: 'role', id: params.roleKey },
        after: { fields: Object.keys(body) },
      },
      () => manage.updateRole(deps, caller, params.roleKey, body),
    );
  });

  mountRoute(router, listGrants, async ({ query }, { req }) =>
    manage.listGrants(deps, await deps.passport(req), query),
  );

  mountRoute(router, giveGrant, async ({ body }, { req, requestId }) => {
    const caller = await auditCallerOf(deps, req, requestId);
    return auditRefusal(
      deps.mongo,
      deps.logger,
      {
        action: 'iam.grants.give',
        caller,
        resource: { type: 'user', id: body.userId },
        scope: body.scope,
        after: { role: body.role },
      },
      () => manage.giveGrant(deps, caller, body),
    );
  });

  mountRoute(router, endGrant, async ({ params }, { req, requestId }) => {
    const caller = await auditCallerOf(deps, req, requestId);
    return auditRefusal(
      deps.mongo,
      deps.logger,
      { action: 'iam.grants.end', caller, resource: { type: 'grant', id: params.grantId } },
      () => manage.endGrant(deps, caller, params.grantId),
    );
  });

  mountRoute(router, createInvitation, async ({ body }, { req, requestId }) => {
    const caller = await auditCallerOf(deps, req, requestId);
    return auditRefusal(
      deps.mongo,
      deps.logger,
      {
        action: 'iam.invitations.create',
        caller,
        resource: { type: 'invitation', id: null },
        scope: body.scope,
        after: { email: body.email, role: body.role },
      },
      () => invitations.createInvitation(deps, caller, body, requestId),
    );
  });

  mountRoute(router, listInvitations, async ({ query }, { req }) =>
    invitations.listInvitations(deps, await deps.passport(req), query),
  );

  mountRoute(router, revokeInvitation, async ({ params }, { req, requestId }) => {
    const caller = await auditCallerOf(deps, req, requestId);
    return auditRefusal(
      deps.mongo,
      deps.logger,
      {
        action: 'iam.invitations.revoke',
        caller,
        resource: { type: 'invitation', id: params.invitationId },
      },
      () => invitations.revokeInvitation(deps, caller, params.invitationId),
    );
  });

  mountRoute(router, requestInvitationCode, ({ body }, { req, requestId }) =>
    requestCode(deps, {
      app: appOf(req),
      email: body.email,
      purpose: 'invite',
      consent: body.consent,
      requestId,
      ip: clientOf(req).ip,
    }),
  );

  // step-up and the Security Officer (TASKS T3.3 PR C)
  mountRoute(router, stepUp, async ({ body }, { req, res }) => {
    const passport = await deps.passport(req);
    const stepped = await login.stepUpWithTotp(deps, {
      userId: toObjectId(passport.userId),
      sessionId: toObjectId(passport.sessionId),
      proof: body,
      ip: clientOf(req).ip,
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
    authenticator.confirmAuthenticator(deps, await deps.passport(req), {
      ...body,
      requestId,
      ip: clientOf(req).ip,
    }),
  );

  mountRoute(router, newRecoveryCodes, async (_input, { req, requestId }) =>
    authenticator.renewRecoveryCodes(deps, await deps.passport(req), requestId),
  );

  mountRoute(router, disableAuthenticator, async (_input, { req, requestId }) =>
    authenticator.disableAuthenticator(deps, await deps.passport(req), requestId),
  );

  mountRoute(router, resetAuthenticator, async ({ params }, { req, requestId }) => {
    const caller = await auditCallerOf(deps, req, requestId);
    return auditRefusal(
      deps.mongo,
      deps.logger,
      {
        action: 'iam.users.resetAuthenticator',
        caller,
        resource: { type: 'user', id: params.userId },
      },
      () => security.resetAuthenticator(deps, caller, params.userId, requestId),
    );
  });

  mountRoute(router, endUserSessions, async ({ params }, { req, requestId }) => {
    const caller = await auditCallerOf(deps, req, requestId);
    return auditRefusal(
      deps.mongo,
      deps.logger,
      { action: 'iam.users.endSessions', caller, resource: { type: 'user', id: params.userId } },
      () => security.endUserSessions(deps, caller, params.userId),
    );
  });

  // social sign-in, the customer app's (TASKS T3.1 PR 4)
  /** A page the browser opened: its cookies, then where it goes; never an error page. */
  const page = async (
    res: Response,
    app: AppId,
    work: () => Promise<oauth.PageAnswer>,
  ): Promise<{ location: string }> => {
    let answer: oauth.PageAnswer;
    try {
      answer = await work();
    } catch (error) {
      deps.logger.error({ err: error }, 'social sign-in failed');
      answer = oauth.backToSignIn('failed');
    }
    if (answer.state !== undefined) {
      setOAuthCookie(res, oauthStateCookieName(app), answer.state, OAUTH_STATE_SECONDS);
    }
    if (answer.signUp !== undefined) {
      setOAuthCookie(res, oauthSignUpCookieName(app), answer.signUp, OAUTH_SIGN_UP_SECONDS);
    }
    if (answer.session) setSessionCookies(res, answer.session);
    return { location: answer.location };
  };

  mountRoute(router, listSocialProviders, (_input, { req }) => {
    appOf(req, SOCIAL_APPS);
    return oauth.socialProviders(deps);
  });

  mountRoute(router, startSocialSignIn, ({ params, query }, { req, res }) => {
    const app = appOf(req, SOCIAL_APPS);
    return page(res, app, () =>
      oauth.startTrip(deps, { app, provider: params.provider, next: query.next }),
    );
  });

  mountRoute(router, finishSocialSignIn, ({ params, query }, { req, res, requestId }) => {
    const app = appOf(req, SOCIAL_APPS);
    return page(res, app, () =>
      oauth.finishTrip(deps, {
        app,
        provider: params.provider,
        code: query.code,
        state: query.state,
        error: query.error,
        cookie: cookieOf(req, oauthStateCookieName(app)),
        client: clientOf(req),
        requestId,
      }),
    );
  });

  mountRoute(router, getSocialSignUp, (_input, { req }) => {
    const app = appOf(req, SOCIAL_APPS);
    return oauth.waitingSignUp(deps, { app, ticket: cookieOf(req, oauthSignUpCookieName(app)) });
  });

  mountRoute(router, finishSocialSignUp, async ({ body }, { req, res, requestId }) => {
    const app = appOf(req, SOCIAL_APPS);
    const done = await oauth.finishSignUp(deps, {
      app,
      ticket: cookieOf(req, oauthSignUpCookieName(app)),
      consent: body.consent,
      ip: clientOf(req).ip,
      client: clientOf(req),
      requestId,
    });
    setOAuthCookie(res, oauthSignUpCookieName(app), null, 0);
    return signedIn(res, done);
  });

  mountRoute(router, removeSignInMethod, async ({ params }, { req, requestId }) =>
    oauth.removeMethod(deps, await deps.passport(req), {
      provider: params.provider,
      client: clientOf(req),
      requestId,
    }),
  );

  return router;
}
