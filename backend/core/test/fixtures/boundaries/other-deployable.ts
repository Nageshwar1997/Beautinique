// Core reaching into another deployable's code: the boundary rule must stop it.
import type { otpExpired } from '../../../../identity/src/errors.ts';

export type Reached = typeof otpExpired;
