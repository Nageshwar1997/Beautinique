import { getMe, HEADERS } from '@beautinique/shared-contracts';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  ApiProvider,
  createApiClient,
  createQueryClient,
  queryKey,
  useApiClient,
  useApiMutation,
  useApiQuery,
} from '../src/index';
import { BASE_URL, failure, fakeGateway, placeOrder } from './fake-gateway';

const disposers: (() => void)[] = [];
afterEach(() => {
  for (const dispose of disposers.splice(0)) dispose();
});

function setup(gateway: ReturnType<typeof fakeGateway>) {
  // through the gateway's current fetch, which a test may swap
  const client = createApiClient({
    app: 'customer',
    baseUrl: BASE_URL,
    fetch: (input, init) => gateway.fetch(input, init),
  });
  const queryClient = createQueryClient();
  disposers.push(() => {
    client.dispose();
    queryClient.clear();
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApiProvider client={client} queryClient={queryClient}>
      {children}
    </ApiProvider>
  );
  return { client, queryClient, wrapper };
}

const orderKeys = (gateway: ReturnType<typeof fakeGateway>) =>
  gateway.requests
    .filter((request) => request.path === '/api/v1/test/orders')
    .map((request) => request.headers.get(HEADERS.idempotencyKey));

describe('useApiQuery', () => {
  it('reads a GET route into the cache under the contracts’ query key', async () => {
    const gateway = fakeGateway({ access: true });
    const { wrapper, queryClient } = setup(gateway);
    const { result } = renderHook(() => useApiQuery(getMe), { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.user.email).toBe('asha@beautinique.example');
    expect(queryClient.getQueryData(queryKey(getMe))).toEqual(result.current.data);
  });

  it('does not ask again after the server refused (4xx)', async () => {
    const gateway = fakeGateway({ access: false, session: false });
    const { wrapper } = setup(gateway);
    const { result } = renderHook(() => useApiQuery(getMe), { wrapper });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error?.code).toBe('UNAUTHENTICATED');
    expect(gateway.paths()).toEqual(['GET /api/v1/iam/me', 'POST /api/v1/auth/refresh']);
  });

  it('tries a lost connection twice more', async () => {
    const gateway = fakeGateway({ access: true });
    const { wrapper } = setup(gateway);
    let tries = 0;
    const answer = gateway.fetch;
    gateway.fetch = (input, init) => {
      tries += 1;
      if (tries < 3) return Promise.reject(new TypeError('Failed to fetch'));
      return answer(input, init);
    };
    const { result } = renderHook(() => useApiQuery(getMe, undefined, { retryDelay: 0 }), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(tries).toBe(3);
  });
});

describe('useApiMutation', () => {
  it('keeps the key when the same request is sent again after a failure', async () => {
    const gateway = fakeGateway({ access: true });
    const { wrapper } = setup(gateway);
    const { result } = renderHook(() => useApiMutation(placeOrder), { wrapper });
    const answer = gateway.fetch;
    let first = true;
    gateway.fetch = (input, init) => {
      if (first) {
        first = false;
        void answer(input, init);
        return Promise.resolve(failure(503, 'UNAVAILABLE'));
      }
      return answer(input, init);
    };
    await act(async () => {
      await result.current.mutateAsync({ body: { item: 'lipstick' } }).catch(() => undefined);
    });
    await act(async () => {
      await result.current.mutateAsync({ body: { item: 'lipstick' } });
    });
    const keys = orderKeys(gateway);
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(keys[1]);
  });

  it('makes a new key after a success, and for a changed request', async () => {
    const gateway = fakeGateway({ access: true });
    const { wrapper } = setup(gateway);
    const { result } = renderHook(() => useApiMutation(placeOrder), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ body: { item: 'lipstick' } });
    });
    await act(async () => {
      await result.current.mutateAsync({ body: { item: 'lipstick' } });
    });
    await act(async () => {
      await result.current.mutateAsync({ body: { item: 'kajal' } });
    });
    expect(new Set(orderKeys(gateway)).size).toBe(3);
  });

  it('gives the answer and the typed error', async () => {
    const gateway = fakeGateway({ access: true, steppedUp: false });
    const { wrapper } = setup(gateway);
    const { result } = renderHook(() => useApiMutation(placeOrder), { wrapper });
    act(() => {
      result.current.mutate({ body: { item: 'lipstick' } });
    });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error?.code).toBe('STEP_UP_REQUIRED');
  });
});

describe('useApiClient', () => {
  it('needs an ApiProvider', () => {
    expect(() => renderHook(() => useApiClient())).toThrow(/ApiProvider/);
  });

  it('gives the provider’s client', () => {
    const { wrapper, client } = setup(fakeGateway());
    const { result } = renderHook(() => useApiClient(), { wrapper });
    expect(result.current).toBe(client);
  });
});
