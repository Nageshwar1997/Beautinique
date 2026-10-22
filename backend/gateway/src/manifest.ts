import { gatewayManifest, type RouteDefinition } from '@beautinique/shared-contracts';

/**
 * Every platform route the gateway serves. The route table lives in @beautinique/shared-contracts
 * (TASKS T1.5); until it is there this list is empty and every /api/v1 path answers NOT_FOUND.
 */
const routes: readonly RouteDefinition[] = [];

export const manifest = gatewayManifest(routes);
