import { errorMessage, useApiClient } from '@beautinique/frontend-api-client';
import { Button, Dialog, toast } from '@beautinique/frontend-components';
import { ACCESS_TOKEN_SECONDS, type AppId, SESSION_POLICIES } from '@beautinique/shared-contracts';
import { formatTime } from '@beautinique/shared-utils';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useSession, useSignOut } from './session';

/** The question comes this long before the sign-out (owner: at 28 of 30 idle minutes). */
export const IDLE_WARNING_MS = 2 * 60_000;
/**
 * A session in use is renewed (a refresh) this long before the server would end it, once there was
 * activity since the last renewal: about once in 25 minutes, so the `session` rate limit (a budget
 * per IP, and an office shares one) stays far away.
 */
export const IDLE_RENEW_MS = 5 * 60_000;
/** How often the clock is read, so at most this late after a sleeping laptop wakes. */
export const IDLE_TICK_MS = 5_000;
/** Activity is told to the app's other tabs at most this often. */
const SHARE_MS = 30_000;
/** What counts as activity: a click, a key, a scroll, a touch (not a mouse passing over). */
const ACTIVITY = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;

/** The page's idle clock (ms since 1970), kept outside React state. */
interface Clock {
  /** The last activity, here or in another tab */
  active: number;
  /** The last refresh known (a lower bound: the api-client refreshes on its own too) */
  renewed: number;
  /** When this tab last told the others of its activity */
  shared: number;
  /** The refresh on its way, if one is */
  renewing: Promise<boolean> | null;
  /** Signed out by the idle limit already */
  done: boolean;
  /** The question is open */
  asking: boolean;
}

/** Between the app's tabs: activity, a renewed session, and "signed out for being idle". */
type Message = { type: 'active' | 'renewed'; at: number } | { type: 'timed-out' };

const isMessage = (data: unknown): data is Message => {
  if (typeof data !== 'object' || data === null) return false;
  const { type, at } = data as Record<string, unknown>;
  return (
    type === 'timed-out' || ((type === 'active' || type === 'renewed') && typeof at === 'number')
  );
};

/** The sign-in page's note after an idle sign-out, for an app that has an idle limit. */
export function idleSignOutNotice(app: AppId): string | undefined {
  const idleMs = SESSION_POLICIES[app].idleMs;
  if (idleMs === undefined) return undefined;
  return `You were signed out after ${String(Math.round(idleMs / 60_000))} minutes without activity. Please sign in again.`;
}

/**
 * The internal apps' idle sign-out (ARCHITECTURE §9.2, owner 2026-10-31): identity ends their
 * sessions after 30 minutes without a refresh, so the page renews a session in use, and after 28
 * minutes without activity (in any of the app's tabs) asks "Are you still there?"; at 30 it signs
 * out, and the sign-in page says why. Nothing for an app without an idle limit (customer, seller ...)
 * or while signed out. Once, near the app's root, inside its SessionProvider.
 */
export function IdleNotice() {
  const { app, state } = useSession();
  const idleMs = SESSION_POLICIES[app].idleMs;
  if (idleMs === undefined || state.status !== 'signed-in') return null;
  return <IdleWatch app={app} idleMs={idleMs} />;
}

