// Not allowed: another module's inside (the boundary test expects this one to be caught).
import { thing } from '../alpha/domain/thing.ts';

export const reachesIn = thing;
