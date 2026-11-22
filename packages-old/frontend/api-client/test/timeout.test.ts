// @vitest-environment node
// The client's timeout (QA-FE-006) in Node, where the abort signal and fetch's Request are the same
// kind: under jsdom its AbortSignal is jsdom's and Request is Node's, and the abort does not always
// reach the fetch. In the browser the apps use axios's XMLHttpRequest, whose timeout is its own.
import { getMe } from '@beautinique/shared-contracts';
import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from '../src/index';
import { BASE_URL } from './fake-gateway';

/** A gateway that takes the request and never answers, until the request is given up. */
const hanging = ((input: Request, init?: RequestInit) => {
  const signal = init?.signal ?? input.signal;
  return new Promise<Response>((_resolve, reject) => {
    signal.addEventListener('abort', () => {
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}) as unknown as typeof fetch;

describe('the client’s timeout (QA-FE-006)', () => {
  it('gives up on a gateway that never answers after its timeout, as NETWORK_ERROR', async () => {
    const recheck = vi.fn();
    const client = createApiClient({
      app: 'customer',
      baseUrl: BASE_URL,
      fetch: hanging,
      timeoutMs: 100,
      onlineStatus: { confirmOnline: vi.fn(), recheck },
    });
    try {
      const started = Date.now();
      await expect(client.call(getMe)).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
      expect(Date.now() - started).toBeLessThan(2000);
      // no answer: the app checks whether it is still online
      expect(recheck).toHaveBeenCalled();
    } finally {
      client.dispose();
    }
  });
});
