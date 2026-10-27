import { eventCatalogue } from '../events';
import { permissionCatalogue } from '../permissions';
import { routeTable } from '../routes';
import { OTP_PURPOSES, otpRequested, otpSealContext } from './identity';
import { getPing, pingRead, pingRecorded, recordPing, wake } from './platform';

export {
  getPing,
  OTP_PURPOSES,
  otpRequested,
  otpSealContext,
  pingRead,
  pingRecorded,
  recordPing,
  wake,
};

/**
 * Every route, event and permission of the platform. A module adds its own list here, and the
 * generated OpenAPI, gateway manifest and clients follow (ARCHITECTURE §5.1).
 */
export const routes = routeTable([recordPing, getPing, wake]);
export const events = eventCatalogue([pingRecorded, otpRequested]);
export const permissions = permissionCatalogue([pingRead]);
