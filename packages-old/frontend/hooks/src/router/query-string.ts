export type StringRecord = Record<string, string>;

/** What an update asks for: a value per param; `''`, `null` and `undefined` leave the param out. */
export type ParamsInput = Record<string, string | null | undefined>;

export type ParamsUpdate = ParamsInput | ((prevParams: StringRecord) => ParamsInput);

/** `''`, `null` and `undefined` mean "no value": such a param is left out of the URL. */
const isBlank = (value: string | null | undefined): value is '' | null | undefined =>
  value === null || value === undefined || value === '';

/** Reads a query string (with or without the leading `?`) into an object; a repeated key keeps its last value. */
export const parseParams = (search: string): StringRecord => {
  const params: StringRecord = {};

  for (const [key, value] of new URLSearchParams(search).entries()) {
    params[key] = value;
  }

  return params;
};

/** The query string, normalised the way `buildSearch` writes it (no leading `?`). */
export const normalizeSearch = (search: string): string => new URLSearchParams(search).toString();

/**
 * Works out the next query string (no leading `?`) after applying `update` to `currentSearch`.
 *
 * - Blank values (`''`, `null`, `undefined`) are left out.
 * - A param the update does not touch keeps **all** its non-blank values (`?tag=a&tag=b` stays as
 *   is, and so does `?tag=a&tag=` as `?tag=a`), and its position in the URL. For an object update,
 *   "touch" means the key is in the object; for an updater function it means the returned value
 *   differs from the one the function was given.
 * - A param that is set gets exactly one value.
 * - Order: with an object update the URL's own order, then the keys the update adds. With an updater
 *   function the order of the object it returns (a JavaScript object puts keys like `"2"` first).
 */
export const buildSearch = (currentSearch: string, update: ParamsUpdate): string => {
  const original = new URLSearchParams(currentSearch);
  const current = parseParams(currentSearch);

  // `explicit` is the object the caller passed (null for an updater function).
  let explicit: ParamsInput | null = null;
  let wanted: ParamsInput;

  if (typeof update === 'function') {
    wanted = update(current);
  } else {
    explicit = update;
    wanted = { ...current, ...update };
  }

  // An object has no reliable order for keys that look like numbers, so for an object update the
  // order comes from the URL itself (and then the keys the update adds), not from `wanted`.
  const keys = explicit
    ? [...new Set([...original.keys(), ...Object.keys(explicit)])]
    : Object.keys(wanted);

  const next = new URLSearchParams();

  for (const key of keys) {
    const untouched = explicit
      ? !Object.hasOwn(explicit, key)
      : Object.hasOwn(wanted, key) && wanted[key] === current[key];

    if (untouched) {
      // Decided from what the URL has, not from `wanted`: for `?tag=a&tag=` the last value (what
      // `current` holds) is blank, but `a` is still there to keep.
      for (const originalValue of original.getAll(key)) {
        if (originalValue !== '') next.append(key, originalValue);
      }

      continue;
    }

    const value = wanted[key];

    if (!isBlank(value)) next.set(key, value);
  }

  return next.toString();
};
