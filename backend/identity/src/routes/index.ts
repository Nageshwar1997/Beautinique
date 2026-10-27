import { AppError, mountRoute } from '@beautinique/backend-server-kit';
import {
  type AppId,
  APPS,
  confirmTotpEnroll,
  HEADERS,
  loginRecovery,
  loginTotp,
  logout,
  passwordLogin,
  refreshCookieName,
  refreshSession,
  requestPasswordCode,
  requestSignUpCode,
  resendOtp,
  SIGN_UP_APPS,
  startTotpEnroll,
  verifyOtp,
} from '@beautinique/shared-contracts';
import { type Request, Router } from 'express';

import { clearSessionCookies, cookieOf, setSessionCookies, signedIn } from '../cookies.ts';
import * as login from '../login.ts';
import { type OtpDeps, requestCode, resendCode, verifyCode } from '../otp.ts';
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

  return router;
}
