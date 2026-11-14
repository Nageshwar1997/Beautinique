import {
  type ApiError,
  errorMessage,
  queryKeyPrefix,
  useApiMutation,
  useApiQuery,
} from '@beautinique/frontend-api-client';
import { useSession } from '@beautinique/frontend-auth-ui';
import { Can, roleKeysOf, useAccess, usePermission } from '@beautinique/frontend-authz';
import { Badge, Button, Dialog, Input, Select, toast } from '@beautinique/frontend-components';
import { type Column, CursorPager, DataTable, useTableUrl } from '@beautinique/frontend-data-table';
import {
  type AppId,
  endGrant,
  endUserSessions,
  listGrants,
  listRoles,
  resetAuthenticator,
  type RouteOutput,
} from '@beautinique/shared-contracts';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { pageTitle } from '../nav';
import { Confirm } from './confirm';
import { APP_NAMES, APP_OPTIONS, grantState, scopeText, validityText, VIA_NAMES } from './labels';
import { givesRole, RoleForm, type RoleView } from './role-form';

type Grant = RouteOutput<typeof listGrants>['items'][number];

const PAGE_SIZE = 25;
const FILTERS = { email: '', app: '', role: '', status: 'active' } as const;

/** Role names by key, for every list on the Staff pages (one read, cached). */
export function useRoleNames() {
  const roles = useApiQuery(listRoles, { query: {} }, { staleTime: 60_000 });
  const byKey = new Map((roles.data?.roles ?? []).map((role) => [role.key, role]));
  return {
    roles: roles.data?.roles ?? [],
    byKey,
    nameOf: (key: string) => byKey.get(key)?.name ?? key,
    status: roles.isPending
      ? ('loading' as const)
      : roles.isError
        ? ('error' as const)
        : ('ready' as const),
    error: roles.error,
    retry: () => void roles.refetch(),
  };
}

const STATE_BADGE = {
  active: { label: 'Active', tone: 'success' },
  scheduled: { label: 'Starts later', tone: 'info' },
  lapsed: { label: 'Ran out', tone: 'warning' },
  ended: { label: 'Ended', tone: 'neutral' },
} as const;
const statusBadge = (grant: Grant) => {
  const { label, tone } = STATE_BADGE[grantState(grant)];
  return <Badge tone={tone}>{label}</Badge>;
};
// a whole email address: the API finds a person by it (a part of one is refused)
const WHOLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Staff (PRD §5.5, TASKS T3.7): the roles people hold that the signed-in person may see (the
 * roles they give, in their scope; a Security Officer or Internal Auditor, every role), found by
 * email, app, role and status, a page at a time, the filters in the URL. A row opens the person:
 * their roles, giving another, ending one, and the Security Officer's actions.
 */
