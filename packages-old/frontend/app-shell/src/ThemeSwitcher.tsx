import { IconMonitor, IconMoon, IconSun } from '@beautinique/frontend-icons';
import { useId, useSyncExternalStore } from 'react';

import {
  currentThemeChoice,
  setThemeChoice,
  subscribeThemeChoice,
  THEME_SCRIPT,
  type ThemeChoice,
} from './theme';

const OPTIONS = [
  { value: 'light', label: 'Light theme', Icon: IconSun },
  { value: 'dark', label: 'Dark theme', Icon: IconMoon },
  { value: 'system', label: 'Use the system setting', Icon: IconMonitor },
] as const satisfies readonly { value: ThemeChoice; label: string; Icon: unknown }[];

/**
 * The theme choice and a way to change it. The server and the first client render say `system`
 * (the server cannot know the choice), then the saved one, so hydration always matches.
 */
export function useThemeChoice(): [ThemeChoice, (choice: ThemeChoice) => void] {
  const choice = useSyncExternalStore(
    subscribeThemeChoice,
    currentThemeChoice,
    (): ThemeChoice => 'system',
  );
  return [choice, setThemeChoice];
}

export interface ThemeSwitcherProps {
  className?: string;
}

/**
 * Light, dark or the system's: a radio group (arrow keys move, the label says which), icons with
 * hidden names, every option a 44 px target. Changes the theme at once and remembers it.
 */
export function ThemeSwitcher({ className = '' }: ThemeSwitcherProps) {
  const [choice, setChoice] = useThemeChoice();
  const name = useId();
  return (
    <fieldset
      className={`border-border bg-surface-muted inline-flex items-center gap-0.5 rounded-full border p-0.5 ${className}`}
    >
      <legend className="sr-only">Theme</legend>
      {OPTIONS.map(({ value, label, Icon }) => (
        <label
          key={value}
          title={label}
          className="text-foreground-muted hover:text-foreground has-checked:bg-surface has-checked:text-brand-text has-checked:shadow-xs focus-ring-within inline-flex size-touch cursor-pointer items-center justify-center rounded-full"
        >
          <input
            type="radio"
            name={name}
            value={value}
            checked={choice === value}
            onChange={() => {
              setChoice(value);
            }}
            className="sr-only"
          />
          <Icon size={20} />
          <span className="sr-only">{label}</span>
        </label>
      ))}
    </fieldset>
  );
}

/**
 * Put first in `<head>` of a server-rendered app: applies the saved theme before the first paint.
 * Give `<html>` `suppressHydrationWarning`, because this script sets its `theme` attribute. A CSP
 * allows it with THEME_SCRIPT_HASH.
 */
export function ThemeScript() {
  // a fixed string from this package, never user input
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
