import { AppError, mountRoute } from '@beautinique/backend-server-kit';
import {
  type AppId,
  APPS,
  confirmTotpEnroll,
  HEADERS,
  loginRecovery,
  loginTotp,
  passwordLogin,
  requestPasswordCode,
  requestSignUpCode,
  resendOtp,
  SIGN_UP_APPS,
  startTotpEnroll,
  verifyOtp,
} from '@beautinique/shared-contracts';
import { type Request, Router } from 'express';

import * as login from '../login.ts';
import { type OtpDeps, requestCode, resendCode, verifyCode } from '../otp.ts';

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

/** The client's IP as the gateway saw it (clientIp(), ARCHITECTURE §7.2): legal evidence only. */
const ipOf = (req: Request): string => req.get(HEADERS.clientIp) ?? 'unknown';

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

  mountRoute(router, verifyOtp, ({ params, body }, { req }) =>
    verifyCode(deps, {
      app: appOf(req),
      challengeId: params.challengeId,
      code: body.code,
      password: body.password,
      ip: ipOf(req),
    }),
  );

  mountRoute(router, passwordLogin, ({ body }, { req }) =>
    login.passwordLogin(deps, { app: appOf(req), email: body.email, password: body.password }),
  );

  mountRoute(router, loginTotp, ({ params, body }, { req }) =>
    login.loginWithTotp(deps, { app: appOf(req), loginId: params.loginId, code: body.code }),
  );

  mountRoute(router, loginRecovery, ({ params, body }, { req }) =>
    login.loginWithRecoveryCode(deps, {
      app: appOf(req),
      loginId: params.loginId,
      code: body.code,
    }),
  );

  mountRoute(router, startTotpEnroll, ({ params }, { req }) =>
    login.startTotpEnroll(deps, { app: appOf(req), loginId: params.loginId }),
  );

  mountRoute(router, confirmTotpEnroll, ({ params, body }, { req }) =>
    login.confirmTotpEnroll(deps, { app: appOf(req), loginId: params.loginId, code: body.code }),
  );

  return router;
}
