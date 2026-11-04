// @vitest-environment node
import { getMe } from '@beautinique/shared-contracts';
import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from '../src/index';
import { fakeGateway } from './fake-gateway';

describe('on the server (customer SSR)', () => {
  it('works without a window: calls go out, session changes stay in the process', async () => {
    expect(typeof window).toBe('undefined');
    const gateway = fakeGateway({ access: true });
    const client = createApiClient({
      app: 'customer',
      baseUrl: 'https://customer.beautinique.example/api/v1',
      fetch: gateway.fetch,
    });
    const listener = vi.fn();
    client.onSessionChange(listener);
    client.sessionChanged('signed-out');
    expect(listener).toHaveBeenCalledWith('signed-out');
    await expect(client.call(getMe)).resolves.toMatchObject({ session: { app: 'customer' } });
    client.dispose();
  });
});
