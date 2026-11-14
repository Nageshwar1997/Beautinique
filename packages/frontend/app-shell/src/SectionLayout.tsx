import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

import type { NavItem } from './NavList';

export interface SectionLayoutProps {
  /** The section's name ("Staff"): its nav landmark's name, and the sidebar's heading */
  title: string;
  /** The section's pages that exist (an app filters them by what the person may see first) */
  items: readonly NavItem[];
  children: ReactNode;
}

/**
 * A section of a data-dense app (DESIGN §10: sidebar nav): its pages in a sidebar from a tablet's
 * width up, a row of links above the page on a phone, the page beside or under them. One nav
 * landmark, named by the section; the page you are on is marked `aria-current="page"`. Without
 * items it is the page alone.
 */
export function SectionLayout({ title, items, children }: SectionLayoutProps) {
  return (
    <div className="container-page py-6 sm:py-8 md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8">
      {items.length > 0 && (
        <nav aria-label={title} className="mb-6 md:mb-0">
          <p className="text-foreground-muted mb-2 hidden px-3 text-xs font-medium tracking-wide uppercase md:block">
            {title}
          </p>
          <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {items.map((item) => (
              <li key={item.to} className="shrink-0">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className="min-h-touch hover:bg-surface-muted aria-[current=page]:bg-brand-subtle aria-[current=page]:text-brand-subtle-foreground flex items-center rounded-md px-3 font-medium"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
