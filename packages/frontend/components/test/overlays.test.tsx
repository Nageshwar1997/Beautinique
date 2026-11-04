import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button, Dialog, type DialogProps, Tooltip } from '../src/index';
import { expectNoAxeViolations } from './axe';

afterEach(() => {
  cleanup();
});

type Extra = Partial<Omit<DialogProps, 'open' | 'onOpenChange'>>;

function Opener({ onOpenChange, ...extra }: Extra & { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const change = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };
  return (
    <>
      <Button
        onClick={() => {
          change(true);
        }}
      >
        Remove
      </Button>
      <Dialog
        title="Delete this address?"
        description="It goes from every order form."
        footer={
          <>
            <Button
              variant="outline"
              tone="neutral"
              onClick={() => {
                change(false);
              }}
            >
              Cancel
            </Button>
            <Button tone="error">Delete</Button>
          </>
        }
        {...extra}
        open={open}
        onOpenChange={change}
      >
        <p>Home, Pune</p>
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('renders nothing while closed', () => {
    render(<Dialog open={false} onOpenChange={vi.fn()} title="Hidden" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens named by its title, moves focus in, and passes axe', async () => {
    render(<Opener />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete this address?' });
    expect(dialog.textContent).toContain('It goes from every order form.');
    expect(dialog.textContent).toContain('Home, Pune');
    expect(dialog.contains(document.activeElement)).toBe(true);
    await expectNoAxeViolations();
  });

  it('closes with its close button and gives the focus back to the opener', async () => {
    const onOpenChange = vi.fn();
    render(<Opener onOpenChange={onOpenChange} />);
    const opener = screen.getByRole('button', { name: 'Remove' });
    await userEvent.click(opener);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    // React Aria gives the focus back a frame after the dialog goes
    await waitFor(() => {
      expect(document.activeElement).toBe(opener);
    });
  });

  it('closes on Escape and on a click outside', async () => {
    render(<Opener />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    const backdrop = screen.getByRole('dialog').closest('.fixed');
    expect(backdrop).not.toBeNull();
    if (backdrop) await userEvent.click(backdrop);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('keeps the focus inside while open (Tab wraps around)', async () => {
    render(<Opener />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    const dialog = screen.getByRole('dialog');
    for (let step = 0; step < 6; step += 1) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it('not dismissable: no close button, Escape and outside clicks do nothing', async () => {
    render(<Opener dismissable={false} role="alertdialog" />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Delete this address?' });
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    await userEvent.keyboard('{Escape}');
    const backdrop = dialog.closest('.fixed');
    if (backdrop) await userEvent.click(backdrop);
    expect(screen.getByRole('alertdialog')).toBe(dialog);
    // the footer still closes it
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    await expectNoAxeViolations();
  });

  it('has a width per size, md by default', async () => {
    const { rerender } = render(<Dialog open onOpenChange={vi.fn()} title="Sized" />);
    const box = () => screen.getByRole('dialog').parentElement;
    expect(box()?.classList).toContain('max-w-lg');
    rerender(<Dialog open onOpenChange={vi.fn()} title="Sized" size="sm" />);
    expect(box()?.classList).toContain('max-w-sm');
    rerender(<Dialog open onOpenChange={vi.fn()} title="Sized" size="lg" />);
    expect(box()?.classList).toContain('max-w-2xl');
    await expectNoAxeViolations();
  });
});

describe('Tooltip', () => {
  it('shows on keyboard focus of a Button, describes it, and hides on Escape', async () => {
    render(
      <Tooltip content="Copy the codes">
        <Button variant="ghost" icon={<svg />} aria-label="Copy" />
      </Tooltip>,
    );
    const button = screen.getByRole('button', { name: 'Copy' });
    expect(screen.queryByRole('tooltip')).toBeNull();
    await userEvent.tab();
    expect(document.activeElement).toBe(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.textContent).toBe('Copy the codes');
    expect(button.getAttribute('aria-describedby')).toBe(tooltip.id);
    // the name stays the button's own
    expect(screen.getByRole('button', { name: 'Copy' })).toBe(button);
    await expectNoAxeViolations();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  it('shows on hover after its delay and goes when the pointer leaves', async () => {
    render(
      <Tooltip content="Add to wishlist" delay={0} placement="bottom">
        <Button variant="soft">Save</Button>
      </Tooltip>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    // a real mouse moves over the page before it reaches the button (React Aria reads that)
    await userEvent.hover(document.body);
    await userEvent.hover(button);
    expect((await screen.findByRole('tooltip')).textContent).toBe('Add to wishlist');
    await userEvent.unhover(button);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  it('does not show for a mouse click focus', async () => {
    render(
      <Tooltip content="More">
        <Button>Open</Button>
      </Tooltip>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
