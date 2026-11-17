import { useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { resetPendingSearch } from '../../src/router/pending-search';
import { useQueryParamInput } from '../../src/router/use-query-param-input';

// In a browser React does not render everything at once: the router's URL updates are low priority
// "transitions" that a keystroke (an urgent update) can interrupt, and an expensive page makes a
// transition render take a while. The other tests run inside `act()`, which hides all of that, so
// this one switches `act` off, renders with the real scheduler and uses a page that is slow to render.
const DELAY = 40;
const NAVIGATION_MS = 60;
const PAGE_RENDER_MS = 2;
const PAGE_PARTS = 40;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const burn = (ms: number) => {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    // busy wait: stands for an expensive render
  }
};

// One part of an expensive page. Many small ones, so React can pause between them like it does in a real page.
const PagePart = ({ search }: { search: string }) => {
  if (search) burn(PAGE_RENDER_MS);
  return null;
};

const typeSlowPage = async (seed: number) => {
  let state = seed * 7919;
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  const exposed: { input?: ReturnType<typeof useQueryParamInput> } = {};
  const committed: string[] = [];

  const Page = () => {
    const input = useQueryParamInput('search', { delay: DELAY });
    const location = useLocation();

    // what the test sees is what React has committed, never a render that was thrown away
    useLayoutEffect(() => {
      exposed.input = input;
      committed.push(input.value);
    });

    return Array.from({ length: PAGE_PARTS }, (_, index) => (
      <PagePart key={index} search={location.search} />
    ));
  };

  const router = createMemoryRouter(
    [
      {
        path: '*',
        Component: Page,
        loader: async () => {
          await sleep(NAVIGATION_MS);
          return null;
        },
      },
    ],
    { initialEntries: ['/products'] },
  );

  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  root.render(<RouterProvider router={router} />);

  // wait until the page has really mounted (a state update on a component that has not mounted yet is lost)
  while (!router.state.initialized || committed.length === 0) await sleep(10);
  await sleep(50);

  // A real user: every keystroke is added to what the box shows right now, 0-90ms apart.
  const expected = 'abcdefghijklmnopqrst';
  for (const char of expected) {
    const current = exposed.input;
    if (!current) throw new Error('the page is not rendered');

    // like a real input event: React renders it before the next keystroke
    flushSync(() => {
      current.setValue(current.value + char);
    });
    await sleep(Math.floor(random() * 90));
  }
  await sleep(DELAY * 3 + NAVIGATION_MS * 3 + 300);

  const finalValue = exposed.input?.value;
  const urlText = new URLSearchParams(router.state.location.search).get('search');
  root.unmount();
  container.remove();

  return { expected, finalValue, urlText, committed };
};

describe('useQueryParamInput on a page that is slow to render (real React scheduling)', () => {
  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
  });

  afterAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    resetPendingSearch();
  });

  it.each([1, 2, 3])(
    'fast typing (seed %i): no keystroke is lost and the box never shows older text',
    async (seed) => {
      const { expected, finalValue, urlText, committed } = await typeSlowPage(seed);

      expect(finalValue).toBe(expected);
      expect(urlText).toBe(expected);

      // whatever the box showed, it never got shorter while the user only added letters
      const lengths = committed.map((value) => value.length);
      expect(lengths).toEqual([...lengths].sort((a, b) => a - b));
    },
    30_000,
  );
});