export function PeoplePage() {
  const url = useTableUrl({ filters: FILTERS });
  const { roles, nameOf } = useRoleNames();
  const [open, setOpen] = useState<Grant | null>(null);
  const [inviting, setInviting] = useState(false);
  const { email, app, role, status } = url.filters;
  const grants = useApiQuery(
    listGrants,
    {
      query: {
        limit: PAGE_SIZE,
        status: status === 'ended' ? 'ended' : 'active',
        ...(email === '' ? {} : { email }),
        ...(app === '' ? {} : { app: app as AppId }),
        ...(role === '' ? {} : { role }),
        ...(url.cursor === undefined ? {} : { cursor: url.cursor }),
      },
    },
    { placeholderData: keepPreviousData },
  );
  // the email being typed: in the URL only as a whole address (adjusted when the URL changes)
  const [draft, setDraft] = useState(email);
  const [shown, setShown] = useState(email);
  const [emailError, setEmailError] = useState<string | null>(null);
  if (email !== shown) {
    setShown(email);
    setDraft(email);
  }
  const applyEmail = () => {
    const value = draft.trim().toLowerCase();
    if (value !== '' && !WHOLE_EMAIL.test(value)) {
      setEmailError('Enter the whole email address');
      return;
    }
    setEmailError(null);
    if (value !== email) url.setFilters({ email: value });
  };

  const columns: Column<Grant>[] = [
    { key: 'email', header: 'Email', cell: (g) => g.email, primary: true },
    { key: 'role', header: 'Role', cell: (g) => nameOf(g.role) },
    { key: 'app', header: 'App', cell: (g) => APP_NAMES[g.app] },
    { key: 'scope', header: 'Where', cell: (g) => scopeText(g.scope) },
    { key: 'valid', header: 'Valid', cell: (g) => validityText(g.validFrom, g.validTo) },
    { key: 'via', header: 'How', cell: (g) => VIA_NAMES[g.via], hideOnCard: true },
    { key: 'status', header: 'Status', cell: statusBadge },
  ];
  const roleOptions = roles
    .filter((r) => app !== '' && r.app === app)
    .map((r) => ({ value: r.key, label: r.name }));

  return (
    <div className="space-y-6">
      <title>{pageTitle('Staff')}</title>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-medium">People</h1>
        <Can permission="iam.grant.manage">
          <Button
            onClick={() => {
              setInviting(true);
            }}
          >
            Invite someone
          </Button>
        </Can>
      </div>
      <form
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          applyEmail();
        }}
      >
        <Input
          name="email"
          label="Email"
          type="email"
          hint="The whole address, then Enter"
          value={draft}
          error={emailError ?? undefined}
          onChange={(event) => {
            setDraft(event.currentTarget.value);
          }}
          onBlur={applyEmail}
        />
        <Select
          label="App"
          placeholder="Every app"
          clearable
          options={APP_OPTIONS}
          value={app === '' ? null : app}
          onChange={(value) => {
            url.setFilters({ app: value ?? '', role: '' });
          }}
        />
        <Select
          label="Role"
          placeholder={app === '' ? 'Choose an app first' : 'Every role'}
          clearable
          isDisabled={app === ''}
          options={roleOptions}
          value={role === '' ? null : role}
          onChange={(value) => {
            url.setFilters({ role: value ?? '' });
          }}
        />
        <Select
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'ended', label: 'Ended' },
          ]}
          value={status}
          onChange={(value) => {
            url.setFilters({ status: value ?? 'active' });
          }}
        />
      </form>
      {url.filtered && (
        <Button variant="ghost" tone="neutral" size="sm" onClick={url.clearFilters}>
          Clear filters
        </Button>
      )}
      <DataTable
        label="Staff"
        columns={columns}
        rows={grants.data?.items ?? []}
        rowKey={(g) => g.grantId}
        status={grants.isPending ? 'loading' : grants.isError ? 'error' : 'ready'}
        refreshing={grants.isPlaceholderData}
        errorMessage={grants.error ? errorMessage(grants.error) : undefined}
        onRetry={() => void grants.refetch()}
        empty={
          url.page > 1
            ? 'No more on this page.'
            : url.filtered
              ? 'No one matches these filters.'
              : 'No staff yet.'
        }
        onOpen={setOpen}
        openLabel={(g) => `${g.email}, ${nameOf(g.role)}`}
        openKey={open?.grantId ?? null}
        footer={
          <CursorPager
            page={url.page}
            nextCursor={grants.data?.nextCursor ?? null}
            onNext={url.next}
            onPrevious={url.previous}
            busy={grants.isFetching}
          />
        }
      />
      {open !== null && (
        <PersonPanel
          person={{ userId: open.userId, email: open.email }}
          onClose={() => {
            setOpen(null);
          }}
        />
      )}
      {inviting && <RoleForm open onOpenChange={setInviting} mode={{ kind: 'invite' }} />}
    </div>
  );
}

interface PersonPanelProps {
  person: { userId: string; email: string };
  onClose: () => void;
}

/**
 * One person (a side panel): every active role of theirs the signed-in person may see, ending
 * one they give, giving another, and the Security Officer's reset and sign-out. Never on one's
 * own account (the server refuses it too).
 */
