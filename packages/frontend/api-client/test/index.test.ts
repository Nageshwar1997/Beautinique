import * as contracts from '@beautinique/shared-contracts';
import { describe, expect, it } from 'vitest';

import * as api from '../src/index';

describe('@beautinique/frontend-api-client', () => {
  it('exports the client, the hooks and the error helpers', () => {
    expect(Object.keys(api).toSorted()).toEqual(
      [
        'API_BASE_URL',
        'ApiError',
        'ApiProvider',
        'OTHER_TAB_REFRESH_WAIT_MS',
        'createApiClient',
        'createQueryClient',
        'errorMessage',
        'isApiError',
        'queryKey',
        'queryKeyPrefix',
        'useApiClient',
        'useApiMutation',
        'useApiQuery',
      ].toSorted(),
    );
  });

  it('gives the contracts’ ApiError and query keys, so caches and checks match the server’s', () => {
    expect(api.ApiError).toBe(contracts.ApiError);
    expect(api.queryKey).toBe(contracts.queryKey);
    expect(api.queryKeyPrefix).toBe(contracts.queryKeyPrefix);
  });
});
