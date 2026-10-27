import { eventCatalogue } from '../events';
import { permissionCatalogue } from '../permissions';
import { routeTable } from '../routes';
import {
  consentProblems,
  IDENTITY_ERROR_CODES,
  OTP_APPS,
  OTP_PURPOSES,
  otpConsentZod,
  otpRequested,
  otpSealContext,
  requestOtp,
  resendOtp,
  SIGN_UP_APPS,
  verifyOtp,
} from './identity';
import { getPing, pingRead, pingRecorded, recordPing, wake } from './platform';

export {
  consentProblems,
  getPing,
  IDENTITY_ERROR_CODES,
  OTP_APPS,
  OTP_PURPOSES,
  otpConsentZod,
  otpRequested,
  otpSealContext,
  pingRead,
  pingRecorded,
  recordPing,
  requestOtp,
  resendOtp,
  SIGN_UP_APPS,
  verifyOtp,
  wake,
};

/**
 * Every route, event and permission of the platform. A module adds its own list here, and the
 * generated OpenAPI, gateway manifest and clients follow (ARCHITECTURE §5.1).
 */
export const routes = routeTable([recordPing, getPing, wake, requestOtp, resendOtp, verifyOtp]);
export const events = eventCatalogue([pingRecorded, otpRequested]);
export const permissions = permissionCatalogue([pingRead]);
