import {
  errorMessage,
  saveFile,
  useApiClient,
  useApiQuery,
} from '@beautinique/frontend-api-client';
import { Can, RequirePermission } from '@beautinique/frontend-authz';
import {
  Badge,
  Button,
  DateRangePicker,
  Dialog,
  Select,
  toast,
  todayInIndia,
  type Tone,
} from '@beautinique/frontend-components';
import { type Column, CursorPager, DataTable, useTableUrl } from '@beautinique/frontend-data-table';
import {
  AUDIT_ACTION_NAMES,
  AUDIT_EXPORT_MAX_ROWS,
  AUDIT_RESULTS,
  type AuditResult,
  exportAuditEntries,
  listAuditDays,
  listAuditEntries,
  type RouteOutput,
} from '@beautinique/shared-contracts';
import { keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';

import { pageTitle } from '../nav';
import { APP_NAMES, dateText, scopeText } from '../staff/labels';
import { NotForYourRole } from '../staff/layout';

type Entry = RouteOutput<typeof listAuditEntries>['items'][number];
type Day = RouteOutput<typeof listAuditDays>['items'][number];

const PAGE_SIZE = 25;
const FILTERS = { action: '', result: '', from: '', to: '' } as const;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
/** The days whose chain check the page shows, today included. */
export const DAYS_SHOWN = 14;

/** What each action is called here and in the CSV (contracts); one not named yet shows as its key. */
export const ACTION_NAMES = AUDIT_ACTION_NAMES;

/**
 * The time range of picked India days (YYYY-MM-DD): from the first day's start to the last one's
 * end, in India time. A day that is not one is left out.
 */
export function rangeOf(from: string, to: string): { from?: string; to?: string } {
  return {
    ...(DAY.test(from) ? { from: new Date(`${from}T00:00:00.000+05:30`).toISOString() } : {}),
    ...(DAY.test(to) ? { to: new Date(`${to}T23:59:59.999+05:30`).toISOString() } : {}),
  };
}

const RESULT: Readonly<Record<AuditResult, { label: string; tone: Tone }>> = {
  success: { label: 'Done', tone: 'success' },
  denied: { label: 'Refused', tone: 'warning' },
  failed: { label: 'Failed', tone: 'error' },
};

const TIME = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Kolkata',
});

/** An ISO time in India, to the second: "15 Nov 2026, 10:30:05 am". */
export const timeText = (iso: string): string => TIME.format(new Date(iso));

/** The UTC day `offset` days before today, as the chain names it (YYYY-MM-DD). */
const utcDay = (offset: number, now = Date.now()): string =>
  new Date(now - offset * 86_400_000).toISOString().slice(0, 10);

export const actionText = (action: string): string => ACTION_NAMES[action] ?? action;

/** Who did it: their email (half hidden), or the system. */
export function actorText(actor: Entry['actor']): string {
  if (actor.userId === null) return 'System';
  return actor.email ?? actor.userId;
}

/** A day's chain in words, with its tone. */
export function checkOf(day: Day): { label: string; tone: Tone } {
  if (day.check === null) return { label: 'Not checked yet', tone: 'neutral' };
  if (!day.check.ok) {
    return { label: `Broken at #${String(day.check.brokenAtSeq ?? 0)}`, tone: 'error' };
  }
  if (day.check.entries !== day.entries) return { label: 'Grew since its check', tone: 'warning' };
  return { label: 'Checked', tone: 'success' };
}

const json = (value: Record<string, unknown> | null): string =>
  value === null ? 'Nothing' : JSON.stringify(value, null, 2);

/**
 * The audit log (ARCHITECTURE §6.5, TASKS T4.1 PR C): every entry, the newest first, by action
 * and result, each with who, where from and what changed (personal data half hidden), and each
 * day's hash chain check. Master and the Internal Auditor read it; nobody can change it.
 */
export function AuditLogPage() {
  return (
    <RequirePermission permission="audit.entry.read" denied={<NotForYourRole />}>
      <AuditLog />
    </RequirePermission>
  );
}

