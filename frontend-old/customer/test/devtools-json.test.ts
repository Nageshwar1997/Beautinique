import { describe, expect, it } from 'vitest';

import routes from '../app/routes';
import { loader } from '../app/routes/devtools-json';

describe("Chrome DevTools' workspace request", () => {
  it('has its own route, so React Router does not log it as an error', () => {
    expect(routes).toContainEqual(
      expect.objectContaining({
        path: '.well-known/appspecific/com.chrome.devtools.json',
        file: 'routes/devtools-json.ts',
      }),
    );
  });

  it('answers a plain, uncached 404 with no body', async () => {
    const response = loader();
    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).toBe('');
  });
});
