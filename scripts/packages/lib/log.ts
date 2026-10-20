import { stripVTControlCharacters, styleText } from 'node:util';

type Style = Parameters<typeof styleText>[0];

/** Terminal output. Tests use `memoryLogger()` to read what was printed. */
export interface Logger {
  heading(text: string): void;
  info(text: string): void;
  success(text: string): void;
  warn(text: string): void;
  error(text: string): void;
  dim(text: string): void;
  table(header: string[], rows: string[][]): void;
  blank(): void;
}

const paint = (style: Style, text: string, stream: NodeJS.WriteStream) =>
  styleText(style, text, { stream });

/** Pads by visible width, so coloured cells still line up. */
export function formatTable(header: string[], rows: string[][]): string[] {
  const widths = header.map((h, i) =>
    Math.max(
      stripVTControlCharacters(h).length,
      ...rows.map((r) => stripVTControlCharacters(r[i] ?? '').length),
    ),
  );
  const line = (cells: string[]) =>
    cells
      .map((c, i) => c + ' '.repeat((widths[i] ?? 0) - stripVTControlCharacters(c).length))
      .join('   ')
      .trimEnd();
  return [line(header), widths.map((w) => '-'.repeat(w)).join('   '), ...rows.map(line)];
}

export function consoleLogger(): Logger {
  const out = process.stdout;
  const err = process.stderr;
  return {
    heading: (t) => out.write(`\n${paint(['bold', 'magenta'], t, out)}\n`),
    info: (t) => out.write(`${t}\n`),
    success: (t) => out.write(`${paint('green', '✔', out)} ${t}\n`),
    warn: (t) => err.write(`${paint('yellow', '!', err)} ${paint('yellow', t, err)}\n`),
    error: (t) => err.write(`${paint('red', '✖', err)} ${paint('red', t, err)}\n`),
    dim: (t) => out.write(`${paint('dim', t, out)}\n`),
    table: (header, rows) => {
      const [head, rule, ...body] = formatTable(
        header.map((h) => paint('bold', h, out)),
        rows,
      );
      out.write(`${head ?? ''}\n${paint('dim', rule ?? '', out)}\n${body.join('\n')}\n`);
    },
    blank: () => out.write('\n'),
  };
}

export interface MemoryLogger extends Logger {
  lines: string[];
  text(): string;
}

export function memoryLogger(): MemoryLogger {
  const lines: string[] = [];
  const push = (prefix: string) => (t: string) => lines.push(`${prefix}${t}`);
  return {
    lines,
    text: () => lines.join('\n'),
    heading: push('# '),
    info: push(''),
    success: push('ok '),
    warn: push('warn '),
    error: push('error '),
    dim: push(''),
    table: (header, rows) => lines.push(...formatTable(header, rows)),
    blank: () => lines.push(''),
  };
}
