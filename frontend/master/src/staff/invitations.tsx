import {
  errorMessage,
  queryKeyPrefix,
  useApiMutation,
  useApiQuery,
} from '@beautinique/frontend-api-client';
import { Can, roleKeysOf, useAccess } from '@beautinique/frontend-authz';
import { Badge, Button, Select, toast, type Tone } from '@beautinique/frontend-components';
import { type Column, CursorPager, DataTable, useTableUrl } from '@beautinique/frontend-data-table';
import {
  INVITATION_STATUSES,
  listInvitations,
  revokeInvitation,
  type RouteOutput,
} from '@beautinique/shared-contracts';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { pageTitle } from '../nav';
import { Confirm } from './confirm';
import { APP_NAMES, dateText, scopeText, validityText } from './labels';
import { useRoleNames } from './people';
import { givesRole, RoleForm } from './role-form';

type Invitation = RouteOutput<typeof listInvitations>['items'][number];
type Status = (typeof INVITATION_STATUSES)[number];

const PAGE_SIZE = 25;
const FILTERS = { status: '' } as const;

const STATUS: Readonly<Record<Status, { label: string; tone: Tone }>> = {
  pending: { label: 'Pending', tone: 'warning' },
  accepted: { label: 'Accepted', tone: 'success' },
  revoked: { label: 'Taken back', tone: 'neutral' },
  expired: { label: 'Expired', tone: 'neutral' },
};

/**
 * Invitations (TASKS T3.7): the ones the signed-in person may see, the newest first, by status;
 * inviting someone (an account or not yet: they accept with an email code in the role's app),
 * and taking back one not accepted yet.
 */
export function InvitationsPage() {
  const url = useTableUrl({ filters: FILTERS });
  const { byKey, nameOf } = useRoleNames();
  const mine = roleKeysOf(useAccess());
  const queryClient = useQueryClient();
  const [inviting, setInviting] = useState(false);
  const [taking, setTaking] = useState<Invitation | null>(null);
  const status = (INVITATION_STATUSES as readonly string[]).includes(url.filters.status)
    ? (url.filters.status as Status)
    : undefined;
  const invitations = useApiQuery(
    listInvitations,
    {
      query: {
        limit: PAGE_SIZE,
        ...(status === undefined ? {} : { status }),
        ...(url.cursor === undefined ? {} : { cursor: url.cursor }),
      },
    },
    { placeholderData: keepPreviousData },
  );
  const revoke = useApiMutation(revokeInvitation, {
    onError: (error) => {
      toast({
        tone: 'error',
        title: 'The invitation was not taken back.',
        description: errorMessage(error),
      });
    },
  });
  const canTakeBack = (invitation: Invitation) => {
    const role = byKey.get(invitation.role);
    return invitation.status === 'pending' && role !== undefined && givesRole(role, mine);
  };

  const columns: Column<Invitation>[] = [
    { key: 'email', header: 'Email', cell: (i) => i.email, primary: true },
    { key: 'role', header: 'Role', cell: (i) => nameOf(i.role) },
    { key: 'app', header: 'App', cell: (i) => APP_NAMES[i.app] },
    { key: 'scope', header: 'Where', cell: (i) => scopeText(i.scope) },
    {
      key: 'valid',
      header: 'Valid',
      cell: (i) => validityText(i.validFrom, i.validTo),
      hideOnCard: true,
    },
    { key: 'expires', header: 'Accept by', cell: (i) => dateText(i.expiresAt) },
    {
      key: 'status',
      header: 'Status',
      cell: (i) => <Badge tone={STATUS[i.status].tone}>{STATUS[i.status].label}</Badge>,
    },
    {
      key: 'action',
      header: 'Action',
      cell: (i) =>
        canTakeBack(i) ? (
          <Button
            size="sm"
            variant="ghost"
            tone="error"
            aria-label={`Take back the invitation of ${i.email}`}
            onClick={() => {
              setTaking(i);
            }}
          >
            Take back
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <title>{pageTitle('Invitations')}</title>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-medium">Invitations</h1>
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
      <div className="max-w-xs">
        <Select
          label="Status"
          placeholder="Every status"
          clearable
          options={INVITATION_STATUSES.map((s) => ({ value: s, label: STATUS[s].label }))}
          value={status ?? null}
          onChange={(value) => {
            url.setFilters({ status: value ?? '' });
          }}
        />
      </div>
      <DataTable
        label="Invitations"
        columns={columns}
        rows={invitations.data?.items ?? []}
        rowKey={(i) => i.invitationId}
        status={invitations.isPending ? 'loading' : invitations.isError ? 'error' : 'ready'}
        refreshing={invitations.isPlaceholderData}
        errorMessage={invitations.error ? errorMessage(invitations.error) : undefined}
        onRetry={() => void invitations.refetch()}
        empty={status === undefined ? 'No invitations yet.' : 'No invitations with this status.'}
        footer={
          <CursorPager
            page={url.page}
            nextCursor={invitations.data?.nextCursor ?? null}
            onNext={url.next}
            onPrevious={url.previous}
            busy={invitations.isFetching}
          />
        }
      />
      {inviting && <RoleForm open onOpenChange={setInviting} mode={{ kind: 'invite' }} />}
      <Confirm
        open={taking !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTaking(null);
        }}
        title="Take back this invitation?"
        action="Take back"
        busy={revoke.isPending}
        onConfirm={() => {
          if (taking === null) return;
          revoke.mutate(
            { params: { invitationId: taking.invitationId } },
            {
              onSuccess: () => {
                toast({
                  tone: 'success',
                  title: `The invitation of ${taking.email} is taken back.`,
                });
                setTaking(null);
                void queryClient.invalidateQueries({ queryKey: queryKeyPrefix('iam') });
              },
            },
          );
        }}
      >
        <p>
          {taking?.email} can no longer accept {taking === null ? 'it' : nameOf(taking.role)}. Their
          code stops working; you can invite them again later.
        </p>
      </Confirm>
    </div>
  );
}
