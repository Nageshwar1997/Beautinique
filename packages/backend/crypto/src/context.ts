// Where a protected value belongs: the associated data of field encryption, and the context of a
// blind index, a code hash and a sealed copy (docs/ARCHITECTURE.md §10.3 rules 4 to 7).
//
// The parts are checked so that two different places never give the same text: the service and
// the collection have no `.`, the field may have `.` (a nested field, `kyc.pan`) but no `:`, and a
// record id has neither. So `<service>.<collection>.<field>:<recordId>` splits back one way only.

/** A service: small letters and digits, like the config's namespace (`identity`). */
const SERVICE = /^[a-z][a-z0-9]{0,31}$/;
/** A collection, as `@beautinique/backend-mongo` names one (`seller_profiles`). */
const COLLECTION = /^[a-z][a-z0-9_]{0,63}$/;
/** A field, or a path of fields joined by `.` (`kyc.pan`). */
const FIELD = /^[A-Za-z][A-Za-z0-9_]{0,63}(?:\.[A-Za-z][A-Za-z0-9_]{0,63}){0,7}$/;
/** A record id: an ObjectId's hex, a UUID, a number or a code (`6747...`, `INV-2026-1`). */
const RECORD_ID = /^[A-Za-z0-9_-]{1,128}$/;

export interface FieldPlace {
  collection: string;
  field: string;
  recordId: string;
}

export interface IndexPlace {
  collection: string;
  field: string;
}

export interface RecordPlace {
  collection: string;
  recordId: string;
}

function check(value: unknown, format: RegExp, what: string): string {
  if (typeof value !== 'string' || !format.test(value)) throw new RangeError(what);
  return value;
}

export function checkService(service: unknown): string {
  return check(
    service,
    SERVICE,
    'The service is small letters and digits, starting with a letter, up to 32.',
  );
}

function checkCollection(collection: unknown): string {
  return check(
    collection,
    COLLECTION,
    'The collection is small letters, digits and _, starting with a letter, up to 64.',
  );
}

function checkField(field: unknown): string {
  return check(
    field,
    FIELD,
    'The field is letters, digits and _, starting with a letter, with . between nested fields.',
  );
}

function checkRecordId(recordId: unknown): string {
  return check(recordId, RECORD_ID, 'The record id is letters, digits, _ and -, up to 128.');
}

/** `<service>.<collection>.<field>`: where a value lives, for messages and blind indexes. */
export function fieldPath(service: string, place: IndexPlace): string {
  return `${service}.${checkCollection(place.collection)}.${checkField(place.field)}`;
}

/** `<service>.<collection>.<field>:<recordId>`: the associated data of an encrypted field (SR-063). */
export function fieldContext(service: string, place: FieldPlace): string {
  return `${fieldPath(service, place)}:${checkRecordId(place.recordId)}`;
}

/** `<service>.<collection>:<recordId>`: the record a sealed copy is of. */
export function recordContext(service: string, place: RecordPlace): string {
  return `${service}.${checkCollection(place.collection)}:${checkRecordId(place.recordId)}`;
}

/** `<service>.<purpose>:<ref>`: what a code is for, like `identity.otp:<challengeId>`. */
export function codeContext(service: string, purpose: unknown, ref: unknown): string {
  const what = check(
    purpose,
    COLLECTION,
    'The purpose of a code is small letters, digits and _, starting with a letter, up to 64.',
  );
  const of = check(ref, RECORD_ID, 'The ref of a code is letters, digits, _ and -, up to 128.');
  return `${service}.${what}:${of}`;
}