function PersonPanel({ person, onClose }: PersonPanelProps) {
  const { state } = useSession();
  const access = useAccess();
  const mine = roleKeysOf(access);
  const { byKey, nameOf } = useRoleNames();
  const queryClient = useQueryClient();
  const self = state.status === 'signed-in' && state.user.userId === person.userId;
  const canGive = usePermission('iam.grant.manage') && !self;
  const [giving, setGiving] = useState(false);
  const [ending, setEnding] = useState<Grant | null>(null);
  const [asking, setAsking] = useState<'reset' | 'sessions' | null>(null);
  const theirs = useApiQuery(listGrants, {
    query: { userId: person.userId, status: 'active', limit: 100 },
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeyPrefix('iam') });
  const failed = (title: string) => (error: ApiError) => {
    toast({ tone: 'error', title, description: errorMessage(error) });
  };
  const end = useApiMutation(endGrant, { onError: failed('The role was not ended.') });
  const reset = useApiMutation(resetAuthenticator, {
    onError: failed('The authenticator was not reset.'),
  });
  const signOut = useApiMutation(endUserSessions, {
    onError: failed('Their sessions were not ended.'),
  });
  // a Master's authenticator only another Master resets (QA DR-007): no button that always fails
  const holdsMaster = theirs.data?.items.some((grant) => grant.role === 'master.master') ?? false;
  const canReset = !holdsMaster || mine.includes('master.master');
  const canEnd = (grant: Grant) => {
    const role: RoleView | undefined = byKey.get(grant.role);
    return !self && role !== undefined && givesRole(role, mine);
  };

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={person.email}
      description={self ? 'Your own account: change it from your account pages.' : undefined}
      placement="side"
    >
      <div className="space-y-6">
        <section aria-labelledby="their-roles" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 id="their-roles" className="font-medium">
              Roles
            </h3>
            {canGive && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setGiving(true);
                }}
              >
                Give another role
              </Button>
            )}
          </div>
          {theirs.isPending ? (
            <p className="text-foreground-muted text-sm">Loading their roles…</p>
          ) : theirs.isError ? (
            <p role="alert" className="text-sm">
              {errorMessage(theirs.error)}
            </p>
          ) : (
            <ul className="divide-border border-border divide-y rounded-xl border">
              {theirs.data.items.map((grant) => (
                <li key={grant.grantId} className="flex items-start justify-between gap-3 p-3">
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">{nameOf(grant.role)}</p>
                    <p className="text-foreground-muted">
                      {APP_NAMES[grant.app]} · {scopeText(grant.scope)} ·{' '}
                      {validityText(grant.validFrom, grant.validTo)}
                    </p>
                  </div>
                  {canEnd(grant) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      tone="error"
                      aria-label={`End ${nameOf(grant.role)} for ${person.email}`}
                      onClick={() => {
                        setEnding(grant);
                      }}
                    >
                      End
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        {!self && (
          <Can permission={['iam.totp.reset', 'iam.session.revoke']} match="any">
            <section aria-labelledby="their-security" className="space-y-3">
              <h3 id="their-security" className="font-medium">
                Security
              </h3>
              <div className="flex flex-wrap gap-3">
                <Can permission="iam.totp.reset">
                  {canReset && (
                    <Button
                      size="sm"
                      variant="outline"
                      tone="error"
                      onClick={() => {
                        setAsking('reset');
                      }}
                    >
                      Reset authenticator
                    </Button>
                  )}
                </Can>
                <Can permission="iam.session.revoke">
                  <Button
                    size="sm"
                    variant="outline"
                    tone="error"
                    onClick={() => {
                      setAsking('sessions');
                    }}
                  >
                    End all sessions
                  </Button>
                </Can>
              </div>
            </section>
          </Can>
        )}
      </div>

      {canGive && giving && (
        <RoleForm
          open
          onOpenChange={setGiving}
          mode={{ kind: 'give', userId: person.userId, email: person.email }}
        />
      )}
      <Confirm
        open={ending !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEnding(null);
        }}
        title={`End ${ending === null ? 'this role' : nameOf(ending.role)}?`}
        action="End role"
        busy={end.isPending}
        onConfirm={() => {
          if (ending === null) return;
          end.mutate(
            { params: { grantId: ending.grantId } },
            {
              onSuccess: () => {
                toast({
                  tone: 'success',
                  title: `${nameOf(ending.role)} ended for ${person.email}.`,
                });
                setEnding(null);
                void refresh();
              },
            },
          );
        }}
      >
        <p>
          {person.email} loses it in {ending === null ? 'its app' : APP_NAMES[ending.app]} at once:
          their next call there signs them out if it was their only role there. It stays in the
          ended list.
        </p>
      </Confirm>
      <Confirm
        open={asking === 'reset'}
        onOpenChange={(isOpen) => {
          if (!isOpen) setAsking(null);
        }}
        title="Reset their authenticator?"
        action="Reset authenticator"
        busy={reset.isPending}
        onConfirm={() => {
          reset.mutate(
            { params: { userId: person.userId } },
            {
              onSuccess: ({ reset: done, sessionsEnded }) => {
                toast(
                  done
                    ? {
                        tone: 'success',
                        title: `Authenticator reset for ${person.email}.`,
                        description: `${String(sessionsEnded)} session(s) ended; they set up a new one at their next sign-in.`,
                      }
                    : {
                        tone: 'info',
                        title: `${person.email} has no authenticator; nothing changed.`,
                      },
                );
                setAsking(null);
                void refresh();
              },
            },
          );
        }}
      >
        <p>
          Their authenticator and recovery codes stop working, every session of theirs ends and they
          are emailed. Only for a lost phone, after checking it is really them.
        </p>
      </Confirm>
      <Confirm
        open={asking === 'sessions'}
        onOpenChange={(isOpen) => {
          if (!isOpen) setAsking(null);
        }}
        title="End all their sessions?"
        action="End all sessions"
        busy={signOut.isPending}
        onConfirm={() => {
          signOut.mutate(
            { params: { userId: person.userId } },
            {
              onSuccess: ({ ended }) => {
                toast({
                  tone: 'success',
                  title: `${String(ended)} session(s) of ${person.email} ended.`,
                });
                setAsking(null);
              },
            },
          );
        }}
      >
        <p>They are signed out in every app and on every device, and sign in again.</p>
      </Confirm>
    </Dialog>
  );
}
