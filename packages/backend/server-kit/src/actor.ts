import { APPS, SCOPE_TYPES } from '@beautinique/shared-contracts';
import { array, boolean, enum as enumOf, number, strictObject, string, type output } from 'zod';

/**
 * Where a grant reaches: a type (`self`, `seller`, an area level, `national`, `global`) and, for
 * `seller` and the area levels below `national`, the id (the seller, the state, the district...).
 */
export const scopeSchema = strictObject(
  {
    type: enumOf(SCOPE_TYPES, 'type must be a scope type.'),
    id: string('id must be text.').min(1, 'id must not be empty.').optional(),
  },
  'A scope is { type, id } and nothing else.',
);

export type Scope = output<typeof scopeSchema>;

/** One permission that an account was given, for one scope, for a time (docs/ARCHITECTURE.md §11 rule 3). */
export const grantSchema = strictObject(
  {
    /** `<service>.<resource>.<action>`. */
    permission: string('permission is required.').min(1, 'permission is required.'),
    scope: scopeSchema,
    /** UTC milliseconds. A grant that has not begun is not in force. */
    validFrom: number('validFrom must be a number.').optional(),
    /** UTC milliseconds. A grant has an end (SR-037): it is not in force at this moment or later. */
    validUntil: number('validUntil must be a number.').optional(),
  },
  'A grant is { permission, scope, validFrom, validUntil } and nothing else.',
);

export type Grant = output<typeof grantSchema>;

/**
 * Who is asking, as the gateway (or the facade call) gives it: the account, the app of the token
 * (`aud`, SR-031) and what the account may do. Plain data, so it can be kept as JSON (SR-029) and
 * sent in a signed call.
 */
export const actorSchema = strictObject(
  {
    accountId: string('accountId is required.').min(1, 'accountId is required.'),
    app: enumOf(APPS, 'app must be one of the apps.'),
    /** The account has an authenticator set up. */
    authenticator: boolean('authenticator must be true or false.'),
    /** UTC milliseconds until which the last authenticator code counts as fresh (D-185). */
    stepUpUntil: number('stepUpUntil must be a number.').optional(),
    grants: array(grantSchema, 'grants must be a list.'),
  },
  'An actor is { accountId, app, authenticator, stepUpUntil, grants } and nothing else.',
);

export type Actor = output<typeof actorSchema>;

/** The place of a thing in the areas, from the smallest to the largest. A level that is not known is left out. */
export interface Area {
  state?: string;
  district?: string;
  subDistrict?: string;
  hub?: string;
  warehouse?: string;
}

/** What a request is about, as the handler knows it from its own database: who owns it and where it is. */
export interface Resource {
  /** The account that owns it (for the `self` scope). */
  ownerId?: string;
  sellerId?: string;
  area?: Area;
}
