/** What the person picked: a fixed theme, or whatever their system uses. */
export type ThemeChoice = 'light' | 'dark' | 'system';

export const THEME_CHOICES: readonly ThemeChoice[] = ['light', 'dark', 'system'];

/** localStorage key of the choice (per app host, so each app remembers its own). */
export const THEME_STORAGE_KEY = 'bq-theme';

/**
 * Runs in `<head>` before the first paint and puts the saved theme on `<html theme>`, so a dark-theme
 * reader never sees a light flash. Without a saved choice the attribute stays off and the styles
 * follow the system (`@beautinique/frontend-styles`). The HTML stays the same for everyone, so a CDN
 * can cache it. Keep in step with THEME_SCRIPT_HASH (a test checks it).
 */
export const THEME_SCRIPT =
  'try{var t=localStorage.getItem("bq-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("theme",t)}catch(e){}';

/** CSP `script-src` source that allows exactly THEME_SCRIPT (no `unsafe-inline`). */
export const THEME_SCRIPT_HASH = "'sha256-D0UNd/BsEh6WXfW8pk8jcZYDdJqZb073ht9O+yOFmBY='";

const isChoice = (value: unknown): value is ThemeChoice =>
  value === 'light' || value === 'dark' || value === 'system';

/** The saved choice; `system` when there is none, or storage is blocked (private mode, policies). */
export function readThemeChoice(): ThemeChoice {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return isChoice(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

const listeners = new Set<() => void>();
// the latest choice on this page; storage alone cannot say it when storage is blocked
let current: ThemeChoice | undefined;

/** The choice as the page shows it (on the server, and before the first read: `system`). */
export function currentThemeChoice(): ThemeChoice {
  current ??= readThemeChoice();
  return current;
}

/** Calls `listener` when the choice changes here or in another tab of the same app. */
export function subscribeThemeChoice(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      current = readThemeChoice();
      applyAttribute(current);
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function applyAttribute(choice: ThemeChoice): void {
  const html = document.documentElement;
  // one frame where nothing animates, so every colour changes at once (frontend-styles base.css)
  html.setAttribute('theme-switching', '');
  if (choice === 'system') html.removeAttribute('theme');
  else html.setAttribute('theme', choice);
  // after the next paint (two frames); a page without frames (hidden tab, tests) uses a timer
  const nextFrame =
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (callback: () => void) => setTimeout(callback, 16);
  nextFrame(() => {
    nextFrame(() => {
      html.removeAttribute('theme-switching');
    });
  });
}

/** Puts the choice on `<html>` now and saves it (storage may be blocked: then it lasts for this page). */
export function setThemeChoice(choice: ThemeChoice): void {
  applyAttribute(choice);
  try {
    if (choice === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // private mode or blocked storage: the theme still changes for this page
  }
  current = choice;
  for (const listener of listeners) listener();
}
