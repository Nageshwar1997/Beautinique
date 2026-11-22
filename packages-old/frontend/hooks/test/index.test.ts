import { describe, expect, it } from 'vitest';

import * as api from '../src/index';
import * as router from '../src/router/index';

describe('@beautinique/frontend-hooks', () => {
  it('exports the hooks that need no router from its root', () => {
    expect(Object.keys(api).sort()).toEqual([
      'createOnlineStatusStore',
      'onlineStatusStore',
      'useCopyToClipboard',
      'useCountdown',
      'useDebounce',
      'useDebouncedValue',
      'useIsSmallScreen',
      'useMediaQuery',
      'useOnlineStatus',
      'useOutsideClick',
    ]);
  });

  it('keeps the router hooks apart, in /router', () => {
    expect(Object.keys(router).sort()).toEqual([
      'usePathParams',
      'useQueryParamInput',
      'useQueryParams',
    ]);
  });
});
