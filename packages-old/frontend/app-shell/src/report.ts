import { useEffect } from 'react';

/** Where an error goes: Sentry, once the `/monitoring` entry has started it. */
export type ErrorReporter = (error: unknown) => void;

/** Errors reported before the reporter is plugged in wait for it, at most this many. */
const MAX_WAITING = 10;

let reporter: ErrorReporter | undefined;
const waiting: unknown[] = [];

/**
 * Reports an unexpected error (ARCHITECTURE §14). Error screens and pages call it; the monitoring
 * entry (`@beautinique/frontend-app-shell/monitoring`, loaded after the page starts) plugs Sentry in,
 * and errors from before that wait for it. Without monitoring (laptop, CI, a crawler) nothing is sent.
 */
export function reportError(error: unknown): void {
  if (reporter) reporter(error);
  else if (waiting.length < MAX_WAITING) waiting.push(error);
}

/** Plugs a reporter in (the waiting errors go to it at once), or takes it out (`undefined`). */
export function setErrorReporter(next: ErrorReporter | undefined): void {
  reporter = next;
  if (next) for (const error of waiting.splice(0)) next(error);
  else waiting.length = 0;
}

/**
 * Reports `error` once from an error screen, when `report` (a 404 or an expected answer is not
 * reported). Error screens catch what never reaches the browser's own error handlers.
 */
export function useReportError(error: unknown, report = true): void {
  useEffect(() => {
    if (report) reportError(error);
  }, [error, report]);
}
