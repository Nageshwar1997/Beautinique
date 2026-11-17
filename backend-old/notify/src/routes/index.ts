import { Router } from 'express';

/**
 * notify's routes. Each one implements a route from @beautinique/shared-contracts with owner
 * 'notify', at the same path: the gateway forwards /api/v1<path> here as <path>.
 */
export const router = Router();
