// Allowed: another module through its index.ts.
import { thing } from '../alpha/index.ts';

export const fromFacade = thing;
