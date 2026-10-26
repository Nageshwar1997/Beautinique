import { gatewayManifest, routes } from '@beautinique/shared-contracts';

/**
 * Every platform route the gateway serves: the route table of @beautinique/shared-contracts
 * (`src/catalogue`). A module's new route is there, so the gateway knows it after a build.
 */
export const manifest = gatewayManifest(routes);
