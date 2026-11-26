import { randomUUID } from 'node:crypto';

// What a request id may be: it comes into the body of an answer and into the logs, so it is short
// and has no characters that could be used to write a fake log line or a header.
const REQUEST_ID = /^[A-Za-z0-9_-]{1,128}$/;

/** The request id that came in the header, if it is one; else a new one. The gateway makes it (docs/ARCHITECTURE.md §8 rule 1). */
export function requestIdOf(header: string | undefined): string {
  return header !== undefined && REQUEST_ID.test(header) ? header : randomUUID();
}
