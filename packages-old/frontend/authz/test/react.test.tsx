import type { SessionState } from '@beautinique/frontend-auth-ui';
import { render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type Access,
  Can,
  NO_ACCESS,
  RequirePermission,
  useAccess,
  usePermission,
  useVisible,
} from '../src';

// the session, as auth-ui's SessionProvider gives it: the tests set it
let state: SessionState = { status: 'loading' };
vi.mock('@beautinique/frontend-auth-ui', () => ({ useSession: () => ({ state }) }));

const MASTER: Access = {
  roles: [{ role: 'master.master', name: 'Master', scope: { type: 'global', ids: [] } }],
  permissions: [
    'iam.app.sign_in',
    'iam.grant.manage',
    'iam.grant.read',
    'iam.role.manage',
    'iam.totp.reset',
  ],
};
const AUDITOR: Access = {
  roles: [
    {
      role: 'master.internal_auditor',
      name: 'Internal Auditor',
      scope: { type: 'global', ids: [] },
    },
  ],
  permissions: ['iam.app.sign_in', 'iam.grant.read'],
};

const signedIn = (access: Access) => {
  state = { status: 'signed-in', access } as unknown as SessionState;
};

beforeEach(() => {
  state = { status: 'loading' };
});

describe('useAccess', () => {
  it('is nothing while the session is unknown, or signed out', () => {
    expect(renderHook(() => useAccess()).result.current).toBe(NO_ACCESS);
    state = { status: 'signed-out' };
    expect(renderHook(() => useAccess()).result.current).toBe(NO_ACCESS);
  });

  it('is the session’s access once signed in', () => {
    signedIn(MASTER);
    expect(renderHook(() => useAccess()).result.current).toBe(MASTER);
  });
});

describe('usePermission and useVisible', () => {
  it('answer from the session’s keys', () => {
    signedIn(AUDITOR);
    expect(renderHook(() => usePermission('iam.grant.read')).result.current).toBe(true);
    expect(renderHook(() => usePermission('iam.grant.manage')).result.current).toBe(false);
    expect(
      renderHook(() => usePermission(['iam.grant.manage', 'iam.grant.read'], { match: 'any' }))
        .result.current,
    ).toBe(true);
    const nav = [
      { label: 'Staff', permission: 'iam.grant.read' },
      { label: 'Roles', permission: 'iam.role.manage' },
    ];
    expect(renderHook(() => useVisible(nav)).result.current.map((item) => item.label)).toEqual([
      'Staff',
    ]);
  });
});

describe('Can', () => {
  it('shows its children to an account that holds the key, else the fallback or nothing', () => {
    signedIn(MASTER);
    const { rerender } = render(
      <Can permission="iam.role.manage" fallback={<p>Not for you</p>}>
        <button type="button">New sub-role</button>
      </Can>,
    );
    expect(screen.getByRole('button', { name: 'New sub-role' })).toBeDefined();
    signedIn(AUDITOR);
    rerender(
      <Can permission="iam.role.manage" fallback={<p>Not for you</p>}>
        <button type="button">New sub-role</button>
      </Can>,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Not for you')).toBeDefined();
    rerender(
      <Can permission="iam.role.manage">
        <button type="button">New sub-role</button>
      </Can>,
    );
    expect(screen.queryByText('Not for you')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('takes any one of several keys with match any', () => {
    signedIn(AUDITOR);
    render(
      <Can permission={['iam.totp.reset', 'iam.grant.read']} match="any">
        <p>Seen</p>
      </Can>,
    );
    expect(screen.getByText('Seen')).toBeDefined();
  });
});

describe('RequirePermission', () => {
  it('opens the page for an account that holds the key, else the denied page', () => {
    signedIn(AUDITOR);
    const { rerender } = render(
      <RequirePermission permission="iam.grant.read" denied={<h1>Not for your role</h1>}>
        <h1>Staff</h1>
      </RequirePermission>,
    );
    expect(screen.getByRole('heading', { name: 'Staff' })).toBeDefined();
    rerender(
      <RequirePermission permission="iam.role.manage" denied={<h1>Not for your role</h1>}>
        <h1>Roles</h1>
      </RequirePermission>,
    );
    expect(screen.getByRole('heading', { name: 'Not for your role' })).toBeDefined();
    expect(screen.queryByRole('heading', { name: 'Roles' })).toBeNull();
  });
});
