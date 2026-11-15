import {
  type ApiError,
  errorMessage,
  queryKeyPrefix,
  useApiMutation,
} from '@beautinique/frontend-api-client';
import { Can, usePermission } from '@beautinique/frontend-authz';
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  Input,
  Select,
  toast,
} from '@beautinique/frontend-components';
import { type Column, DataTable, useTableUrl } from '@beautinique/frontend-data-table';
import {
  type AppId,
  appSignIn,
  createRole,
  permissions,
  roleManage,
  type ScopeType,
  totpResetMaster,
  updateRole,
} from '@beautinique/shared-contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { pageTitle } from '../nav';
import { Confirm } from './confirm';
import { APP_NAMES, APP_OPTIONS, SCOPE_NAMES } from './labels';
import { useRoleNames } from './people';
import type { RoleView } from './role-form';

const FILTERS = { app: '' } as const;
const CATALOGUE = [...permissions.values()];
const kindOf = (role: RoleView) =>
  role.system ? (role.main ? 'Main role' : 'Sub-role') : 'Made by Master';

/**
 * Roles (TASKS T3.7, ARCHITECTURE §7.3): every role of an app, shipped and made by Master, with
 * what it allows and who gives it. Master makes, changes, retires and brings back its own
 * sub-roles (`<app>.c_<slug>`) without a deploy; shipped roles change only in code.
 */
