import { createHash } from 'node:crypto';

import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { createBrowserRouter, createRoutesStub, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import {
  AppFrame,
  ErrorPage,
  NavList,
  setThemeChoice,
  THEME_SCRIPT,
  THEME_SCRIPT_HASH,
  THEME_STORAGE_KEY,
  ThemeScript,
  ThemeSwitcher,
} from '../src/index';

const html = document.documentElement;

afterEach(() => {
  cleanup();
  setThemeChoice('system');
  localStorage.clear();
  html.removeAttribute('theme-switching');
});

/** axe on what is rendered (colour contrast needs a real layout: the browser check covers it). */
async function violations(container: HTMLElement) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
  return results.violations.map((violation) => `${violation.id}: ${violation.help}`);
}

const inRouter = (element: React.ReactElement, path = '/') => {
  const Stub = createRoutesStub([
    { path: '/', Component: () => element },
    { path: '/about', Component: () => element },
  ]);
  return render(<Stub initialEntries={[path]} />);
};

describe('the theme script', () => {
  const run = () => {
    // what the browser does with the inline <script>: run exactly that text
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call -- the test runs the package's own fixed script
    new Function(THEME_SCRIPT)();
  };

  it('puts the saved theme on <html> before the page paints', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    run();
    expect(html.getAttribute('theme')).toBe('dark');
  });

  it('leaves the system theme alone, ignores junk, and survives blocked storage', () => {
    run();
    expect(html.hasAttribute('theme')).toBe(false);
    localStorage.setItem(THEME_STORAGE_KEY, '"><img>');
    run();
    expect(html.hasAttribute('theme')).toBe(false);
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });
    try {
      expect(run).not.toThrow();
    } finally {
      if (original) Object.defineProperty(window, 'localStorage', original);
    }
  });

  it('has the CSP hash it says, and renders as one inline script', () => {
    const digest = createHash('sha256').update(THEME_SCRIPT).digest('base64');
    expect(THEME_SCRIPT_HASH).toBe(`'sha256-${digest}'`);
    expect(renderToString(<ThemeScript />)).toBe(`<script>${THEME_SCRIPT}</script>`);
  });
});

describe('ThemeSwitcher', () => {
  it('is a named radio group of three, on the system setting at first', async () => {
    render(<ThemeSwitcher />);
    const group = screen.getByRole('group', { name: 'Theme' });
    const radios = screen.getAllByRole('radio');
    expect(radios.map((radio) => radio.getAttribute('value'))).toEqual(['light', 'dark', 'system']);
    expect(screen.getByRole('radio', { name: 'Use the system setting' })).toHaveProperty(
      'checked',
      true,
    );
    expect(await violations(group)).toEqual([]);
  });

  it('changes the theme at once and remembers it; system forgets it', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByRole('radio', { name: 'Dark theme' }));
    expect(html.getAttribute('theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    // one frame without transitions while the colours change, then it goes
    act(() => {
      setThemeChoice('light');
    });
    expect(html.hasAttribute('theme-switching')).toBe(true);
    await waitFor(() => {
      expect(html.hasAttribute('theme-switching')).toBe(false);
    });
    await user.click(screen.getByRole('radio', { name: 'Use the system setting' }));
    expect(html.hasAttribute('theme')).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('works from the keyboard: arrow keys move the choice', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('radio', { name: 'Use the system setting' }),
    );
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Dark theme' })).toHaveProperty('checked', true);
    expect(html.getAttribute('theme')).toBe('dark');
  });

  it('shows the saved choice, keeps two switchers in step, and follows another tab', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    setThemeChoice('light');
    const user = userEvent.setup();
    render(
      <>
        <ThemeSwitcher />
        <ThemeSwitcher />
      </>,
    );
    const [firstDark, secondDark] = screen.getAllByRole('radio', { name: 'Dark theme' });
    if (!firstDark || !secondDark) throw new Error('two switchers expected');
    expect(screen.getAllByRole('radio', { name: 'Light theme' })[1]).toHaveProperty(
      'checked',
      true,
    );
    await user.click(firstDark);
    expect(secondDark).toHaveProperty('checked', true);
    // another tab of the app picks light
    act(() => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY }));
    });
    expect(html.getAttribute('theme')).toBe('light');
    expect(screen.getAllByRole('radio', { name: 'Light theme' })[0]).toHaveProperty(
      'checked',
      true,
    );
  });

  it('still switches for this page when storage is blocked', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });
    try {
      await user.click(screen.getByRole('radio', { name: 'Dark theme' }));
      expect(html.getAttribute('theme')).toBe('dark');
      expect(screen.getByRole('radio', { name: 'Dark theme' })).toHaveProperty('checked', true);
    } finally {
      if (original) Object.defineProperty(window, 'localStorage', original);
    }
  });

  it('renders on the server as the system setting (hydration matches any saved choice)', () => {
    const markup = renderToString(<ThemeSwitcher />);
    const checked = [...markup.matchAll(/<input[^>]*>/g)]
      .map(([input]) => input)
      .filter((input) => input.includes('checked'));
    expect(checked).toHaveLength(1);
    expect(checked[0]).toContain('value="system"');
  });
});

