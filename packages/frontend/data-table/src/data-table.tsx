import { Button, cx, Spinner } from '@beautinique/frontend-components';
import { useMediaQuery } from '@beautinique/frontend-hooks';
import { type ReactNode, useId } from 'react';

/** One column of a table: its header, and what a row shows in it. */
export interface Column<Row> {
  /** Unique among the columns */
  key: string;
  header: string;
  cell: (row: Row) => ReactNode;
  /**
   * The row's name (one column, the first by default): in the table it holds the row's open
   * button, on a phone card it is the card's title.
   */
  primary?: boolean;
  /** Numbers and amounts line up at the end */
  align?: 'start' | 'end';
  /** Left out of a phone card (the table still shows it) */
  hideOnCard?: boolean;
  /** Classes of its header and cells, e.g. a width */
  className?: string;
}

/** Where the rows are: loading the first time, failed, or here (maybe none). */
export type TableStatus = 'loading' | 'error' | 'ready';

export interface DataTableProps<Row> {
  /** What the table lists, for screen readers ("Staff", "Invitations") */
  label: string;
  columns: readonly Column<Row>[];
  /** The rows of this page; ignored unless `status` is `ready` */
  rows: readonly Row[];
  rowKey: (row: Row) => string;
  status: TableStatus;
  /** True while a page after the first is on its way: the rows stay, dimmed */
  refreshing?: boolean;
  /** What a failed load says (default: a short generic line) */
  errorMessage?: ReactNode;
  /** "Try again" on a failed load */
  onRetry?: () => void;
  /** No rows: what to say, and maybe a button (default "Nothing here yet.") */
  empty?: ReactNode;
  /** Opens a row (its side panel): the primary cell becomes a button, Enter on the row opens too */
  onOpen?: (row: Row) => void;
  /** The open button's name for a row (default its primary cell's text) */
  openLabel?: (row: Row) => string;
  /** The row whose panel is open, marked for everyone (`aria-current`) */
  openKey?: string | null;
  /** Under the rows: usually the pager */
  footer?: ReactNode;
  /** The width from which it is a table; narrower, it lists cards (default 48rem, Tailwind md) */
  tableFrom?: string;
}

const primaryOf = <Row,>(columns: readonly Column<Row>[]): Column<Row> | undefined =>
  columns.find((column) => column.primary) ?? columns[0];

/**
 * The data-dense apps' list (DESIGN §10, ARCHITECTURE §9.2): a real `<table>` from `tableFrom`
 * up, a list of cards below it (a phone at 375 px never scrolls sideways), with loading, failed
 * and empty states. A row with `onOpen` has one control, its name's button (Tab and Enter, a
 * screen reader's button), which stretches over the whole row, so a click anywhere opens it too. Paging and filters live outside
 * (`CursorPager`, `useTableUrl`), so a page's URL says what it shows.
 */
export function DataTable<Row>({
  label,
  columns,
  rows,
  rowKey,
  status,
  refreshing = false,
  errorMessage = 'This list could not be loaded.',
  onRetry,
  empty = 'Nothing here yet.',
  onOpen,
  openLabel,
  openKey = null,
  footer,
  tableFrom = '48rem',
}: DataTableProps<Row>) {
  const wide = useMediaQuery(`(min-width: ${tableFrom})`, { serverValue: true });
  const captionId = useId();
  const primary = primaryOf(columns);

  if (status === 'loading') {
    return (
      <div className="space-y-4">
        <div className="border-border flex min-h-40 items-center justify-center gap-3 rounded-xl border">
          <Spinner size="sm" label={`Loading ${label.toLowerCase()}`} />
          <span aria-hidden="true" className="text-foreground-muted text-sm">
            Loading…
          </span>
        </div>
        {footer}
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div role="alert" className="border-border space-y-3 rounded-xl border px-6 py-8 text-center">
        <p className="font-medium">{errorMessage}</p>
        {onRetry !== undefined && (
          <Button variant="outline" tone="neutral" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }
  // the pager stays under every state but a failed load: a page that turned empty can go back
  if (rows.length === 0) {
    return (
      <div className="space-y-4">
        <div className="border-border text-foreground-muted rounded-xl border border-dashed px-6 py-10 text-center">
          {empty}
        </div>
        {footer}
      </div>
    );
  }

  const openButton = (row: Row) =>
    onOpen === undefined || primary === undefined ? (
      primary?.cell(row)
    ) : (
      <button
        type="button"
        onClick={() => {
          onOpen(row);
        }}
        aria-label={openLabel?.(row)}
        // the ::after covers the row (relative): a click anywhere on it is this button's
        className="text-foreground min-h-touch -my-2 inline-flex items-center rounded-md text-start font-medium underline-offset-4 after:absolute after:inset-0 after:content-[''] hover:underline"
      >
        {primary.cell(row)}
      </button>
    );

  const body = wide ? (
    <div className="border-border overflow-x-auto rounded-xl border">
      <table aria-labelledby={captionId} className="w-full border-collapse text-sm">
        <caption id={captionId} className="sr-only">
          {label}
        </caption>
        <thead className="bg-surface-muted text-foreground-muted text-start">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cx(
                  'px-4 py-3 font-medium',
                  column.align === 'end' ? 'text-end' : 'text-start',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            return (
              <tr
                key={key}
                aria-current={openKey === key ? 'true' : undefined}
                className={cx(
                  'border-border relative border-t align-top',
                  onOpen !== undefined && 'hover:bg-surface-muted cursor-pointer',
                  openKey === key && 'bg-brand-subtle',
                )}
              >
                {columns.map((column) =>
                  column === primary ? (
                    <th
                      key={column.key}
                      scope="row"
                      className={cx('px-4 py-3 text-start font-normal', column.className)}
                    >
                      {openButton(row)}
                    </th>
                  ) : (
                    <td
                      key={column.key}
                      className={cx(
                        'px-4 py-3',
                        column.align === 'end' && 'text-end tabular-nums',
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ),
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <ul aria-label={label} className="space-y-3">
      {rows.map((row) => {
        const key = rowKey(row);
        return (
          <li
            key={key}
            aria-current={openKey === key ? 'true' : undefined}
            className={cx(
              'border-border bg-surface relative rounded-xl border p-4',
              onOpen !== undefined && 'cursor-pointer',
              openKey === key && 'border-brand',
            )}
          >
            <div className="mb-2">{openButton(row)}</div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {columns
                .filter((column) => column !== primary && column.hideOnCard !== true)
                .map((column) => (
                  <div key={column.key} className="contents">
                    <dt className="text-foreground-muted">{column.header}</dt>
                    <dd className="min-w-0 break-words">{column.cell(row)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="space-y-4" aria-busy={refreshing || undefined}>
      <div className={cx('transition-opacity', refreshing && 'opacity-60')}>{body}</div>
      {footer}
    </div>
  );
}