export function RolesPage() {
  const url = useTableUrl({ filters: FILTERS });
  const { roles, nameOf, status, error, retry } = useRoleNames();
  const [open, setOpen] = useState<RoleView | null>(null);
  const [editing, setEditing] = useState<RoleView | 'new' | null>(null);
  const app = url.filters.app;
  const shown = roles.filter((r) => !r.signUp && (app === '' || r.app === app));
  const columns: Column<RoleView>[] = [
    { key: 'name', header: 'Role', cell: (r) => r.name, primary: true },
    { key: 'app', header: 'App', cell: (r) => APP_NAMES[r.app] },
    { key: 'kind', header: 'Kind', cell: kindOf },
    {
      key: 'scopes',
      header: 'Where',
      cell: (r) => r.scopeTypes.map((t) => SCOPE_NAMES[t]).join(', '),
      hideOnCard: true,
    },
    {
      key: 'givenBy',
      header: 'Given by',
      cell: (r) =>
        r.appointedBy.length === 0 ? 'Only identity' : r.appointedBy.map(nameOf).join(', '),
      hideOnCard: true,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => (r.retired ? <Badge>Retired</Badge> : <Badge tone="success">In use</Badge>),
    },
  ];

  return (
    <div className="space-y-6">
      <title>{pageTitle('Roles')}</title>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-medium">Roles</h1>
        <Can permission="iam.role.manage">
          <Button
            onClick={() => {
              setEditing('new');
            }}
          >
            New sub-role
          </Button>
        </Can>
      </div>
      <div className="max-w-xs">
        <Select
          label="App"
          placeholder="Every app"
          clearable
          options={APP_OPTIONS}
          value={app === '' ? null : app}
          onChange={(value) => {
            url.setFilters({ app: value ?? '' });
          }}
        />
      </div>
      <DataTable
        label="Roles"
        columns={columns}
        rows={shown}
        rowKey={(r) => r.key}
        status={status}
        errorMessage={error ? errorMessage(error) : undefined}
        onRetry={retry}
        empty="No roles in this app."
        onOpen={setOpen}
        openKey={open?.key ?? null}
      />
      {open !== null && (
        <RolePanel
          role={roles.find((r) => r.key === open.key) ?? open}
          nameOf={nameOf}
          onEdit={() => {
            // the role as it is now, not as it was when its row was opened
            setEditing(roles.find((r) => r.key === open.key) ?? open);
          }}
          onClose={() => {
            setOpen(null);
          }}
        />
      )}
      {editing !== null && (
        <RoleEditor
          role={editing === 'new' ? null : editing}
          roles={roles}
          onClose={() => {
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function RolePanel({
  role,
  nameOf,
  onEdit,
  onClose,
}: {
  role: RoleView;
  nameOf: (key: string) => string;
  onEdit: () => void;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const manages = usePermission('iam.role.manage') && !role.system;
  const [retiring, setRetiring] = useState(false);
  const update = useApiMutation(updateRole, {
    onError: (error: ApiError) => {
      toast({ tone: 'error', title: 'The role did not change.', description: errorMessage(error) });
    },
  });
  const setRetired = (retired: boolean) => {
    update.mutate(
      { params: { roleKey: role.key }, body: { retired } },
      {
        onSuccess: () => {
          toast({
            tone: 'success',
            title: retired ? `${role.name} is retired.` : `${role.name} is in use again.`,
          });
          setRetiring(false);
          void queryClient.invalidateQueries({ queryKey: queryKeyPrefix('iam') });
        },
      },
    );
  };
  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={role.name}
      description={`${role.key} · ${APP_NAMES[role.app]} · ${kindOf(role)}`}
      placement="side"
    >
      <div className="space-y-5 text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt className="text-foreground-muted">Where</dt>
          <dd>{role.scopeTypes.map((t) => SCOPE_NAMES[t]).join(', ')}</dd>
          <dt className="text-foreground-muted">Given by</dt>
          <dd>
            {role.appointedBy.length === 0
              ? 'Only identity'
              : role.appointedBy.map(nameOf).join(', ')}
          </dd>
          <dt className="text-foreground-muted">Authenticator</dt>
          <dd>{role.mfaRequired ? 'Needed at every sign-in' : 'Not needed by this role'}</dd>
          <dt className="text-foreground-muted">Holders</dt>
          <dd>{role.maxHolders === null ? 'No limit' : `At most ${String(role.maxHolders)}`}</dd>
        </dl>
        <section aria-labelledby="role-permissions" className="space-y-2">
          <h3 id="role-permissions" className="font-medium">
            What it allows
          </h3>
          <ul className="space-y-1">
            {role.permissions.map((key) => (
              <li key={key}>
                <span className="font-medium">{permissions.get(key)?.description ?? key}</span>{' '}
                <span className="text-foreground-muted">({key})</span>
              </li>
            ))}
          </ul>
        </section>
        {manages && (
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="outline" onClick={onEdit}>
              Change
            </Button>
            {role.retired ? (
              <Button
                size="sm"
                variant="outline"
                loading={update.isPending}
                onClick={() => {
                  setRetired(false);
                }}
              >
                Bring back
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                tone="error"
                onClick={() => {
                  setRetiring(true);
                }}
              >
                Retire
              </Button>
            )}
          </div>
        )}
      </div>
      <Confirm
        open={retiring}
        onOpenChange={setRetiring}
        title={`Retire ${role.name}?`}
        action="Retire"
        busy={update.isPending}
        onConfirm={() => {
          setRetired(true);
        }}
      >
        <p>
          It can no longer be given, and its holders lose what it allows at once (their grants stay,
          for audit). You can bring it back later.
        </p>
      </Confirm>
    </Dialog>
  );
}

/**
 * Making or changing a sub-role: its name, where it holds, what it allows (keys that work in those
 * places; signing in to its app always) and which roles give it (roles that give roles, never
 * itself: QA Q-007). The server checks it all again (identity roleProblems).
 */
function RoleEditor({
  role,
  roles,
  onClose,
}: {
  role: RoleView | null;
  roles: readonly RoleView[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [app, setApp] = useState<AppId | null>(role?.app ?? null);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState(role?.name ?? '');
  const [scopeTypes, setScopeTypes] = useState<string[]>(role ? [...role.scopeTypes] : ['global']);
  const [keys, setKeys] = useState<string[]>(
    role ? role.permissions.filter((k) => k !== appSignIn.key) : [],
  );
  // a new one is given by Master unless chosen otherwise: some role must give it (createRole)
  const [appointedBy, setAppointedBy] = useState<string[]>(
    role ? [...role.appointedBy] : ['master.master'],
  );
  const [mfa, setMfa] = useState(role?.mfaRequired ?? false);
  const [problem, setProblem] = useState<string | null>(null);
  const failed = (error: ApiError) => {
    setProblem(
      [errorMessage(error), ...error.details.map((d) => `${d.path.join('.')}: ${d.message}`)].join(
        ' ',
      ),
    );
  };
  const create = useApiMutation(createRole, { onError: failed });
  const update = useApiMutation(updateRole, { onError: failed });
  const done = (title: string) => {
    toast({ tone: 'success', title });
    void queryClient.invalidateQueries({ queryKey: queryKeyPrefix('iam') });
    onClose();
  };
  const usable = CATALOGUE.filter(
    // signing in always; making roles and resetting a Master's authenticator only the shipped
    // Master role (identity refuses them here)
    (p) =>
      p.key !== appSignIn.key &&
      p.key !== roleManage.key &&
      p.key !== totpResetMaster.key &&
      p.scopeTypes.some((t) => scopeTypes.includes(t)),
  );
  const appointers = roles.filter(
    (r) => !r.retired && r.permissions.includes('iam.grant.manage') && r.key !== role?.key,
  );

  const submit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setProblem(null);
    if (appointedBy.length === 0) {
      setProblem('Choose at least one role that gives it.');
      return;
    }
    const permissionKeys = [appSignIn.key, ...keys.filter((k) => usable.some((p) => p.key === k))];
    const common = {
      name: name.trim(),
      scopeTypes: scopeTypes as ScopeType[],
      permissions: permissionKeys,
      appointedBy,
      mfaRequired: mfa,
    };
    if (role === null) {
      if (app === null) {
        setProblem('Choose the app.');
        return;
      }
      create.mutate(
        { body: { ...common, app, slug: slug.trim() } },
        {
          onSuccess: ({ role: made }) => {
            done(`${made.name} is made (${made.key}).`);
          },
        },
      );
    } else {
      update.mutate(
        { params: { roleKey: role.key }, body: common },
        {
          onSuccess: () => {
            done(`${common.name} is changed.`);
          },
        },
      );
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={role === null ? 'New sub-role' : `Change ${role.name}`}
      description={role === null ? 'Its key is <app>.c_<name>, and never changes.' : role.key}
      size="lg"
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        {role === null && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="App"
              placeholder="Choose an app"
              options={APP_OPTIONS}
              value={app}
              onChange={(value) => {
                setApp(value as AppId | null);
              }}
            />
            <Input
              label="Key name"
              hint={`${app ?? '<app>'}.c_${slug.trim() === '' ? '<name>' : slug.trim()}: 2 to 39 lower-case letters, digits or _`}
              value={slug}
              onChange={(event) => {
                setSlug(event.currentTarget.value);
              }}
            />
          </div>
        )}
        <Input
          label="Name"
          value={name}
          onChange={(event) => {
            setName(event.currentTarget.value);
          }}
        />
        <Select
          label="Where it holds"
          selectionMode="multiple"
          options={Object.entries(SCOPE_NAMES)
            .filter(([type]) => type !== 'self')
            .map(([value, label]) => ({ value, label }))}
          value={scopeTypes}
          onChange={setScopeTypes}
        />
        <Select
          label="What it allows"
          selectionMode="multiple"
          hint="Signing in to its app always; only what works where it holds"
          placeholder="Only signing in"
          options={usable.map((p) => ({ value: p.key, label: p.description, description: p.key }))}
          value={keys.filter((k) => usable.some((p) => p.key === k))}
          onChange={setKeys}
        />
        <Select
          label="Given by"
          selectionMode="multiple"
          hint="Roles that give roles; never itself"
          options={appointers.map((r) => ({ value: r.key, label: r.name, description: r.key }))}
          value={appointedBy}
          onChange={setAppointedBy}
        />
        <Checkbox isSelected={mfa} onChange={setMfa}>
          Needs an authenticator at every sign-in
        </Checkbox>
        {problem !== null && (
          <p role="alert" className="text-error text-sm">
            {problem}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" tone="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending || update.isPending}>
            {role === null ? 'Make sub-role' : 'Save'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
