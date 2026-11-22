import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { CursorPager, MAX_PAGES, useTableUrl } from '../src';

const FILTERS = { email: '', app: '', status: 'active' } as const;

let latest: ReturnType<typeof useTableUrl<keyof typeof FILTERS>> | undefined;

const report = (seen: NonNullable<typeof latest>) => {
  latest = seen;
};

function Page() {
  const url = useTableUrl({ filters: FILTERS });
  useEffect(() => {
    report(url);
  });
  const location = useLocation();
  return (
    <>
      <p data-testid="search">{location.search}</p>
      <CursorPager
        page={url.page}
        nextCursor={url.page < 3 ? `c${String(url.page)}` : null}
        onNext={url.next}
        onPrevious={url.previous}
      />
    </>
  );
}

function at(path: string) {
  const router = createMemoryRouter([{ path: '/staff', element: <Page /> }], {
    initialEntries: [path],
  });
  render(<RouterProvider router={router} />);
  return router;
}
const search = () => screen.getByTestId('search').textContent;
const url = () => {
  if (!latest) throw new Error('not rendered');
  return latest;
};

afterEach(() => {
  cleanup();
  latest = undefined;
});

describe('useTableUrl', () => {
  it('reads the filters from the URL, else their defaults, and the first page', () => {
    at('/staff?app=admin');
    expect(url().filters).toEqual({ email: '', app: 'admin', status: 'active' });
    expect(url().filtered).toBe(true);
    expect(url().cursor).toBeUndefined();
    expect(url().page).toBe(1);
  });

  it('keeps a default out of the URL, and starts again from the first page on a new filter', () => {
    at('/staff?pages=c1.c2');
    expect(url().page).toBe(3);
    expect(url().cursor).toBe('c2');
    act(() => {
      url().setFilters({ status: 'ended', app: 'admin' });
    });
    expect(search()).toBe('?app=admin&status=ended');
    act(() => {
      url().setFilters({ status: 'active', app: '' });
    });
    expect(search()).toBe('');
    expect(url().filtered).toBe(false);
    act(() => {
      url().setFilters({ email: 'asha@beautinique.example' });
    });
    act(() => {
      url().clearFilters();
    });
    expect(search()).toBe('');
  });

  it('walks the pages with Next and Previous, the trail in the URL, and Back undoes a step', async () => {
    const router = at('/staff?app=admin');
    expect(screen.getByText('Page 1')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveProperty('disabled', true);
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(search()).toBe('?app=admin&pages=c1');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(search()).toBe('?app=admin&pages=c1.c2');
    expect(screen.getByText('Page 3')).toBeDefined();
    // the last page: no next cursor
    expect(screen.getByRole('button', { name: 'Next' })).toHaveProperty('disabled', true);
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(search()).toBe('?app=admin&pages=c1');
    await act(async () => {
      await router.navigate(-1);
    });
    expect(search()).toBe('?app=admin&pages=c1.c2');
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(search()).toBe('?app=admin');
  });

  it('reads a trail with anything but cursors in it as the first page', () => {
    at('/staff?pages=c1.%3Cscript%3E');
    expect(url().page).toBe(1);
    expect(url().cursor).toBeUndefined();
  });

  it(`starts again from the first page past ${String(MAX_PAGES)} pages`, () => {
    const trail = Array.from({ length: MAX_PAGES }, (_, i) => `c${String(i)}`).join('.');
    at(`/staff?pages=${trail}`);
    expect(url().page).toBe(MAX_PAGES + 1);
    act(() => {
      url().next('more');
    });
    expect(search()).toBe('');
  });
});

describe('CursorPager', () => {
  it('is nothing on a first page that is also the last', () => {
    render(
      <CursorPager
        page={1}
        nextCursor={null}
        onNext={() => undefined}
        onPrevious={() => undefined}
      />,
    );
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('waits while a page comes', () => {
    render(
      <CursorPager
        page={2}
        nextCursor="c2"
        busy
        onNext={() => undefined}
        onPrevious={() => undefined}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Pages' });
    expect(nav).toBeDefined();
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Next' })).toHaveProperty('disabled', true);
  });
});
