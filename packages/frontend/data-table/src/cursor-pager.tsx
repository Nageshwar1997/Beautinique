import { Button } from '@beautinique/frontend-components';
import { IconChevronLeft, IconChevronRight } from '@beautinique/frontend-icons';

export interface CursorPagerProps {
  /** This page's number, from 1 (`useTableUrl().page`) */
  page: number;
  /** The API's `nextCursor`: null on the last page */
  nextCursor: string | null;
  onNext: (nextCursor: string) => void;
  onPrevious: () => void;
  /** While a page is on its way: both buttons wait */
  busy?: boolean;
  /** The navigation landmark's name (default "Pages") */
  label?: string;
}

/**
 * Previous and Next for a cursor-paged list (the API gives the next page's cursor, not a count):
 * the page number between them. Nothing on a first page that is also the last.
 */
export function CursorPager({
  page,
  nextCursor,
  onNext,
  onPrevious,
  busy = false,
  label = 'Pages',
}: CursorPagerProps) {
  if (page === 1 && nextCursor === null) return null;
  return (
    <nav aria-label={label} className="flex items-center justify-between gap-3">
      <Button
        variant="outline"
        tone="neutral"
        size="sm"
        startIcon={<IconChevronLeft size={16} />}
        disabled={page === 1 || busy}
        onClick={onPrevious}
      >
        Previous
      </Button>
      <p className="text-foreground-muted text-sm" aria-live="polite">
        Page {page}
      </p>
      <Button
        variant="outline"
        tone="neutral"
        size="sm"
        endIcon={<IconChevronRight size={16} />}
        disabled={nextCursor === null || busy}
        onClick={() => {
          if (nextCursor !== null) onNext(nextCursor);
        }}
      >
        Next
      </Button>
    </nav>
  );
}
