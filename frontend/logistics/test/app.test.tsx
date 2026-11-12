import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { routes } from '../src/routes';

afterEach(cleanup);

const renderAt = (path: string) =>
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);

describe('logistics', () => {
  it('says the app is coming soon and what it will be for (no note for developers)', async () => {
    renderAt('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Beautinique Logistics Ops' }),
    ).toBeTruthy();
    expect(screen.getByText('Coming soon')).toBeTruthy();
    expect(
      screen.getByText(
        'The logistics team will run hubs, line-haul and the delivery control tower here.',
      ),
    ).toBeTruthy();
    expect(document.body.textContent).not.toContain('routes.tsx');
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