describe('AppFrame', () => {
  it('puts the skip link first, then header, one main and footer', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AppFrame header={<header>Head</header>} footer={<footer>Foot</footer>}>
        <h1>Page</h1>
      </AppFrame>,
    );
    await user.tab();
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(document.activeElement).toBe(skip);
    expect(skip.getAttribute('href')).toBe('#main');
    const main = screen.getByRole('main');
    expect(main.id).toBe('main');
    expect(main.getAttribute('tabindex')).toBe('-1');
    expect(screen.getByRole('banner').textContent).toBe('Head');
    expect(screen.getByRole('contentinfo').textContent).toBe('Foot');
    expect(await violations(container)).toEqual([]);
  });
});

describe('NavList', () => {
  const items = [
    { label: 'Home', to: '/', end: true },
    { label: 'About', to: '/about' },
  ];

  it('marks the current page and names the landmark', async () => {
    const { container } = inRouter(<NavList items={items} label="Main" />, '/about');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toBeTruthy();
    expect(screen.getByRole('link', { name: 'About' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull();
    expect(await violations(container)).toEqual([]);
  });

  it('renders nothing without pages', () => {
    const { container } = inRouter(<NavList items={[]} label="Main" />);
    expect(container.querySelector('nav')).toBeNull();
  });
});

describe('ErrorPage', () => {
  const art = (container: HTMLElement) => container.querySelector('[data-error-code]');
  const compacts = (container: HTMLElement, state: 'empty' | 'cracked') =>
    container.querySelectorAll(`[data-error-code] [data-compact="${state}"]`).length;

  it('not found: one h1, the message, a way home, and a 404 drawn with an empty compact', async () => {
    const { container } = inRouter(
      <main>
        <ErrorPage status={404} title="Page not found" message="This page does not exist." />
      </main>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy();
    expect(screen.getByText('This page does not exist.')).toBeTruthy();
    expect(screen.getByText('Error 404')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go to the home page' }).getAttribute('href')).toBe(
      '/',
    );
    // the art says nothing to screen readers; the text above does
    expect(art(container)?.getAttribute('aria-hidden')).toBe('true');
    expect(art(container)?.getAttribute('data-error-code')).toBe('404');
    expect(compacts(container, 'empty')).toBe(1);
    expect(container.querySelector('[data-powder-backdrop]')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(await violations(container)).toEqual([]);
  });

  it('without a status: 404 for not found, "Oops" for errors, and no "Error ..." line', () => {
    const { container } = inRouter(<ErrorPage title="Page not found" />);
    expect(art(container)?.getAttribute('data-error-code')).toBe('404');
    expect(screen.queryByText(/^Error \d/)).toBeNull();
    cleanup();
    const error = inRouter(<ErrorPage kind="error" title="Something went wrong" />);
    expect(art(error.container)?.getAttribute('data-error-code')).toBe('Oops');
    // the capital O is the compact, the small o stays a letter
    expect(compacts(error.container, 'cracked')).toBe(1);
  });

  it('errors draw every zero as a cracked compact', () => {
    const { container } = inRouter(<ErrorPage kind="error" status={500} title="Something broke" />);
    expect(compacts(container, 'cracked')).toBe(2);
    expect(compacts(container, 'empty')).toBe(0);
    expect(screen.getByText('Error 500')).toBeTruthy();
  });

  it('errors offer "Try again" first, then home', async () => {
    const { container } = inRouter(<ErrorPage kind="error" title="Something went wrong" />);
    // links and buttons in page order
    const ways = [...container.querySelectorAll('section a, section button')];
    expect(ways.map((way) => way.textContent)).toEqual(['Try again', 'Go to the home page']);
    expect(ways[0]?.tagName).toBe('BUTTON');
    expect(await violations(container)).toEqual([]);
  });

  it('takes its own actions: links and buttons, the first one the main one', async () => {
    const user = userEvent.setup();
    let clicked = 0;
    inRouter(
      <ErrorPage
        title="Sign in again"
        actions={[
          { label: 'Sign in', to: '/about' },
          {
            label: 'Contact support',
            onClick: () => {
              clicked += 1;
            },
          },
        ]}
      />,
    );
    const signIn = screen.getByRole('link', { name: 'Sign in' });
    expect(signIn.getAttribute('href')).toBe('/about');
    expect(signIn.className).toContain('bg-brand-gradient');
    const support = screen.getByRole('button', { name: 'Contact support' });
    expect(support.className).not.toContain('bg-brand-gradient');
    await user.click(support);
    expect(clicked).toBe(1);
    expect(screen.queryByRole('link', { name: 'Go to the home page' })).toBeNull();
  });

  /** What React Router's browser history keeps for the current entry (idx 0: first page of the visit). */
  const browserEntry = (idx: number | undefined) => {
    window.history.replaceState(idx === undefined ? null : { usr: null, key: 'k', idx }, '');
  };
  afterEach(() => {
    browserEntry(undefined);
  });

  it('"Go back" only when there is a page of this app to go back to (browser history)', async () => {
    const user = userEvent.setup();
    // as the framework leaves it in Chrome: the first page of the visit already has a key
    window.history.replaceState({ usr: null, key: 'first-page', idx: 0 }, '', '/missing');
    const router = createBrowserRouter([
      { path: '/', Component: () => <p>Home page</p> },
      { path: '*', Component: () => <ErrorPage title="Page not found" /> },
    ]);
    render(<RouterProvider router={router} />);
    // the first page of the visit (React Router gives it a key too): back would leave the app
    expect(screen.queryByRole('button', { name: 'Go back' })).toBeNull();
    await act(() => router.navigate('/'));
    await act(() => router.navigate('/missing-too'));
    await user.click(await screen.findByRole('button', { name: 'Go back' }));
    expect(await screen.findByText('Home page')).toBeTruthy();
    router.dispose();
    window.history.replaceState(null, '', '/');
  });

  it('shows a reference to quote to support, only when there is one', () => {
    inRouter(<ErrorPage kind="error" title="Something went wrong" reference="req_7f3a9c" />);
    expect(screen.getByText('req_7f3a9c').tagName).toBe('CODE');
    expect(screen.getByText(/^Reference:/)).toBeTruthy();
    cleanup();
    inRouter(<ErrorPage kind="error" title="Something went wrong" reference="" />);
    expect(screen.queryByText(/^Reference:/)).toBeNull();
  });

  it('technical details only when given, closed by default', () => {
    const { container } = inRouter(
      <ErrorPage kind="error" title="Something went wrong" details={'TypeError: x\n    at y'} />,
    );
    const details = container.querySelector('details');
    expect(details?.open).toBe(false);
    expect(within(details ?? container).getByText('Technical details')).toBeTruthy();
    expect(details?.querySelector('pre')?.textContent).toBe('TypeError: x\n    at y');
    cleanup();
    const blank = inRouter(<ErrorPage kind="error" title="Something went wrong" details="  " />);
    expect(blank.container.querySelector('details')).toBeNull();
  });

  it('hydrates without a mismatch when the browser knows a page to go back to (a reload)', async () => {
    const routes = [
      { path: '/', Component: () => <p>Home page</p> },
      { path: '/missing', Component: () => <ErrorPage title="Page not found" /> },
    ];
    // the server: always the first page of a visit, so no "Go back"
    const Server = createRoutesStub(routes);
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Server initialEntries={['/missing']} />);
    expect(container.textContent).not.toContain('Go back');
    document.body.append(container);
    // the browser after a reload: history.state still has the page before
    browserEntry(1);
    const Client = createRoutesStub(routes);
    const recoverable: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(
        container,
        <Client initialEntries={['/', '/missing']} initialIndex={1} />,
        { onRecoverableError: (error) => recoverable.push(error) },
      );
      await Promise.resolve();
    });
    expect(recoverable).toEqual([]);
    expect(await within(container).findByRole('button', { name: 'Go back' })).toBeTruthy();
    act(() => root?.unmount());
    container.remove();
  });

  it('renders on the server', () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => <ErrorPage kind="error" status={500} title="Something broke" />,
      },
    ]);
    const markup = renderToString(<Stub initialEntries={['/']} />);
    expect(markup).toContain('Something broke');
    expect(markup).toContain('data-compact="cracked"');
    // the first page of a visit, also on the server: no "Go back"
    expect(markup).not.toContain('Go back');
  });
});
