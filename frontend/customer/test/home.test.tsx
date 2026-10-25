import { cleanup, render, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { createRoutesStub } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { SiteFooter } from '../app/components/SiteFooter';
import { SiteHeader } from '../app/components/SiteHeader';
import { ErrorBoundary } from '../app/root';
import Credits from '../app/routes/credits';
import Home, { meta } from '../app/routes/home';

afterEach(cleanup);

/** The page inside the header and footer, at `path`, as the router renders it. */
function page(Component: React.ComponentType, path = '/') {
  const Stub = createRoutesStub([
    {
      path,
      Component: () => (
        <>
          <SiteHeader />
          <main id="main">
            <Component />
          </main>
          <SiteFooter />
        </>
      ),
    },
  ]);
  return render(<Stub initialEntries={[path]} />);
}

/** axe on what is rendered (colour contrast needs a real layout: the browser check covers it). */
async function violations(container: HTMLElement) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
  return results.violations.map((violation) => `${violation.id}: ${violation.help}`);
}

describe('home page', () => {
  it('says what Beautinique is, in one h1 and clear sections', async () => {
    const { container } = page(Home);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Beauty you can trust' }),
    ).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(['Why Beautinique', 'What you will find', 'How it works']);
    expect(screen.getByText('Launching soon')).toBeTruthy();
    expect(await violations(container)).toEqual([]);
  });

  it('lists the four promises, the six launch categories and the three steps in order', () => {
    page(Home);
    const why = screen.getByRole('region', { name: 'Why Beautinique' });
    expect(
      within(why)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual([
      'Only genuine brands',
      'Shades you can trust',
      'Clear prices',
      'Try before you buy',
    ]);
    const categories = screen.getByRole('region', { name: 'What you will find' });
    expect(
      within(categories)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Skin', 'Makeup', 'Hair', 'Fragrance', 'Bath & Body', "Men's Grooming"]);
    // categories are not links until the catalog has their pages
    expect(within(categories).queryAllByRole('link')).toHaveLength(0);
    const steps = within(screen.getByRole('region', { name: 'How it works' })).getAllByRole(
      'heading',
      { level: 3 },
    );
    expect(steps.map((step) => step.textContent)).toEqual([
      'Step 1: Stock comes to our warehouse',
      'Step 2: Every batch is checked',
      'Step 3: Delivered to your door',
    ]);
  });

  it('has no dead links: only the in-page link, home and the credits page', () => {
    page(Home);
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs.toSorted()).toEqual(['#how-it-works', '/', '/credits']);
    expect(document.getElementById('how-it-works')).toBeTruthy();
  });

  it('names no city or state (PRD §7.2: places are data, not code)', () => {
    const { container } = page(Home);
    expect(container.textContent).not.toMatch(/Pune|Maharashtra/);
  });

  it('gives search engines and link previews a title and description', () => {
    const tags = meta({} as Parameters<typeof meta>[0]);
    expect(tags).toContainEqual({ title: 'Beautinique: beauty you can trust' });
    for (const name of ['og:title', 'og:description', 'og:type']) {
      expect(
        tags.some((tag) => 'property' in tag && tag.property === name),
        name,
      ).toBe(true);
    }
    expect(tags.some((tag) => 'name' in tag && tag.name === 'description')).toBe(true);
  });
});

describe('header and footer', () => {
  it('the header has the home link and the theme switcher, and no nav while there is one page', () => {
    page(Home);
    const banner = screen.getByRole('banner');
    const home = within(banner).getByRole('link', { name: 'Beautinique home' });
    expect(home.getAttribute('href')).toBe('/');
    // the logo inside the link is decorative: the link already names it
    expect(home.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(within(banner).getByRole('group', { name: 'Theme' })).toBeTruthy();
    expect(within(banner).queryByRole('navigation')).toBeNull();
  });

  it('the footer says this is a demo and links the icon credits', () => {
    page(Home);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('img', { name: 'Beautinique' })).toBeTruthy();
    expect(footer.textContent).toContain('not a real store');
    expect(footer.textContent).toContain(`© ${String(new Date().getFullYear())} Beautinique`);
    expect(within(footer).getByRole('link', { name: 'Icon credits' }).getAttribute('href')).toBe(
      '/credits',
    );
  });
});

describe('other pages', () => {
  it('the credits page names each icon set, its author and license', async () => {
    const { container } = page(Credits, '/credits');
    expect(screen.getByRole('heading', { level: 1, name: 'Icon credits' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '480 Design' }).getAttribute('href')).toMatch(
      /^https:/,
    );
    expect(screen.getByRole('link', { name: 'CC BY 4.0' }).getAttribute('href')).toBe(
      'https://creativecommons.org/licenses/by/4.0/',
    );
    expect(await violations(container)).toEqual([]);
  });

  it('unknown paths and errors get the shared error page', () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <ErrorBoundary
            {...({
              error: { status: 404, statusText: 'Not Found', internal: true, data: '' },
            } as unknown as Parameters<typeof ErrorBoundary>[0])}
          />
        ),
      },
    ]);
    render(<Stub initialEntries={['/']} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go to the home page' }).getAttribute('href')).toBe(
      '/',
    );
  });
});
