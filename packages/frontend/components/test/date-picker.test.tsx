import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  DatePicker,
  type DateRange,
  DateRangePicker,
  INDIA_TIME_ZONE,
  todayInIndia,
} from '../src/index';
import { at } from './at';
import { expectNoAxeViolations } from './axe';

// the device is far from India: what the fields show and give must not follow its clock
const deviceZone = process.env.TZ;
beforeAll(() => {
  process.env.TZ = 'America/New_York';
});
afterAll(() => {
  process.env.TZ = deviceZone;
});

afterEach(() => {
  cleanup();
});

const segments = (group: HTMLElement) => within(group).getAllByRole('spinbutton');
const shown = (group: HTMLElement) =>
  // the time sits between invisible bidi marks (Unicode format characters)
  group.textContent.replace(/\p{Cf}/gu, '');

describe('todayInIndia', () => {
  it("is today's date in India as YYYY-MM-DD", () => {
    const expected = new Intl.DateTimeFormat('en-CA', { timeZone: INDIA_TIME_ZONE }).format(
      new Date(),
    );
    expect(todayInIndia()).toBe(expected);
  });
});

describe('DatePicker', () => {
  it('is dd/mm/yyyy; typed digits give YYYY-MM-DD', async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Date of birth" onChange={onChange} hint="As on your ID" />);
    const group = screen.getByRole('group', { name: 'Date of birth' });
    expect(segments(group).map((segment) => segment.getAttribute('aria-label'))).toEqual([
      'day, ',
      'month, ',
      'year, ',
    ]);
    await expectNoAxeViolations();
    await userEvent.click(at(segments(group)));
    await userEvent.keyboard('05112026');
    expect(onChange).toHaveBeenLastCalledWith('2026-11-05');
    expect(shown(group)).toBe('05/11/2026');
  });

  it('with a time: typed in India time, given as an ISO instant', async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Offer starts" withTime onChange={onChange} />);
    const group = screen.getByRole('group', { name: 'Offer starts' });
    await userEvent.click(at(segments(group)));
    await userEvent.keyboard('051120261030p');
    // 10:30 pm in India = 17:00 UTC
    expect(onChange).toHaveBeenLastCalledWith('2026-11-05T17:00:00.000Z');
  });

  it('shows a given instant in India time', () => {
    render(<DatePicker label="Offer starts" withTime value="2026-11-05T17:00:00.000Z" />);
    expect(shown(screen.getByRole('group', { name: 'Offer starts' }))).toMatch(
      /^05\/11\/2026, 10:30\s?pm\s?IST$/i,
    );
  });

  it('says in its own words what is wrong: before the first day, after the last, unavailable', async () => {
    function Field({ withTime = false }: { withTime?: boolean }) {
      const [value, setValue] = useState<string | null>(null);
      return (
        <DatePicker
          label="Day"
          withTime={withTime}
          minValue="2026-11-02"
          maxValue="2026-11-20"
          isDateUnavailable={(day) => day === '2026-11-08'}
          value={value}
          onChange={setValue}
        />
      );
    }
    render(<Field />);
    const group = screen.getByRole('group', { name: 'Day' });
    const type = async (digits: string) => {
      await userEvent.click(at(segments(group)));
      await userEvent.keyboard(digits);
    };
    await type('01112026');
    expect(screen.getByText('Choose 02/11/2026 or later.')).not.toBeNull();
    expect(group.getAttribute('data-invalid')).toBe('true');
    await type('21112026');
    expect(screen.getByText('Choose 20/11/2026 or earlier.')).not.toBeNull();
    await type('08112026');
    expect(screen.getByText('This date is not available.')).not.toBeNull();
    await type('10112026');
    expect(group.hasAttribute('data-invalid')).toBe(false);
    expect(screen.queryByText(/Choose|not available/)).toBeNull();
  });

  it('with a time, the whole last day can be chosen', async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Ends" withTime maxValue="2026-11-20" onChange={onChange} />);
    const group = screen.getByRole('group', { name: 'Ends' });
    await userEvent.click(at(segments(group)));
    await userEvent.keyboard('201120261159p');
    expect(onChange).toHaveBeenLastCalledWith('2026-11-20T18:29:00.000Z');
    expect(group.hasAttribute('data-invalid')).toBe(false);
    await userEvent.click(at(segments(group)));
    await userEvent.keyboard('21');
    expect(screen.getByText('Choose 20/11/2026 or earlier.')).not.toBeNull();
  });

  it('our error wins and marks it invalid', async () => {
    render(<DatePicker label="Day" error="Choose a day" />);
    const group = screen.getByRole('group', { name: 'Day' });
    expect(group.getAttribute('data-invalid')).toBe('true');
    expect(screen.getByText('Choose a day')).not.toBeNull();
    await expectNoAxeViolations();
  });

  it('the calendar: month and year selects, a press chooses, the focus goes back', async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Date of birth" defaultValue="2000-01-10" onChange={onChange} />);
    const button = screen.getByRole('button', { name: /Calendar/ });
    await userEvent.click(button);
    const dialog = screen.getByRole('dialog');
    const grid = within(dialog).getByRole('grid');
    expect(grid.getAttribute('aria-label')).toMatch(/January 2000/);
    await expectNoAxeViolations();
    await userEvent.selectOptions(within(dialog).getByRole('combobox', { name: 'Year' }), '1995');
    await userEvent.selectOptions(within(dialog).getByRole('combobox', { name: 'Month' }), '8');
    expect(within(dialog).getByRole('grid').getAttribute('aria-label')).toMatch(/August 1995/);
    await userEvent.click(within(dialog).getByText('15'));
    expect(onChange).toHaveBeenLastCalledWith('1995-08-15');
    expect(screen.queryByRole('dialog')).toBeNull();
    // React Aria gives the focus back a frame later
    await waitFor(() => {
      expect(document.activeElement).toBe(button);
    });
  });

  it('the years run from minValue to maxValue', async () => {
    render(<DatePicker label="Day" minValue="2026-01-01" maxValue="2028-12-31" />);
    await userEvent.click(screen.getByRole('button', { name: /Calendar/ }));
    const year = within(screen.getByRole('dialog')).getByRole('combobox', { name: 'Year' });
    expect([...(year as HTMLSelectElement).options].map((option) => option.value)).toEqual([
      '2026',
      '2027',
      '2028',
    ]);
  });

  it('days outside the range cannot be pressed', async () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        label="Day"
        defaultValue="2026-11-10"
        minValue="2026-11-05"
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Calendar/ }));
    // (December's 3 is in the grid too, hidden)
    const cell = within(screen.getByRole('grid')).getByRole('button', {
      name: /, 3 November 2026/,
    });
    expect(cell.getAttribute('aria-disabled')).toBe('true');
    await userEvent.click(cell);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('DateRangePicker', () => {
  it('two ends typed in one box give { start, end }', async () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="Report period" onChange={onChange} />);
    const group = screen.getByRole('group', { name: 'Report period' });
    await userEvent.click(at(segments(group)));
    await userEvent.keyboard('0110202631102026');
    expect(onChange).toHaveBeenLastCalledWith({ start: '2026-10-01', end: '2026-10-31' });
    await expectNoAxeViolations();
  });

  it('with a time, both ends are instants', async () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="Valid" withTime onChange={onChange} />);
    const group = screen.getByRole('group', { name: 'Valid' });
    await userEvent.click(at(segments(group)));
    await userEvent.keyboard('011120261000a071120261159p');
    expect(onChange).toHaveBeenLastCalledWith({
      start: '2026-11-01T04:30:00.000Z',
      end: '2026-11-07T18:29:00.000Z',
    });
  });

  it('an end before the start is wrong', async () => {
    function Field() {
      const [value, setValue] = useState<DateRange | null>(null);
      return <DateRangePicker label="Period" value={value} onChange={setValue} />;
    }
    render(<Field />);
    const group = screen.getByRole('group', { name: 'Period' });
    await userEvent.click(at(segments(group)));
    await userEvent.keyboard('2010202610102026');
    expect(screen.getByText('The end must not be before the start.')).not.toBeNull();
  });

  it('the calendar: the first press starts, the second ends', async () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker
        label="Period"
        defaultValue={{ start: '2026-11-02', end: '2026-11-03' }}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Calendar/ }));
    const grid = within(screen.getByRole('dialog')).getByRole('grid');
    await userEvent.click(within(grid).getByText('10'));
    await userEvent.click(within(grid).getByText('14'));
    expect(onChange).toHaveBeenLastCalledWith({ start: '2026-11-10', end: '2026-11-14' });
  });
});