function AuditLog() {
  const url = useTableUrl({ filters: FILTERS });
  const [open, setOpen] = useState<Entry | null>(null);
  const action = Object.hasOwn(ACTION_NAMES, url.filters.action) ? url.filters.action : undefined;
  const result = (AUDIT_RESULTS as readonly string[]).includes(url.filters.result)
    ? (url.filters.result as AuditResult)
    : undefined;
  // the list and the CSV hold the same entries
  const filters = {
    ...rangeOf(url.filters.from, url.filters.to),
    ...(action === undefined ? {} : { action }),
    ...(result === undefined ? {} : { result }),
  };
  const entries = useApiQuery(
    listAuditEntries,
    {
      query: {
        limit: PAGE_SIZE,
        ...filters,
        ...(url.cursor === undefined ? {} : { cursor: url.cursor }),
      },
    },
    { placeholderData: keepPreviousData },
  );
  const api = useApiClient();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const download = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      // a step-up first when the last one is older than 5 minutes: the app's step-up dialog
      saveFile(await api.download(exportAuditEntries, { query: filters }));
      toast({ tone: 'success', title: 'Audit log downloaded' });
    } catch (error) {
      setDownloadError(errorMessage(error));
    } finally {
      setDownloading(false);
    }
  };
  const days = useApiQuery(listAuditDays, {
    query: { from: utcDay(DAYS_SHOWN - 1), to: utcDay(0) },
  });

  const columns: Column<Entry>[] = [
    { key: 'at', header: 'When', cell: (e) => timeText(e.at), primary: true },
    {
      key: 'who',
      header: 'Who',
      cell: (e) =>
        e.actor.app === null
          ? actorText(e.actor)
          : `${actorText(e.actor)} (${APP_NAMES[e.actor.app]})`,
    },
    { key: 'action', header: 'Action', cell: (e) => actionText(e.action) },
    {
      key: 'what',
      header: 'What',
      cell: (e) =>
        e.resource.id === null ? e.resource.type : `${e.resource.type} ${e.resource.id}`,
      hideOnCard: true,
    },
    {
      key: 'result',
      header: 'Result',
      cell: (e) => <Badge tone={RESULT[e.result].tone}>{RESULT[e.result].label}</Badge>,
    },
    { key: 'ip', header: 'From', cell: (e) => e.ip ?? 'Unknown', hideOnCard: true },
    {
      key: 'details',
      header: 'Details',
      cell: (e) => (
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Details of ${actionText(e.action)} at ${timeText(e.at)}`}
          onClick={() => {
            setOpen(e);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="container-page space-y-6 py-8">
      <title>{pageTitle('Audit log')}</title>
      <h1 className="font-display text-3xl font-medium">Audit log</h1>

      <section aria-labelledby="audit-days" className="space-y-3">
        <h2 id="audit-days" className="text-lg font-medium">
          Daily chain checks
        </h2>
        <p className="text-sm text-foreground-muted">
          Each day (UTC) is one hash chain. Every morning the chain of each finished day of the last
          week is followed again: a changed, lost or added entry breaks it.
        </p>
        {days.isPending ? (
          <p className="text-sm text-foreground-muted">Loading the checks…</p>
        ) : days.isError ? (
          <p role="alert" className="text-sm text-error">
            {errorMessage(days.error)}
          </p>
        ) : days.data.items.length === 0 ? (
          <p className="text-sm text-foreground-muted">No entries in the last {DAYS_SHOWN} days.</p>
        ) : (
          <ul className="flex flex-wrap gap-2" aria-label="Days">
            {days.data.items.map((day) => {
              const check = checkOf(day);
              return (
                <li
                  key={day.day}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>{dateText(`${day.day}T00:00:00.000Z`)}</span>
                  <span className="text-foreground-muted">
                    {day.entries} {day.entries === 1 ? 'entry' : 'entries'}
                  </span>
                  <Badge tone={check.tone}>{check.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <div className="w-full max-w-xs">
          <Select
            label="Action"
            placeholder="Every action"
            clearable
            options={Object.entries(ACTION_NAMES).map(([value, label]) => ({ value, label }))}
            value={action ?? null}
            onChange={(value) => {
              url.setFilters({ action: value ?? '' });
            }}
          />
        </div>
        <div className="w-full max-w-xs">
          <Select
            label="Result"
            placeholder="Every result"
            clearable
            options={AUDIT_RESULTS.map((value) => ({ value, label: RESULT[value].label }))}
            value={result ?? null}
            onChange={(value) => {
              url.setFilters({ result: value ?? '' });
            }}
          />
        </div>
        <div className="w-full max-w-sm">
          <DateRangePicker
            label="Dates (India time)"
            maxValue={todayInIndia()}
            value={
              DAY.test(url.filters.from) && DAY.test(url.filters.to)
                ? { start: url.filters.from, end: url.filters.to }
                : null
            }
            onChange={(range) => {
              url.setFilters({ from: range?.start ?? '', to: range?.end ?? '' });
            }}
          />
        </div>
      </div>

      <Can permission="audit.entry.export">
        <div className="space-y-2">
          <Button
            variant="outline"
            loading={downloading}
            onClick={() => {
              void download();
            }}
          >
            Download CSV
          </Button>
          <p className="text-sm text-foreground-muted">
            The entries these filters show, up to {AUDIT_EXPORT_MAX_ROWS.toLocaleString('en-IN')},
            with what changed. You may be asked for your authenticator first.
          </p>
          {downloadError !== null && (
            <p role="alert" className="text-sm text-error">
              {downloadError}
            </p>
          )}
        </div>
      </Can>

      <DataTable
        label="Audit entries"
        columns={columns}
        rows={entries.data?.items ?? []}
        rowKey={(e) => e.entryId}
        status={entries.isPending ? 'loading' : entries.isError ? 'error' : 'ready'}
        refreshing={entries.isPlaceholderData}
        errorMessage={entries.error ? errorMessage(entries.error) : undefined}
        onRetry={() => void entries.refetch()}
        empty={url.filtered ? 'No entries match these filters.' : 'No entries yet.'}
        footer={
          <CursorPager
            page={url.page}
            nextCursor={entries.data?.nextCursor ?? null}
            onNext={url.next}
            onPrevious={url.previous}
            busy={entries.isFetching}
          />
        }
      />

      <Dialog
        open={open !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpen(null);
        }}
        title={open === null ? 'Entry' : actionText(open.action)}
        description={open === null ? undefined : timeText(open.at)}
        size="lg"
      >
        {open !== null && <EntryDetails entry={open} />}
      </Dialog>
    </div>
  );
}

function EntryDetails({ entry }: { entry: Entry }) {
  const rows: [string, string][] = [
    ['Who', actorText(entry.actor)],
    ['Their roles', entry.actor.roles.length === 0 ? 'None' : entry.actor.roles.join(', ')],
    ['App', entry.actor.app === null ? 'None' : APP_NAMES[entry.actor.app]],
    ['Account id', entry.actor.userId ?? 'System'],
    ['Session', entry.actor.sessionId ?? 'None'],
    ['Action', entry.action],
    [
      'What',
      entry.resource.id === null
        ? entry.resource.type
        : `${entry.resource.type} ${entry.resource.id}`,
    ],
    ['Where', entry.scope === null ? 'Not scoped' : scopeText(entry.scope)],
    ['Result', RESULT[entry.result].label],
    ['Reason', entry.reason ?? 'None given'],
    ['IP', entry.ip ?? 'Unknown'],
    ['Device', entry.userAgent ?? 'Unknown'],
    ['Request id', entry.requestId ?? 'None'],
    ['From', entry.source],
    ['Chain', `${entry.day} #${String(entry.seq)}`],
    ['Hash', entry.hash],
  ];
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
        {rows.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="text-foreground-muted">{term}</dt>
            <dd className="break-all">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <h3 className="mb-1 text-sm font-medium">Before</h3>
          <pre className="overflow-x-auto rounded-md bg-surface-muted p-3 text-xs">
            {json(entry.before)}
          </pre>
        </div>
        <div>
          <h3 className="mb-1 text-sm font-medium">After</h3>
          <pre className="overflow-x-auto rounded-md bg-surface-muted p-3 text-xs">
            {json(entry.after)}
          </pre>
        </div>
      </div>
    </div>
  );
}
