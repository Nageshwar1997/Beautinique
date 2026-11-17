import { useEffect, useLayoutEffect, useRef } from 'react';
import { type Blocker, type BlockerFunction, useBlocker } from 'react-router';

export interface BlockerGateProps {
  /** `true` blocks every navigation (search-param updates too); a function decides per navigation. */
  block: boolean | BlockerFunction;
  /** Receives the router's blocker every time it changes, so a test can `proceed()` or `reset()` it. */
  onBlocker: (blocker: Blocker) => void;
  /**
   * Called once the router really has the blocker. `useBlocker` needs two renders for that (the first
   * only creates its key, the second registers it in an effect), so right after the page has rendered
   * a navigation is still not blocked. A test has to wait for this before navigating.
   */
  onReady: () => void;
}

/**
 * Test-only stand-in for an app page that guards unsaved changes with `useBlocker` (the apps do not
 * have one today). Never export this from the package: hooks must not register a blocker themselves,
 * because a router only runs one - the last one registered.
 */
export const BlockerGate = ({ block, onBlocker, onReady }: BlockerGateProps) => {
  const blocker = useBlocker(block);
  const renders = useRef(0);

  useLayoutEffect(() => {
    onBlocker(blocker);
  });

  // declared after `useBlocker`, so in the second render it runs after the blocker was registered
  useEffect(() => {
    renders.current += 1;

    if (renders.current >= 2) onReady();
  });

  return null;
};
