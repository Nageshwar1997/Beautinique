import {
  IconCheckCircle,
  IconClose,
  IconDanger,
  IconInfo,
  IconWarning,
} from '@beautinique/frontend-icons';
import { AnimatePresence, LazyMotion, m, MotionConfig } from 'motion/react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { Button } from './button';
import { cx, TONE_CLASS } from './cx';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  /** @default 'info' */
  tone?: ToastTone;
  /** One short sentence: what happened. */
  title: string;
  description?: string;
  /**
   * ms before it goes by itself; null = until dismissed. Default: 5 s (success, info), 7 s
   * (warning), until dismissed (error: nobody should miss one).
   */
  duration?: number | null;
  /** One follow-up, e.g. "Undo" (the toast goes when it is pressed). */
  action?: { label: string; onAction: () => void };
  /** A toast with the id of one on screen replaces it (e.g. one "You are offline" at a time). */
  id?: string;
}

export interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  duration: number | null;
  action?: { label: string; onAction: () => void };
}

const DEFAULT_DURATION: Readonly<Record<ToastTone, number | null>> = {
  success: 5000,
  info: 5000,
  warning: 7000,
  error: null,
};

/** How many show at once; the rest wait their turn. */
export const VISIBLE_TOASTS = 3;

let items: readonly ToastItem[] = [];
const listeners = new Set<() => void>();
let counter = 0;

const emit = () => {
  for (const listener of listeners) listener();
};

/**
 * Shows a toast in the app's `<Toaster>` (anywhere, also outside React: an API client, a store).
 * Returns its id, for `dismissToast`.
 *
 * ```ts
 * toast({ tone: 'success', title: 'Address saved' });
 * toast({ tone: 'error', title: 'Could not save', description: 'Please try again.' });
 * ```
 */
export function toast(options: ToastOptions): string {
  const tone = options.tone ?? 'info';
  counter += 1;
  const id = options.id ?? `toast-${String(counter)}`;
  const item: ToastItem = {
    id,
    tone,
    title: options.title,
    ...(options.description === undefined ? {} : { description: options.description }),
    duration: options.duration === undefined ? DEFAULT_DURATION[tone] : options.duration,
    ...(options.action === undefined ? {} : { action: options.action }),
  };
  items = [...items.filter((existing) => existing.id !== id), item];
  emit();
  return id;
}

/** Takes a toast away (nothing when it is gone already). */
export function dismissToast(id: string): void {
  if (!items.some((item) => item.id === id)) return;
  items = items.filter((item) => item.id !== id);
  emit();
}

/** Takes every toast away (e.g. on sign-out). */
export function clearToasts(): void {
  if (items.length === 0) return;
  items = [];
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const NONE: readonly ToastItem[] = [];

const loadFeatures = () => import('./motion-features').then((module) => module.default);

const ICON = {
  success: IconCheckCircle,
  error: IconDanger,
  warning: IconWarning,
  info: IconInfo,
} as const;

const TONE: Readonly<Record<ToastTone, keyof typeof TONE_CLASS>> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

/** A swipe this far (px), or this fast (px/s), sideways dismisses. */
const SWIPE_DISTANCE = 80;
const SWIPE_SPEED = 500;

function ToastCard({ item, paused }: { item: ToastItem; paused: boolean }) {
  const remaining = useRef(item.duration);

  useEffect(() => {
    if (remaining.current === null || paused) return undefined;
    const started = Date.now();
    const timer = setTimeout(() => {
      dismissToast(item.id);
    }, remaining.current);
    return () => {
      clearTimeout(timer);
      if (remaining.current !== null) {
        remaining.current = Math.max(0, remaining.current - (Date.now() - started));
      }
    };
  }, [paused, item.id]);

  const Icon = ICON[item.tone];
  return (
    <m.li
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.6}
      onDragEnd={(_event, info) => {
        if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_SPEED) {
          dismissToast(item.id);
        }
      }}
      className={cx(
        'bg-surface text-foreground border-border pointer-events-auto flex w-full touch-pan-y items-start gap-3 rounded-xl border p-4 shadow-lg',
        TONE_CLASS[TONE[item.tone]],
      )}
    >
      <Icon aria-hidden="true" className="text-tone-subtle-foreground mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.title}</p>
        {item.description !== undefined && (
          <p className="text-foreground-muted mt-0.5 text-sm">{item.description}</p>
        )}
        {item.action !== undefined && (
          <Button
            variant="soft"
            size="sm"
            className="mt-2"
            onClick={() => {
              item.action?.onAction();
              dismissToast(item.id);
            }}
          >
            {item.action.label}
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        tone="neutral"
        size="sm"
        icon={<IconClose size={16} />}
        aria-label={`Dismiss: ${item.title}`}
        onClick={() => {
          dismissToast(item.id);
        }}
        className="-me-1 -mt-1"
      />
    </m.li>
  );
}

const announcement = (item: ToastItem) =>
  item.description === undefined ? item.title : `${item.title}. ${item.description}`;

/**
 * Where toasts show: put one at the root of the app. A `Notifications` landmark; screen readers
 * hear each new toast once (errors at once, the rest politely), from live regions that are always
 * there. The newest is at the bottom, three at most; hovering or focusing them stops their clocks;
 * a sideways swipe dismisses one. Motion animates them (none with reduced motion).
 */
export function Toaster() {
  const shown = useSyncExternalStore(
    subscribe,
    () => items,
    () => NONE,
  );
  const [paused, setPaused] = useState(false);
  const [spoken, setSpoken] = useState({ polite: '', assertive: '' });
  const seen = useRef(new Set<string>());

  // what is new since the last render: read out once, from the region that matches its tone
  useEffect(() => {
    const fresh = shown.filter((item) => !seen.current.has(item.id));
    seen.current = new Set(shown.map((item) => item.id));
    if (fresh.length === 0) return undefined;
    const polite = fresh
      .filter((item) => item.tone !== 'error')
      .map(announcement)
      .join(' ');
    const assertive = fresh
      .filter((item) => item.tone === 'error')
      .map(announcement)
      .join(' ');
    // emptied first, so the same words twice are read twice
    setSpoken({ polite: '', assertive: '' });
    const timer = setTimeout(() => {
      setSpoken({ polite, assertive });
    }, 100);
    return () => {
      clearTimeout(timer);
    };
  }, [shown]);

  const visible = shown.slice(-VISIBLE_TOASTS);
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <section
          aria-label="Notifications"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex justify-center p-4 sm:justify-end"
          onMouseEnter={() => {
            setPaused(true);
          }}
          onMouseLeave={() => {
            setPaused(false);
          }}
          onFocus={() => {
            setPaused(true);
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
          }}
        >
          <ol className="flex w-full max-w-sm flex-col gap-2">
            <AnimatePresence initial={false}>
              {visible.map((item) => (
                <ToastCard key={item.id} item={item} paused={paused} />
              ))}
            </AnimatePresence>
          </ol>
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {spoken.polite}
          </div>
          <div className="sr-only" aria-live="assertive" aria-atomic="true">
            {spoken.assertive}
          </div>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}
