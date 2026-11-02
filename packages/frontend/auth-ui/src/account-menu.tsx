import { errorMessage } from '@beautinique/frontend-api-client';
import { cx, toast } from '@beautinique/frontend-components';
import {
  Button as AriaButton,
  Header,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Popover,
  Separator,
} from 'react-aria-components';
import { Link, useLocation } from 'react-router';

import { AUTH_PATHS, authHref } from './next';
import { useSession } from './session';

/** The header's account control is this wide in every state, so nothing moves when it changes. */
const SLOT = 'inline-flex min-h-touch min-w-22 items-center justify-end';

/** The "Sign in" link, looking like a small solid brand button (a link that looks like a button). */
const SIGN_IN_LINK =
  'tone-brand bg-tone text-tone-foreground hover:bg-tone-hover focus-ring inline-flex min-h-9 touch-target items-center rounded-full px-4 text-sm font-medium whitespace-nowrap';

const ITEM =
  'text-foreground data-focused:bg-surface-muted min-h-touch flex cursor-pointer items-center rounded-lg px-3 text-sm outline-hidden';

export interface AccountMenuProps {
  /** Pages of the account (Security, My Devices ...), above "Sign out". */
  links?: readonly { href: string; label: string }[];
}

/**
 * The header's account control, in every app: a placeholder of the same size until the session is
 * known (pages render on the server without it, owner 2026-11-02), "Sign in" for someone signed
 * out (it brings them back here), and for someone signed in a menu with their email, the account's
 * pages and "Sign out".
 */
export function AccountMenu({ links = [] }: AccountMenuProps) {
  const { state, signOut } = useSession();
  const location = useLocation();
  if (state.status === 'signed-out') {
    const here = `${location.pathname}${location.search}`;
    return (
      <span className={SLOT}>
        <Link to={authHref(AUTH_PATHS.signIn, here)} className={SIGN_IN_LINK}>
          Sign in
        </Link>
      </span>
    );
  }
  if (state.status !== 'signed-in') return <span aria-hidden="true" className={SLOT} />;
  const { email } = state.user;
  const signOutNow = async () => {
    try {
      await signOut();
      toast({ tone: 'success', title: 'You are signed out.' });
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Signing out did not finish.',
        description: errorMessage(error),
      });
    }
  };
  return (
    <span className={SLOT}>
      <MenuTrigger>
        <AriaButton
          aria-label={`Account (${email})`}
          className="tone-brand bg-tone-subtle text-tone-subtle-foreground focus-ring inline-flex size-touch cursor-pointer items-center justify-center rounded-full text-base font-semibold uppercase outline-hidden"
        >
          <span aria-hidden="true">{email.slice(0, 1)}</span>
        </AriaButton>
        <Popover
          placement="bottom end"
          offset={6}
          className="bg-surface text-foreground border-border data-entering:animate-fade-in data-exiting:animate-fade-out w-64 max-w-[calc(100vw-2rem)] rounded-xl border p-1 shadow-lg outline-hidden"
        >
          <Menu className="outline-hidden">
            <MenuSection>
              <Header className="text-foreground-muted px-3 py-2 text-xs">
                Signed in as
                <span className="text-foreground block truncate text-sm font-medium">{email}</span>
              </Header>
            </MenuSection>
            <Separator className="border-border my-1 border-t" />
            {links.map((link) => (
              <MenuItem key={link.href} href={link.href} className={ITEM}>
                {link.label}
              </MenuItem>
            ))}
            <MenuItem
              className={cx(ITEM)}
              onAction={() => {
                void signOutNow();
              }}
            >
              Sign out
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
    </span>
  );
}
