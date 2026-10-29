import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import { usePathParams } from '../src/router/use-path-params';
import { useQueryParams } from '../src/router/use-query-params';
import { useDebounce } from '../src/use-debounce';
import { useIsSmallScreen } from '../src/use-is-small-screen';
import { useOnlineStatus } from '../src/use-online-status';
import { useOutsideClick } from '../src/use-outside-click';

// Every hook must render on the server (no `window`/`document` use while rendering, no
// "useLayoutEffect does nothing on the server" style warnings).
describe('server rendering', () => {
  let consoleError: MockInstance<typeof console.error>;
  let consoleWarn: MockInstance<typeof console.warn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });

  const expectNoWarnings = () => {
    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
  };

  it('useDebounce', () => {
    const Probe = () => {
      const { trigger, cancel } = useDebounce({ callback: () => undefined });
      return <span>{`${typeof trigger}/${typeof cancel}`}</span>;
    };

    expect(renderToString(<Probe />)).toContain('function/function');
    expectNoWarnings();
  });

  it('useOutsideClick', () => {
    const Probe = () => {
      const ref = useOutsideClick<HTMLDivElement>(() => undefined);
      return <div ref={ref}>content</div>;
    };

    expect(renderToString(<Probe />)).toContain('content');
    expectNoWarnings();
  });

  it('useIsSmallScreen', () => {
    const Probe = () => <span>{String(useIsSmallScreen())}</span>;

    expect(renderToString(<Probe />)).toContain('false');
    expectNoWarnings();
  });

  it('useOnlineStatus', () => {
    const Probe = () => <span>{useOnlineStatus().status}</span>;

    expect(renderToString(<Probe />)).toContain('online');
    expectNoWarnings();
  });

  it('useOnlineStatus without any window, document or navigator', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('document', undefined);
    vi.stubGlobal('navigator', undefined);
    const Probe = () => <span>{useOnlineStatus().status}</span>;

    try {
      expect(renderToString(<Probe />)).toContain('online');
      expectNoWarnings();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('usePathParams', () => {
    const Probe = () => <span>{usePathParams().paths.join('|')}</span>;

    const html = renderToString(
      <StaticRouter location="/seller/products?tab=info">
        <Probe />
      </StaticRouter>,
    );

    expect(html).toContain('seller|products');
    expectNoWarnings();
  });

  it('useQueryParams', () => {
    const Probe = () => <span>{JSON.stringify(useQueryParams().queryParams)}</span>;

    const html = renderToString(
      <StaticRouter location="/seller/products?tab=info&page=2">
        <Probe />
      </StaticRouter>,
    );

    expect(html).toContain('tab');
    expect(html).toContain('info');
    expect(html).toContain('page');
    expectNoWarnings();
  });
});
