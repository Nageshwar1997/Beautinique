import { NavLink } from 'react-router';

export interface NavItem {
  label: string;
  to: string;
  /** match only this exact path (the home link), not the pages below it */
  end?: boolean;
}

export interface NavListProps {
  /** The pages that exist: an app lists only those, so the nav never has a dead link. */
  items: readonly NavItem[];
  /** Name of the navigation landmark ("Main", "Footer"...), needed when a page has more than one. */
  label: string;
  className?: string;
  linkClassName?: string;
}

/**
 * A nav landmark with a list of links; the page you are on is marked `aria-current="page"`. Renders
 * nothing without items, so an app can pass its nav config before its pages exist.
 */
export function NavList({ items, label, className = '', linkClassName = '' }: NavListProps) {
  if (items.length === 0) return null;
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={`min-h-touch hover:text-foreground aria-[current=page]:text-brand-text inline-flex items-center rounded-md px-3 font-medium aria-[current=page]:underline aria-[current=page]:underline-offset-4 ${linkClassName}`}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
