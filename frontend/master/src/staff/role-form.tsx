import {
  type ApiError,
  errorMessage,
  queryKeyPrefix,
  useApiMutation,
  useApiQuery,
} from '@beautinique/frontend-api-client';
import { roleKeysOf, useAccess } from '@beautinique/frontend-authz';
import {
  Button,
  DatePicker,
  Dialog,
  Input,
  Select,
  toast,
  todayInIndia,
} from '@beautinique/frontend-components';
import {
  type AppId,
  createInvitation,
  giveGrant,
  INDIAN_STATES,
  INVITATION_DAYS,
  listRoles,
  type RouteOutput,
  type ScopeType,
} from '@beautinique/shared-contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
  APP_NAMES,
  APP_OPTIONS,
  GIVABLE_SCOPES,
  nextIndianDay,
  NOT_YET,
  SCOPE_NAMES,
  startOfIndianDay,
} from './labels';

export type RoleView = RouteOutput<typeof listRoles>['roles'][number];

/** Whether the signed-in person may give this role: their role is one that appoints it. */
export const givesRole = (role: RoleView, mine: readonly string[]): boolean =>
  role.appointedBy.some((key) => mine.includes(key));

/** A role that can be given now: it takes everywhere or states (the others' ids do not exist yet). */
export const givableNow = (role: RoleView): boolean =>
  role.scopeTypes.some((type) => GIVABLE_SCOPES.includes(type));

const STATE_OPTIONS = INDIAN_STATES.map((state) => ({
  value: state.id,
  label: state.name,
  description: state.kind === 'union-territory' ? 'Union territory' : undefined,
}));

export interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `give`: a role to an account (its id and email); `invite`: an email to a role */
  mode: { kind: 'give'; userId: string; email: string } | { kind: 'invite' };
}

/**
 * Giving a role, or inviting someone to one (TASKS T3.7): the app, a role the signed-in person
 * appoints (the others are not offered), where (everywhere, or states; the scope types whose
 * places do not exist yet are shown, not chosen), and when. The server checks it all again:
 * a scope inside the giver's own, never oneself (ARCHITECTURE §7.3). A step-up first (the API
 * client asks for it).
 */
export function RoleForm({ open, onOpenChange, mode }: RoleFormProps) {
  const access = useAccess();
  const mine = roleKeysOf(access);
  const queryClient = useQueryClient();
  const [app, setApp] = useState<AppId | null>(null);
  const [roleKey, setRoleKey] = useState<string | null>(null);
  const [scopeType, setScopeType] = useState<ScopeType | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const roles = useApiQuery(
    listRoles,
    { query: { app: app ?? undefined } },
    { enabled: app !== null },
  );
  const offered = (roles.data?.roles ?? []).filter(
    // the chosen app's only (with no app the cached list of every role would show for a moment)
    (role) => role.app === app && !role.retired && !role.signUp && givesRole(role, mine),
  );
  const role = offered.find((r) => r.key === roleKey) ?? null;

  const done = (what: string) => {
    toast({ tone: 'success', title: what });
    void queryClient.invalidateQueries({ queryKey: queryKeyPrefix('iam') });
    onOpenChange(false);
  };
  const failed = (error: ApiError) => {
    setProblem([errorMessage(error), ...error.details.map((d) => d.message)].join(' '));
  };
  const give = useApiMutation(giveGrant, { onError: failed });
  const invite = useApiMutation(createInvitation, { onError: failed });
  const busy = give.isPending || invite.isPending;

  const submit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setProblem(null);
    if (role === null || scopeType === null) {
      setProblem('Choose a role and where it holds.');
      return;
    }
    if (scopeType === 'state' && states.length === 0) {
      setProblem('Choose at least one state.');
      return;
    }
    if (from !== null && to !== null && to <= from) {
      setProblem('The end comes after the start.');
      return;
    }
    const body = {
      role: role.key,
      scope: { type: scopeType, ids: scopeType === 'state' ? states : [] },
      validFrom: from === null ? null : startOfIndianDay(from),
      validTo: to === null ? null : startOfIndianDay(to),
    };
    if (mode.kind === 'give') {
      give.mutate(
        { body: { ...body, userId: mode.userId } },
        {
          onSuccess: () => {
            done(`${role.name} given to ${mode.email}.`);
          },
        },
      );
    } else {
      const address = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
        setProblem('Enter the email address to invite.');
        return;
      }
      invite.mutate(
        { body: { ...body, email: address } },
        {
          onSuccess: () => {
            done(`Invitation sent to ${address}.`);
          },
        },
      );
    }
  };

  const roleOptions = offered.map((r) => ({
    value: r.key,
    label: r.name,
    description: givableNow(r)
      ? r.key
      : `Can be given once ${r.scopeTypes.map((t) => SCOPE_NAMES[t].toLowerCase()).join(' or ')} exist`,
    disabled: !givableNow(r),
  }));
  const scopeOptions = (role?.scopeTypes ?? []).map((type) => ({
    value: type,
    label: SCOPE_NAMES[type],
    description: NOT_YET[type],
    disabled: !GIVABLE_SCOPES.includes(type),
  }));

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode.kind === 'give' ? 'Give a role' : 'Invite someone'}
      description={
        mode.kind === 'give'
          ? `To ${mode.email}. It works in that app at once.`
          : `An email with a code to accept it in the role's app, for ${String(INVITATION_DAYS)} days.`
      }
      size="lg"
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        {mode.kind === 'invite' && (
          <Input
            label="Email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(event) => {
              setEmail(event.currentTarget.value);
            }}
          />
        )}
        <Select
          label="App"
          placeholder="Choose an app"
          options={APP_OPTIONS}
          value={app}
          onChange={(value) => {
            setApp(value as AppId | null);
            setRoleKey(null);
            setScopeType(null);
            setStates([]);
          }}
        />
        <Select
          label="Role"
          placeholder={
            app === null
              ? 'Choose an app first'
              : roles.isPending
                ? 'Loading the roles…'
                : offered.length === 0
                  ? `No role you give in ${APP_NAMES[app]}`
                  : 'Choose a role'
          }
          isDisabled={app === null || offered.length === 0}
          options={roleOptions}
          value={roleKey}
          onChange={(value) => {
            setRoleKey(value);
            const picked = offered.find((r) => r.key === value);
            const first = picked?.scopeTypes.find((type) => GIVABLE_SCOPES.includes(type)) ?? null;
            setScopeType(first);
            setStates([]);
          }}
        />
        {role !== null && (
          <Select
            label="Where"
            options={scopeOptions}
            value={scopeType}
            onChange={(value) => {
              setScopeType(value as ScopeType | null);
              setStates([]);
            }}
          />
        )}
        {scopeType === 'state' && (
          <Select
            label="States"
            selectionMode="multiple"
            placeholder="Choose states or union territories"
            options={STATE_OPTIONS}
            value={states}
            onChange={setStates}
          />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <DatePicker
            label="Starts"
            hint="Leave empty for now"
            minValue={todayInIndia()}
            value={from}
            onChange={setFrom}
          />
          <DatePicker
            label="Ends"
            hint="Not included; empty for no end"
            minValue={nextIndianDay(from ?? todayInIndia())}
            value={to}
            onChange={setTo}
          />
        </div>
        {problem !== null && (
          <p role="alert" className="text-error text-sm">
            {problem}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            tone="neutral"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {mode.kind === 'give' ? 'Give role' : 'Send invitation'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
