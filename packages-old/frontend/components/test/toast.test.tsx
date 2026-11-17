import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearToasts, dismissToast, toast, Toaster, VISIBLE_TOASTS } from '../src/index';
import { expectNoAxeViolations } from './axe';

afterEach(() => {
  vi.useRealTimers();
  act(() => {
    clearToasts();
  });
  cleanup();
});

const region = () => screen.getByRole('region', { name: 'Notifications' });
const cards = () => within(region()).queryAllByRole('listitem');
const titles = () => cards().map((card) => card.querySelector('p')?.textContent);
const wait = (ms: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

describe('toast store', () => {
  it('returns an id; the same id replaces the toast that has it', () => {
    render(<Toaster />);
    let first = '';
    act(() => {
      first = toast({ title: 'One' });
      toast({ id: 'offline', tone: 'warning', title: 'You are offline' });
      toast({ id: 'offline', tone: 'warning', title: 'Still offline' });
    });
    expect(first).toMatch(/^toast-\d+$/);
    expect(titles()).toEqual(['One', 'Still offline']);
  });

  it('dismissToast and clearToasts take them away (and do nothing when there is nothing)', async () => {
    render(<Toaster />);
    let id = '';
    act(() => {
      id = toast({ title: 'One' });
      toast({ title: 'Two' });
    });
    act(() => {
      dismissToast(id);
      dismissToast(id);
      dismissToast('nope');
    });
    await waitFor(() => {
      expect(titles()).toEqual(['Two']);
    });
    act(() => {
      clearToasts();
      clearToasts();
    });
    await waitFor(() => {
      expect(cards()).toHaveLength(0);
    });
  });

  it('works without a Toaster on screen and shows what is waiting once one mounts', () => {
    act(() => {
      toast({ title: 'Saved before the Toaster' });
    });
    render(<Toaster />);
    expect(titles()).toEqual(['Saved before the Toaster']);
  });
});

describe('Toaster', () => {
  it('is a Notifications landmark with the toast, its icon, text and a named dismiss button', async () => {
    render(<Toaster />);
    act(() => {
      toast({ tone: 'success', title: 'Address saved', description: 'Home, Pune' });
    });
    const [card] = cards();
    expect(card?.textContent).toContain('Address saved');
    expect(card?.textContent).toContain('Home, Pune');
    expect(card?.classList).toContain('tone-success');
    expect(card?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss: Address saved' }));
    await waitFor(() => {
      expect(cards()).toHaveLength(0);
    });
  });

  it(`shows the newest ${String(VISIBLE_TOASTS)}; the next waits until one goes`, async () => {
    render(<Toaster />);
    act(() => {
      for (const title of ['A', 'B', 'C', 'D']) toast({ title, duration: null });
    });
    expect(titles()).toEqual(['B', 'C', 'D']);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss: D' }));
    await waitFor(() => {
      expect(titles()).toEqual(['A', 'B', 'C']);
    });
  });

  it('runs the action once and then goes', async () => {
    const onAction = vi.fn();
    render(<Toaster />);
    act(() => {
      toast({ title: 'Address removed', action: { label: 'Undo', onAction } });
    });
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onAction).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(cards()).toHaveLength(0);
    });
  });

  it('reads each new toast out once: errors at once, the rest politely', async () => {
    render(<Toaster />);
    const polite = region().querySelector('[aria-live="polite"]');
    const assertive = region().querySelector('[aria-live="assertive"]');
    act(() => {
      toast({ tone: 'success', title: 'Saved', description: 'All good' });
      toast({ tone: 'error', title: 'Could not pay' });
    });
    await waitFor(() => {
      expect(polite?.textContent).toBe('Saved. All good');
    });
    expect(assertive?.textContent).toBe('Could not pay');
    // a later toast is read alone, not the ones already read
    act(() => {
      toast({ tone: 'info', title: 'New offer' });
    });
    await waitFor(() => {
      expect(polite?.textContent).toBe('New offer');
    });
    expect(assertive?.textContent).toBe('');
    await expectNoAxeViolations();
  });

  it('goes by itself after its duration; an error stays until dismissed', async () => {
    render(<Toaster />);
    act(() => {
      toast({ tone: 'success', title: 'Quick', duration: 150 });
      toast({ tone: 'error', title: 'Stays' });
    });
    await wait(50);
    expect(titles()).toEqual(['Quick', 'Stays']);
    await waitFor(() => {
      expect(titles()).toEqual(['Stays']);
    });
  });

  it('has the default durations: 5 s success and info, 7 s warning, none for errors', () => {
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast({ tone: 'success', title: 'S' });
      toast({ tone: 'info', title: 'I' });
      toast({ tone: 'warning', title: 'W' });
    });
    act(() => {
      vi.advanceTimersByTime(4990);
    });
    expect(titles()).toEqual(['S', 'I', 'W']);
    act(() => {
      vi.advanceTimersByTime(20);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(titles()).toEqual(['W']);
    act(() => {
      toast({ tone: 'error', title: 'E' });
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(titles()).toEqual(['E']);
    act(() => {
      vi.advanceTimersByTime(600_000);
    });
    expect(titles()).toEqual(['E']);
  });

  it('a hovered toaster stops the clocks; they go on, with what was left, after', async () => {
    render(<Toaster />);
    act(() => {
      toast({ title: 'Hold me', duration: 300 });
    });
    await wait(100);
    const [card] = cards();
    if (card) fireEvent.mouseEnter(card);
    await wait(400);
    expect(titles()).toEqual(['Hold me']);
    if (card) fireEvent.mouseLeave(card);
    await waitFor(() => {
      expect(cards()).toHaveLength(0);
    });
  });

  it('a focused toast stops the clocks too, until the focus leaves the toaster', async () => {
    render(
      <>
        <button type="button">Outside</button>
        <Toaster />
      </>,
    );
    act(() => {
      toast({ title: 'Focus me', duration: 200, action: { label: 'Open', onAction: vi.fn() } });
    });
    act(() => {
      screen.getByRole('button', { name: 'Open' }).focus();
    });
    await wait(350);
    expect(titles()).toEqual(['Focus me']);
    // focus moving within the toaster keeps them paused
    act(() => {
      screen.getByRole('button', { name: 'Dismiss: Focus me' }).focus();
    });
    await wait(300);
    expect(titles()).toEqual(['Focus me']);
    act(() => {
      screen.getByRole('button', { name: 'Outside' }).focus();
    });
    await waitFor(() => {
      expect(cards()).toHaveLength(0);
    });
  });
});
