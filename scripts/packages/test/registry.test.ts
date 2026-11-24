import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { fetchPackument } from '../src/registry.ts';
import { startFakeRegistry, type FakeRegistry } from './utils/fake-registry.ts';
import { blockedAttempts } from './utils/network-guard.ts';

let registry: FakeRegistry;
beforeEach(async () => {
  registry = await startFakeRegistry();
});
afterEach(async () => {
  await registry.close();
});

describe('fetchPackument', () => {
  it('lists the versions and the latest one of a published package', async () => {
    await registry.seed('@beautinique/shared-money', ['1.0.0', '1.1.0']);
    expect(await fetchPackument(registry.url, '@beautinique/shared-money')).toEqual({
      versions: ['1.0.0', '1.1.0'],
      latest: '1.1.0',
    });
  });

  it('says null for a package the registry does not know', async () => {
    expect(await fetchPackument(registry.url, '@beautinique/shared-nope')).toBeNull();
  });

  it('is an error, not "new", when the registry cannot be reached', async () => {
    const url = registry.url;
    await registry.close();
    await expect(fetchPackument(url, '@beautinique/shared-money')).rejects.toMatchObject({
      code: 'REGISTRY_UNREACHABLE',
    });
    registry = await startFakeRegistry();
  });
});

describe('AC-PACKAGES-12: the tests never reach the real npm registry', () => {
  it('blocks a connection to anything but this machine, and only the fake registry answers', async () => {
    await expect(
      fetchPackument('https://registry.npmjs.org', '@beautinique/shared-money'),
    ).rejects.toMatchObject({ code: 'REGISTRY_UNREACHABLE' });
    expect(blockedAttempts).toContain('registry.npmjs.org');
    await registry.seed('@beautinique/shared-money', ['1.0.0']);
    await fetchPackument(registry.url, '@beautinique/shared-money');
    expect(await registry.requests()).toEqual(['GET /@beautinique/shared-money']);
  });
});
