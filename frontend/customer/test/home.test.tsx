import { cleanup, render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import Home, { meta } from '../app/routes/home';

afterEach(cleanup);

describe('customer', () => {
  it('shows the home page', async () => {
    const Stub = createRoutesStub([{ path: '/', Component: Home }]);
    render(<Stub initialEntries={['/']} />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Beautinique' })).toBeTruthy();
  });

  it('gives the home page a title and description', () => {
    const tags = meta({} as Parameters<typeof meta>[0]);
    expect(tags).toContainEqual({ title: 'Beautinique' });
    expect(tags.some((tag) => 'name' in tag && tag.name === 'description')).toBe(true);
  });
});
