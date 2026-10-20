import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { routes } from '../src/routes';

afterEach(cleanup);

const renderAt = (path: string) =>
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);

describe('admin', () => {
  it('shows the home page', async () => {
    renderAt('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Beautinique Admin' }),
    ).toBeTruthy();
  });

  it('shows "Page not found" for unknown paths', async () => {
    renderAt('/no-such-page');
    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy();
  });

  it('starts with a skip link to the main content', async () => {
    renderAt('/');
    const skip = await screen.findByRole('link', { name: 'Skip to content' });
    expect(skip.getAttribute('href')).toBe('#main');
  });
});
