import {
  errorMessage,
  queryKey,
  useApiMutation,
  useApiQuery,
} from '@beautinique/frontend-api-client';
import { Button, Dialog, Spinner, toast } from '@beautinique/frontend-components';
import {
  endOtherSessions,
  endSession,
  listSessions,
  type RouteOutput,
} from '@beautinique/shared-contracts';
import { formatDateTime, plural } from '@beautinique/shared-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { AccountCard, APP_NAMES, StatusBadge } from './account-parts';
import { TextLink } from './layout';
import { ACCOUNT_PATHS, AUTH_PATHS, authHref } from './next';
import { useSession } from './session';

type SessionView = RouteOutput<typeof listSessions>['sessions'][number];

const deviceName = (session: SessionView) => session.device.trim() || 'Unknown device';

/**
 * My Devices (ARCHITECTURE §7.2): where the account is signed in, in every app, this device
 * first. Any other one can be signed out, or all of them at once (asked first); this one signs
 * out like the account menu does. Inside RequireSignIn.
 */
export function MyDevices() {
  const { state, signOut } = useSession();
  const queryClient = useQueryClient();
  const sessions = useApiQuery(listSessions);
  const end = useApiMutation(endSession);
  const endOthers = useApiMutation(endOtherSessions);
  const [ending, setEnding] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKey(listSessions) });
  const email = state.status === 'signed-in' ? state.user.email : '';

  if (sessions.isPending) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Spinner label="Loading your devices" />
      </div>
    );
  }
  if (sessions.isError) {
    return (
      <AccountCard title="Signed-in devices">
        <p role="alert" className="text-sm">
          {errorMessage(sessions.error)}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            void sessions.refetch();
          }}
        >
          Try again
        </Button>
      </AccountCard>
    );
  }

  const all = sessions.data.sessions;
  const list = [...all.filter((s) => s.current), ...all.filter((s) => !s.current)];
  const others = all.filter((s) => !s.current);

  const signOutHere = async () => {
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
  const signOutThere = (session: SessionView) => {
    setEnding(session.sessionId);
    end.mutate(
      { params: { sessionId: session.sessionId } },
      {
        onSuccess: ({ ended }) => {
          toast({
            tone: 'success',
            title: ended
              ? `${deviceName(session)} is signed out.`
              : `${deviceName(session)} was signed out already.`,
          });
        },
        onError: (error) => {
          toast({
            tone: 'error',
            title: 'Signing out did not finish.',
            description: errorMessage(error),
          });
        },
        onSettled: () => {
          setEnding(null);
          void refresh();
        },
      },
    );
  };

  return (
    <AccountCard
      title="Signed-in devices"
      description={
        <>
          Where your account is signed in, in every Beautinique app. Don’t recognise one? Sign it
          out and{' '}
          <TextLink
            to={authHref(AUTH_PATHS.forgotPassword, ACCOUNT_PATHS.devices)}
            state={{ email }}
          >
            change your password
          </TextLink>
          .
        </>
      }
    >
      <ul aria-label="Devices" className="divide-border divide-y">
        {list.map((session) => (
          <li
            key={session.sessionId}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="flex flex-wrap items-center gap-2 font-medium">
                <span className="wrap-break-word">{deviceName(session)}</span>
                {session.current && <StatusBadge tone="success">This device</StatusBadge>}
              </p>
              <p className="text-foreground-muted text-sm wrap-break-word">
                {APP_NAMES[session.app]} · IP {session.ip}
              </p>
              <p className="text-foreground-muted text-sm">
                Last active {formatDateTime(session.lastSeenAt)} · Signed in{' '}
                {formatDateTime(session.createdAt)}
              </p>
            </div>
            <Button
              variant="outline"
              tone="neutral"
              size="sm"
              className="self-start sm:self-center"
              aria-label={`Sign out ${deviceName(session)}, ${APP_NAMES[session.app]}${session.current ? ' (this device)' : ''}`}
              loading={ending === session.sessionId}
              onClick={() => {
                if (session.current) void signOutHere();
                else signOutThere(session);
              }}
            >
              Sign out
            </Button>
          </li>
        ))}
      </ul>
      {others.length > 0 ? (
        <Button
          variant="outline"
          tone="error"
          onClick={() => {
            endOthers.reset();
            setConfirming(true);
          }}
        >
          Sign out all other devices
        </Button>
      ) : (
        <p className="text-foreground-muted text-sm">
          This is the only device signed in to your account.
        </p>
      )}
      <Dialog
        open={confirming}
        onOpenChange={(open) => {
          if (!open && !endOthers.isPending) setConfirming(false);
        }}
        role="alertdialog"
        size="sm"
        title="Sign out every other device?"
        description={`${plural(others.length, 'device')} will need to sign in again. This device stays signed in.`}
        footer={
          <>
            <Button
              variant="outline"
              tone="neutral"
              disabled={endOthers.isPending}
              onClick={() => {
                setConfirming(false);
              }}
            >
              Cancel
            </Button>
            <Button
              tone="error"
              loading={endOthers.isPending}
              onClick={() => {
                endOthers.mutate(undefined, {
                  onSuccess: ({ ended }) => {
                    setConfirming(false);
                    toast({ tone: 'success', title: `Signed out of ${plural(ended, 'device')}.` });
                  },
                  onSettled: () => {
                    void refresh();
                  },
                });
              }}
            >
              Sign out others
            </Button>
          </>
        }
      >
        {endOthers.isError ? (
          <p
            role="alert"
            className="bg-error-subtle text-error-subtle-foreground rounded-lg px-4 py-3 text-sm"
          >
            {errorMessage(endOthers.error)}
          </p>
        ) : undefined}
      </Dialog>
    </AccountCard>
  );
}
