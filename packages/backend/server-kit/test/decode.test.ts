import { array, boolean, date, number, strictObject, string } from 'zod';
import { describe, expect, it } from 'vitest';

import { decodeJson, decodeText, MAX_ISSUES } from '../src/decode.ts';

const query = strictObject(
  {
    limit: number('limit must be a number.').int('limit must be a whole number.').optional(),
    cursor: string('cursor must be text.').optional(),
    open: boolean('open must be true or false.').optional(),
    since: date('since must be a date.').optional(),
    ids: array(number('ids must be numbers.'), 'ids must be a list.').optional(),
  },
  'The query takes only limit, cursor, open, since, ids.',
);

describe('decodeText: the path and the query come as text (SR-036)', () => {
  it('SR-036: a number, a boolean and a date are read from their text, as the client writes them', () => {
    const decoded = decodeText(query, 'query', {
      limit: '20',
      open: 'true',
      since: '2026-11-26T10:00:00.000Z',
      cursor: '42',
    });

    expect(decoded).toEqual({
      ok: true,
      value: { limit: 20, open: true, since: new Date('2026-11-26T10:00:00.000Z'), cursor: '42' },
    });
  });

  it('SR-036: a field that wants text stays text, even when it looks like a number', () => {
    expect(decodeText(query, 'query', { cursor: '007' })).toEqual({
      ok: true,
      value: { cursor: '007' },
    });
  });

  it('SR-036: a list of one comes as one value, and is read as a list, and its item as a number', () => {
    expect(decodeText(query, 'query', { ids: '7' })).toEqual({ ok: true, value: { ids: [7] } });
    expect(decodeText(query, 'query', { ids: 'x' }).ok).toBe(false);
  });

  it('SR-036: the items of a list are read one by one', () => {
    expect(decodeText(query, 'query', { ids: ['1', '2.5', '-3'] })).toEqual({
      ok: true,
      value: { ids: [1, 2.5, -3] },
    });
  });

  it('SR-036: a value that does not read stays refused, with the message of the schema and the place of the field', () => {
    const decoded = decodeText(query, 'query', {
      limit: 'abc',
      open: 'yes',
      since: 'tomorrow',
      ids: ['1', 'x'],
    });

    expect(decoded).toEqual({
      ok: false,
      issues: [
        { path: 'query.limit', message: 'limit must be a number.' },
        { path: 'query.open', message: 'open must be true or false.' },
        { path: 'query.since', message: 'since must be a date.' },
        { path: 'query.ids.1', message: 'ids must be numbers.' },
      ],
    });
  });

  it('SR-036: a number that reads is still checked by the rest of the schema', () => {
    const decoded = decodeText(query, 'query', { limit: '2.5' });

    expect(decoded).toEqual({
      ok: false,
      issues: [{ path: 'query.limit', message: 'limit must be a whole number.' }],
    });
  });

  it('SR-036: a field that the schema does not name is refused, by the message of the schema', () => {
    expect(decodeText(query, 'query', { limit: '1', sort: 'asc' })).toEqual({
      ok: false,
      issues: [{ path: 'query', message: 'The query takes only limit, cursor, open, since, ids.' }],
    });
    expect(decodeText(query, 'query', { sort: 'asc' }).ok).toBe(false);
  });

  it('SR-036: a number is only digits (not 1e3, not spaces, not hex)', () => {
    for (const text of ['1e3', ' 5', '5 ', '0x10', '', '+5', '1,5', 'Infinity', 'NaN']) {
      expect(decodeText(query, 'query', { limit: text }).ok, text).toBe(false);
    }
  });

  it('SR-007: a long list of bad items is read in one pass, and the answer is short', () => {
    const items = Array.from({ length: 100_000 }, (_, index) => (index % 2 === 0 ? '1' : 'x'));
    const decoded = decodeText(query, 'query', { ids: items });

    expect(decoded.ok).toBe(false);
    if (!decoded.ok) expect(decoded.issues).toHaveLength(MAX_ISSUES);
    const good = decodeText(query, 'query', { ids: Array.from({ length: 100_000 }, () => '7') });
    expect(good.ok).toBe(true);
  });

  it('CR-22: the value that was refused is never in the answer', () => {
    const decoded = decodeText(query, 'query', { limit: 'secret-value-123' });

    expect(JSON.stringify(decoded)).not.toContain('secret-value-123');
  });
});

describe('decodeJson: the body', () => {
  const body = strictObject(
    { addressId: string('addressId is required.'), quantity: number('quantity must be a number.') },
    'The body takes only addressId, quantity.',
  );

  it('SR-036: a body that fits the schema is its value', () => {
    expect(decodeJson(body, { addressId: 'a1', quantity: 2 })).toEqual({
      ok: true,
      value: { addressId: 'a1', quantity: 2 },
    });
  });

  it('SR-036: an unknown field, a missing field and no body are refused, with the place of the field', () => {
    expect(decodeJson(body, { addressId: 'a1', quantity: 2, role: 'admin' })).toEqual({
      ok: false,
      issues: [{ path: 'body', message: 'The body takes only addressId, quantity.' }],
    });
    expect(decodeJson(body, { addressId: 'a1' })).toEqual({
      ok: false,
      issues: [{ path: 'body.quantity', message: 'quantity must be a number.' }],
    });
    expect(decodeJson(body, undefined)).toEqual({
      ok: false,
      issues: [{ path: 'body', message: 'The body takes only addressId, quantity.' }],
    });
    // A number does not come from a text in a body: JSON has numbers.
    expect(decodeJson(body, { addressId: 'a1', quantity: '2' }).ok).toBe(false);
  });
});
