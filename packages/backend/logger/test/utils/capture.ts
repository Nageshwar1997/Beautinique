import { createLogger, type Logger, type LoggerOptions } from '../../src/index.ts';

export interface Captured {
  logger: Logger;
  /** The lines as written, with their line breaks. */
  raw: () => string;
  /** The lines read as JSON. */
  lines: () => Record<string, unknown>[];
}

/** A logger that writes into a list instead of stdout, to read what it wrote. */
export function capture(options: Partial<LoggerOptions> = {}): Captured {
  const written: string[] = [];
  const logger = createLogger({
    service: 'identity',
    level: 'trace',
    destination: {
      write(line) {
        written.push(line);
      },
    },
    ...options,
  });
  return {
    logger,
    raw: () => written.join(''),
    lines: () =>
      written
        .join('')
        .split('\n')
        .filter((line) => line !== '')
        .map((line) => JSON.parse(line) as Record<string, unknown>),
  };
}
