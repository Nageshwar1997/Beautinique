import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { type Logger, requestIdOf, type RouteContext } from '@beautinique/backend-server-kit';
import type { RouteDefinition, RouteInput } from '@beautinique/shared-contracts';
import type { Router } from 'express';

/**
 * The platform kernel's CSV export (ARCHITECTURE §6.5, TASKS T4.1 PR D): a download route's file,
 * streamed from a MongoDB cursor row by row, so the server's memory stays flat however big the
 * file; the route itself checks access, counts against its limit and audits the export before the
 * first byte goes out.
 */

/**
 * A text cell a spreadsheet would run as a formula starts with one of these (OWASP, CSV
 * injection): `=`, `+`, `-`, `@`, and tab or carriage return, which some read the same way.
 */
const FORMULA_START = /^[=+\-@\t\r]/;

/** The file name a download may have: plain, so it never breaks its header. */
const FILE_NAME = /^[a-z0-9][a-z0-9.-]{0,150}\.csv$/;

/** The byte order mark (U+FEFF), written by its code so no editor can lose it. */
const BOM = String.fromCodePoint(0xfeff);

/** About this much text goes out at once: fewer, bigger writes. */
const CHUNK_CHARS = 64_000;

/**
 * One CSV cell (RFC 4180): a number as it is, text quoted with its `"` doubled, and text that
 * starts like a formula kept as text with a leading `'`. Empty for null.
 */
export function csvCell(value: string | number | null): string {
  if (value === null) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  const text = FORMULA_START.test(value) ? `'${value}` : value;
  return `"${text.replaceAll('"', '""')}"`;
}

/** One CSV line, CRLF at its end. */
export const csvLine = (cells: readonly (string | number | null)[]): string =>
  `${cells.map(csvCell).join(',')}\r\n`;

export interface CsvColumn<Row> {
  header: string;
  value: (row: Row) => string | number | null;
}

/** What a download handler gives: the file's name, its columns, and its rows as they come. */
export interface CsvFile<Row> {
  fileName: string;
  columns: readonly CsvColumn<Row>[];
  rows: AsyncIterable<Row>;
}

/** The file's text: a UTF-8 BOM (so a spreadsheet reads `•` and `₹` right), the header, the rows. */
export async function* csvText<Row>(file: CsvFile<Row>): AsyncGenerator<string> {
  yield `${BOM}${csvLine(file.columns.map((column) => column.header))}`;
  let chunk = '';
  for await (const row of file.rows) {
    chunk += csvLine(file.columns.map((column) => column.value(row)));
    if (chunk.length >= CHUNK_CHARS) {
      yield chunk;
      chunk = '';
    }
  }
  if (chunk !== '') yield chunk;
}

export type DownloadHandler<Route extends RouteDefinition, Row> = (
  input: RouteInput<Route>,
  context: RouteContext,
) => Promise<CsvFile<Row>>;

export interface DownloadDeps {
  /** A file cut off halfway by the server is an error in the logs (Sentry) */
  logger: Logger;
}

/**
 * Mounts a download route (`download: 'csv'`): its params and query checked like any route's, then
 * the handler, then the file. Whatever the handler throws is an error answer as usual; once the
 * file has started, a failure can only cut it off (the client then has no whole file), and goes
 * to the logs.
 */
export function mountCoreDownload<const Route extends RouteDefinition & { download: 'csv' }, Row>(
  router: Router,
  route: Route,
  handler: DownloadHandler<Route, Row>,
  deps: DownloadDeps,
): void {
  if (route.method !== 'GET') throw new Error(`${route.id}: a download route is a GET`);
  const { params, query } = route.input;
  router.get(route.path, async (req, res) => {
    const input = {
      params: params?.parse(req.params),
      query: query?.parse(req.query),
      body: undefined,
    } as RouteInput<Route>;
    const file = await handler(input, { req, res, requestId: requestIdOf(res) });
    if (!FILE_NAME.test(file.fileName)) {
      throw new Error(`${route.id} named its file "${file.fileName}", which is no plain CSV name`);
    }
    res.status(200);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    try {
      await pipeline(Readable.from(csvText(file)), res);
    } catch (error) {
      // the caller went away: nothing broke (a broken row also ends the request, so only the
      // error itself tells the two apart)
      if ((error as { code?: string }).code === 'ERR_STREAM_PREMATURE_CLOSE') {
        deps.logger.warn({ route: route.id }, 'export stopped: the caller left');
        return;
      }
      deps.logger.error({ err: error, route: route.id }, 'export cut off halfway');
      res.destroy();
    }
  });
}
