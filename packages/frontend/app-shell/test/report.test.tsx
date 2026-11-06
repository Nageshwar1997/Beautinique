import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { reportError, setErrorReporter, useReportError } from '../src/index';

afterEach(() => {
  cleanup();
  setErrorReporter(undefined);
});

describe('reportError', () => {
  it('keeps up to 10 errors until a reporter is plugged in, then hands them over', () => {
    for (let i = 0; i < 12; i += 1) reportError(new Error(`e${String(i)}`));
    const got: unknown[] = [];
    setErrorReporter((error) => got.push(error));
    expect(got.map((error) => (error as Error).message)).toEqual(
      Array.from({ length: 10 }, (_, i) => `e${String(i)}`),
    );
    reportError('later');
    expect(got.at(-1)).toBe('later');
  });

  it('forgets the waiting errors when the reporter is taken out', () => {
    reportError(new Error('before'));
    setErrorReporter(undefined);
    const got: unknown[] = [];
    setErrorReporter((error) => got.push(error));
    expect(got).toEqual([]);
  });
});

describe('useReportError', () => {
  function Screen({ error, report }: { error: unknown; report?: boolean }) {
    useReportError(error, report);
    return <p>Something went wrong</p>;
  }

  it('reports the error of an error screen once, and not when told not to', () => {
    const got: unknown[] = [];
    setErrorReporter((error) => got.push(error));
    const error = new Error('boom');
    const { rerender } = render(<Screen error={error} />);
    rerender(<Screen error={error} />);
    expect(got).toEqual([error]);
    render(<Screen error={new Error('404')} report={false} />);
    expect(got).toEqual([error]);
  });
});
