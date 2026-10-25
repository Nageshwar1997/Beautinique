import { eventCatalogue } from '../events';
import { permissionCatalogue } from '../permissions';
import { routeTable } from '../routes';
import { getPing, pingRead, pingRecorded, recordPing } from './platform';

export { getPing, pingRead, pingRecorded, recordPing };

/**
 * Every route, event and permission of the platform. A module adds its own list here, and the
 * generated OpenAPI, gateway manifest and clients follow (ARCHITECTURE §5.1).
 */
export const routes = routeTable([recordPing, getPing]);
export const events = eventCatalogue([pingRecorded]);
export const permissions = permissionCatalogue([pingRead]);
