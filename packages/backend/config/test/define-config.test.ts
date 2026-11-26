import { describe, expect, it } from 'vitest';
import { string } from 'zod';

import { defineConfig } from '../src/index.ts';
import { paymentsConfig } from './utils/sample-config.ts';

describe('defineConfig', () => {
  it('SR-071: keeps the service, its namespace, its keys and its rules, and cannot be changed', () => {
    expect(paymentsConfig.service).toBe('payments');
    expect(paymentsConfig.prefix).toBe('PAYMENTS_');
    expect(Object.keys(paymentsConfig.keys)).toEqual([
      'PAYMENTS_MONGODB_URI',
      'PAYMENTS_PORT',
      'PAYMENTS_MODE',
      'PAYMENTS_KEY_ID',
      'PAYMENTS_TOKEN_SECRET',
      'PAYMENTS_STRICT',
    ]);
    expect(paymentsConfig.rules).toHaveLength(1);
    expect(Object.isFrozen(paymentsConfig)).toBe(true);
  });

  it('SR-071: has no rules unless it is given some', () => {
    expect(
      defineConfig({
        service: 'media',
        keys: { MEDIA_BUCKET: string('MEDIA_BUCKET is required.') },
      }).rules,
    ).toEqual([]);
  });

  it('SR-071: a key outside the namespace of the service is refused', () => {
    for (const name of ['BUCKET', 'OTHER_BUCKET', 'MEDIA', 'MEDIA_', 'MEDIAX_BUCKET']) {
      expect(
        () => defineConfig({ service: 'media', keys: { [name]: string(`${name} is required.`) } }),
        name,
      ).toThrow('namespace of media');
    }
    expect(() =>
      defineConfig({
        service: 'media',
        keys: { MEDIA_BUCKET: string('MEDIA_BUCKET is required.') },
      }),
    ).not.toThrow();
  });

  it('CR-3: a key is in capitals, digits and _, and starts with a letter', () => {
    for (const name of [
      'media_bucket',
      'Media_Bucket',
      'MEDIA-BUCKET',
      '1MEDIA_BUCKET',
      'MEDIA BUCKET',
    ]) {
      expect(
        () => defineConfig({ service: 'media', keys: { [name]: string(`${name} is required.`) } }),
        name,
      ).toThrow('capitals, digits and _');
    }
  });

  it('CR-3: a service is in small letters and digits, and has at least one key', () => {
    for (const service of ['Media', 'media-x', 'media_x', '1media', '', 'media x']) {
      expect(
        () =>
          defineConfig({ service, keys: { MEDIA_BUCKET: string('MEDIA_BUCKET is required.') } }),
        service,
      ).toThrow('small letters and digits');
    }
    expect(() => defineConfig({ service: 'media', keys: {} })).toThrow('has no keys');
  });

  it('SR-071: the namespace of a service with digits in its name', () => {
    const config = defineConfig({
      service: 'api2',
      keys: { API2_URL: string('API2_URL is required.') },
    });
    expect(config.prefix).toBe('API2_');
  });
});
