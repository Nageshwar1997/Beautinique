import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { createMemoryRouter, RouterProvider, useNavigate } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { useOutsideClick } from '../src/use-outside-click';
import { BlockerGate } from './utils/blocker-gate';

// B8 of the useBlocker matrix: a "leave this page?" dialog is outside a popup that is open behind
// it, so pressing the dialog closes the popup (outside) and the router's blocker still works.
describe('useOutsideClick with useBlocker (B8)', () => {
  afterEach(() => {
    cleanup();
  });

  const setup = () => {
    const exposed: { blockerState?: string; reset?: () => void; ready?: boolean } = {};

    const Page = () => {
      const [open, setOpen] = useState(true);
      const [blockerState, setBlockerState] = useState('unblocked');
      const navigate = useNavigate();
      const ref = useOutsideClick<HTMLDivElement>(
        () => {
          setOpen(false);
        },
        { enabled: open },
      );

      return (
        <div>
          <BlockerGate
            block
            onBlocker={(blocker) => {
              exposed.reset = blocker.state === 'blocked' ? blocker.reset : undefined;
              exposed.blockerState = blocker.state;
              setBlockerState(blocker.state);
            }}
            onReady={() => {
              exposed.ready = true;
            }}
          />
          {open && (
            <div ref={ref} data-testid="popup">
              popup
            </div>
          )}
          <button
            data-testid="leave"
            onClick={() => {
              void navigate('/other');
            }}
          >
            leave
          </button>
          {blockerState === 'blocked' && (
            <div data-testid="dialog">
              <button
                data-testid="stay"
                onClick={() => {
                  exposed.reset?.();
                }}
              >
                stay
              </button>
            </div>
          )}
        </div>
      );
    };

    const router = createMemoryRouter(
      [
        { path: '/', element: <Page /> },
        { path: '/other', element: <div data-testid="other" /> },
      ],
      { initialEntries: ['/'] },
    );
    const view = render(<RouterProvider router={router} />);

    return { router, exposed, ...view };
  };

  it('a press on the dialog closes the popup, and "stay" leaves the router where it was', async () => {
    const { router, exposed, getByTestId, queryByTestId } = setup();
    await waitFor(() => {
      expect(exposed.ready).toBe(true);
    });

    act(() => {
      fireEvent.click(getByTestId('leave')); // blocked
    });
    await waitFor(() => {
      expect(getByTestId('dialog')).toBeTruthy();
    });
    expect(getByTestId('popup')).toBeTruthy();
    expect(router.state.location.pathname).toBe('/');

    act(() => {
      fireEvent.pointerDown(getByTestId('stay')); // outside the popup
    });
    expect(queryByTestId('popup')).toBeNull();

    act(() => {
      fireEvent.click(getByTestId('stay'));
    });
    await waitFor(() => {
      expect(queryByTestId('dialog')).toBeNull();
    });
    expect(router.state.location.pathname).toBe('/');
  });

  it('a press inside the popup while the dialog is open keeps the popup', async () => {
    const { exposed, getByTestId } = setup();
    await waitFor(() => {
      expect(exposed.ready).toBe(true);
    });
    act(() => {
      fireEvent.click(getByTestId('leave'));
    });
    await waitFor(() => {
      expect(getByTestId('dialog')).toBeTruthy();
    });

    act(() => {
      fireEvent.pointerDown(getByTestId('popup'));
    });

    expect(getByTestId('popup')).toBeTruthy();
  });
});
