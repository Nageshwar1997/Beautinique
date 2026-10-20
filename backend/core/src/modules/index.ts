import { Router } from 'express';

/**
 * Core's business modules (ARCHITECTURE §4), each in src/modules/<module>/ behind an index.ts facade.
 * A module mounts its router here. Modules use each other only through those facades, never models.
 */
export const router = Router();
