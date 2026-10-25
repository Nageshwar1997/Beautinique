import { createHash } from 'node:crypto';

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { renderToString } from 'react-dom/server';
import { createRoutesStub } from 'react-router';
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
  it('has one h1, the message and a way home (or elsewhere)', async () => {
    const { container } = inRouter(
      <main>
        <ErrorPage title="Page not found" message="This page does not exist." />
      </main>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy();
    expect(screen.getByText('This page does not exist.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go to the home page' }).getAttribute('href')).toBe(
      '/',
    );
    expect(await violations(container)).toEqual([]);
    cleanup();
    inRouter(<ErrorPage title="Oops" action={{ label: 'Try again', to: '/about' }} />);
    expect(screen.getByRole('link', { name: 'Try again' }).getAttribute('href')).toBe('/about');
  });
});
