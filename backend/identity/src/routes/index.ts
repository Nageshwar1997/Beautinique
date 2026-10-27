import { AppError, mountRoute } from '@beautinique/backend-server-kit';
import { HEADERS, OTP_APPS, requestOtp, resendOtp, verifyOtp } from '@beautinique/shared-contracts';
import { type Request, Router } from 'express';

import { type OtpDeps, requestCode, resendCode, verifyCode } from '../otp.ts';

/**
 * The app a request comes from. The gateway let it through only from that app's own host and for
 * a route that app may use (ARCHITECTURE §7.2); identity is reachable only behind the gateway.
 */
function appOf(req: Request): (typeof OTP_APPS)[number] {
  const app = req.get(HEADERS.app);
  if (!(OTP_APPS as readonly (string | undefined)[]).includes(app)) {
    throw new AppError('APP_NOT_ALLOWED', 'This app cannot sign in with an email code.');
  }
  return app as (typeof OTP_APPS)[number];
}

/** The client's IP as the gateway saw it (clientIp(), ARCHITECTURE §7.2): legal evidence only. */
const ipOf = (req: Request): string => req.get(HEADERS.clientIp) ?? 'unknown';

/**
 * identity's routes. Each one implements a route from @beautinique/shared-contracts with owner
 * 'identity', at the same path: the gateway forwards /api/v1<path> here as <path>.
 */
export function routesOf(otp: OtpDeps): Router {
  const router = Router();

  mountRoute(router, requestOtp, ({ body }, { req, requestId }) =>
    requestCode(otp, { app: appOf(req), email: body.email, consent: body.consent, requestId }),
  );

  mountRoute(router, resendOtp, ({ params }, { req, requestId }) =>
    resendCode(otp, { app: appOf(req), challengeId: params.challengeId, requestId }),
  );

  mountRoute(router, verifyOtp, ({ params, body }, { req }) =>
    verifyCode(otp, {
      app: appOf(req),
      challengeId: params.challengeId,
      code: body.code,
      ip: ipOf(req),
    }),
  );

  return router;
}
