import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  checkService,
  codeContext,
  fieldContext,
  fieldPath,
  recordContext,
} from '../src/context.ts';

const service = fc.stringMatching(/^[a-z][a-z0-9]{0,7}$/);
const collection = fc.stringMatching(/^[a-z][a-z0-9_]{0,7}$/);
const field = fc.stringMatching(/^[A-Za-z][A-Za-z0-9_]{0,5}(\.[A-Za-z][A-Za-z0-9_]{0,5}){0,2}$/);
const recordId = fc.stringMatching(/^[A-Za-z0-9_-]{1,8}$/);

describe('where a protected value belongs (docs/ARCHITECTURE.md §10.3 rule 5)', () => {
  it('SR-063: the associated data is <service>.<collection>.<field>:<recordId>', () => {
    const place = {
      collection: 'seller_profiles',
      field: 'kyc.pan',
      recordId: '6747a1b2c3d4e5f601234567',
    };
    expect(fieldContext('catalog', place)).toBe(
      'catalog.seller_profiles.kyc.pan:6747a1b2c3d4e5f601234567',
    );
    expect(fieldPath('catalog', place)).toBe('catalog.seller_profiles.kyc.pan');
    expect(recordContext('identity', { collection: 'users', recordId: 'u-1' })).toBe(
      'identity.users:u-1',
    );
    expect(codeContext('identity', 'otp', 'c_1')).toBe('identity.otp:c_1');
  });

  it('AC-PLATFORM-10: two different places never give the same associated data (property)', () => {
    const place = fc.record({ service, collection, field, recordId });
    fc.assert(
      fc.property(place, place, (a, b) => {
        const same =
          a.service === b.service &&
          a.collection === b.collection &&
          a.field === b.field &&
          a.recordId === b.recordId;
        fc.pre(!same);
        expect(fieldContext(a.service, a)).not.toBe(fieldContext(b.service, b));
      }),
      { numRuns: 2000 },
    );
  });

  it('AC-PLATFORM-10: a part that could make two places look alike is refused', () => {
    const at = (collectionName: string, fieldName: string, id: string) => () =>
      fieldContext('commerce', { collection: collectionName, field: fieldName, recordId: id });

    // Without these rules, `a` + `b.c` and `a.b` + `c` would be the same text.
    expect(at('a.b', 'c', '1')).toThrow(
      new RangeError(
        'The collection is small letters, digits and _, starting with a letter, up to 64.',
      ),
    );
    expect(at('a', 'b:c', '1')).toThrow(
      new RangeError(
        'The field is letters, digits and _, starting with a letter, with . between nested fields.',
      ),
    );
    for (const id of ['1:2', '1.2', '', 'x'.repeat(129), 'a b']) {
      expect(at('a', 'b', id)).toThrow(
        new RangeError('The record id is letters, digits, _ and -, up to 128.'),
      );
    }
    expect(at('a', 'b.', '1')).toThrow(RangeError);
    expect(at('a', '.b', '1')).toThrow(RangeError);
    expect(at('Orders', 'b', '1')).toThrow(RangeError);
    expect(() => checkService('Identity')).toThrow(
      new RangeError('The service is small letters and digits, starting with a letter, up to 32.'),
    );
    expect(() => checkService('pay-ments')).toThrow(RangeError);
    expect(() => checkService(undefined)).toThrow(RangeError);
    expect(() => codeContext('identity', 'otp.x', '1')).toThrow(
      new RangeError(
        'The purpose of a code is small letters, digits and _, starting with a letter, up to 64.',
      ),
    );
    expect(() => codeContext('identity', 'otp', '1:2')).toThrow(
      new RangeError('The ref of a code is letters, digits, _ and -, up to 128.'),
    );
  });
});