function IdleWatch({ app, idleMs }: { app: AppId; idleMs: number }) {
  const client = useApiClient();
  const { signOut, forget } = useSession();
  const signOutNow = useSignOut();
  /** The sign-out time while the question is open, else null. */
  const [asking, setAsking] = useState<number | null>(null);
  const [staying, setStaying] = useState(false);
  // the clock, outside React state: activity must not render anything
  const clock = useRef<Clock>({
    active: 0,
    renewed: 0,
    shared: 0,
    renewing: null,
    done: false,
    asking: false,
  });
  const channel = useRef<BroadcastChannel | null>(null);

  const post = useCallback((message: Message) => {
    channel.current?.postMessage(message);
  }, []);

  /**
   * A refresh: the server's idle clock starts again. True when the session is still there. One at
   * a time: a second ask while one is out gets its answer.
   */
  const renew = useCallback((): Promise<boolean> => {
    const watch = clock.current;
    if (watch.renewing) return watch.renewing;
    const at = Date.now();
    // false: the session is gone (the api-client tells the session, which signs this tab out)
    const renewing = client
      .refresh()
      .then((alive) => {
        if (alive) {
          watch.renewed = Math.max(watch.renewed, at);
          post({ type: 'renewed', at });
        }
        return alive;
      })
      .finally(() => {
        watch.renewing = null;
      });
    watch.renewing = renewing;
    return renewing;
  }, [client, post]);

  const timeOut = useCallback(() => {
    const watch = clock.current;
    if (watch.done) return;
    watch.done = true;
    // the other tabs first: they sign out with the same note, without asking the server again
    post({ type: 'timed-out' });
    // then this tab, at once: its note never waits for the server, which a slow answer let
    // another tab's sign-out beat (QA-FE-010); the server is asked until it hears it
    void signOut('idle');
  }, [post, signOut]);

  const tick = useCallback(() => {
    const watch = clock.current;
    if (watch.done) return;
    const at = Date.now();
    if (at >= watch.active + idleMs) {
      timeOut();
      return;
    }
    // in use since the last renewal, and the server's limit is near: renew quietly
    if (watch.active > watch.renewed && at >= watch.renewed + idleMs - IDLE_RENEW_MS) {
      renew().catch(() => undefined);
    }
    if (!watch.asking && at >= watch.active + idleMs - IDLE_WARNING_MS) {
      watch.asking = true;
      setAsking(watch.active + idleMs);
    }
  }, [idleMs, renew, timeOut]);

  useEffect(() => {
    const watch = clock.current;
    const at = Date.now();
    // being here is activity; the last refresh is not known, but it was at most one access token
    // ago (an older token would have been refreshed to load the page)
    watch.active = at;
    watch.renewed = at - ACCESS_TOKEN_SECONDS * 1000;
    if (typeof BroadcastChannel !== 'undefined') {
      const tabs = new BroadcastChannel(`bq:${app}:idle`);
      tabs.onmessage = (event: MessageEvent<unknown>) => {
        if (!isMessage(event.data)) return;
        const message = event.data;
        if (message.type === 'timed-out') {
          // here only: this one message told every tab already, with why (QA-FE-010)
          if (!watch.done) {
            watch.done = true;
            forget('idle');
          }
          return;
        }
        if (message.type === 'renewed') {
          watch.renewed = Math.max(watch.renewed, message.at);
          return;
        }
        // someone uses the app in another tab: no question here either
        if (message.at > watch.active) {
          watch.active = message.at;
          if (watch.asking) {
            watch.asking = false;
            setAsking(null);
          }
        }
      };
      channel.current = tabs;
    }
    const onActivity = () => {
      // while the question is open, only its buttons answer it
      if (watch.asking) return;
      const when = Date.now();
      watch.active = when;
      if (when - watch.shared >= SHARE_MS) {
        watch.shared = when;
        post({ type: 'active', at: when });
      }
    };
    for (const name of ACTIVITY) {
      window.addEventListener(name, onActivity, { capture: true, passive: true });
    }
    // back from a hidden tab or a sleeping laptop: look at the clock at once
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(tick, IDLE_TICK_MS);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      for (const name of ACTIVITY) window.removeEventListener(name, onActivity, { capture: true });
      channel.current?.close();
      channel.current = null;
    };
  }, [app, forget, post, tick]);

  const stay = async () => {
    setStaying(true);
    try {
      if (await renew()) {
        const watch = clock.current;
        watch.active = Date.now();
        watch.asking = false;
        setAsking(null);
        post({ type: 'active', at: watch.active });
      }
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Could not reach the server.',
        description: errorMessage(error),
      });
    } finally {
      setStaying(false);
    }
  };

  const signOutFromQuestion = async () => {
    // no idle sign-out meanwhile
    clock.current.done = true;
    // still signed in (the server did not end the session): the clock runs on, and the idle
    // sign-out still comes at the limit (QA-FE-004)
    if (!(await signOutNow())) clock.current.done = false;
  };

  return (
    <Dialog
      open={asking !== null}
      onOpenChange={() => undefined}
      dismissable={false}
      role="alertdialog"
      size="sm"
      title="Are you still there?"
      description={
        asking === null
          ? undefined
          : `For your security, you will be signed out at ${formatTime(asking)} if there is no activity.`
      }
      footer={
        <>
          <Button variant="ghost" tone="neutral" onClick={() => void signOutFromQuestion()}>
            Sign out
          </Button>
          <Button loading={staying} onClick={() => void stay()}>
            Stay signed in
          </Button>
        </>
      }
    />
  );
}
