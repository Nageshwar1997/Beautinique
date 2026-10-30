import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button, BUTTON_SIZES, BUTTON_VARIANTS, Spinner, TONES } from '../src/index';
import { expectNoAxeViolations } from './axe';

afterEach(() => {
  cleanup();
});

const Icon = () => <svg data-testid="icon" />;

describe('Button', () => {
  it('is a type="button" by default, so a form submits only when it says so', () => {
    render(
      <form
        onSubmit={() => {
          throw new Error('must not submit');
        }}
      >
        <Button>Save</Button>
        <Button type="submit">Send</Button>
      </form>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toHaveProperty('type', 'button');
    expect(screen.getByRole('button', { name: 'Send' })).toHaveProperty('type', 'submit');
  });

  it('is solid, brand and md by default: a pill with a 44 px touch height', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    for (const name of ['bg-tone', 'tone-brand', 'min-h-touch', 'rounded-full'])
      expect(button.classList).toContain(name);
  });

  it('has a look for every variant and a colour for every tone except on primary', () => {
    const looks = new Set<string>();
    for (const variant of BUTTON_VARIANTS) {
      const { unmount } = render(
        <Button variant={variant} tone="success">
          Go
        </Button>,
      );
      const button = screen.getByRole('button', { name: 'Go' });
      looks.add(button.className);
      // primary is the brand gradient: no tone class
      expect(button.classList.contains('tone-success')).toBe(variant !== 'primary');
      if (variant === 'primary') expect(button.classList).toContain('bg-brand-gradient');
      unmount();
    }
    expect(looks.size).toBe(BUTTON_VARIANTS.length);
    for (const tone of TONES) {
      const { unmount } = render(<Button tone={tone}>Go</Button>);
      expect(screen.getByRole('button', { name: 'Go' }).classList).toContain(`tone-${tone}`);
      unmount();
    }
  });

  it('keeps a 44 px touch area at sm and grows at lg', () => {
    const height: Record<string, string> = {};
    for (const size of BUTTON_SIZES) {
      const { unmount } = render(<Button size={size}>Go</Button>);
      height[size] = screen.getByRole('button', { name: 'Go' }).className;
      unmount();
    }
    expect(height.sm).toContain('touch-target');
    expect(height.md).toContain('min-h-touch');
    expect(height.lg).toContain('min-h-12');
  });

  it('shows the start and end icons, hidden from screen readers', () => {
    render(
      <Button startIcon={<Icon />} endIcon={<Icon />}>
        Next
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Next' });
    const icons = screen.getAllByTestId('icon');
    expect(icons).toHaveLength(2);
    for (const icon of icons) {
      expect(button.contains(icon)).toBe(true);
      expect(icon.parentElement?.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('an icon-only button is square and named by its aria-label', async () => {
    render(<Button variant="ghost" icon={<Icon />} aria-label="Close" />);
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button.classList).toContain('size-touch');
    expect(button.textContent).toBe('');
    await expectNoAxeViolations();
  });

  it('loading: busy, the spinner in place of the start icon, the text stays, no click', async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button loading startIcon={<Icon />} endIcon={<Icon />} onClick={onClick}>
        Sign in
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Sign in' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(screen.queryByTestId('icon')).toBeNull();
    expect(button.querySelector('.animate-spin')).not.toBeNull();
    // still focusable and in the tab order (disabled would drop the focus)
    expect(button.hasAttribute('disabled')).toBe(false);
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();

    rerender(
      <Button startIcon={<Icon />} onClick={onClick}>
        Sign in
      </Button>,
    );
    expect(button.hasAttribute('aria-busy')).toBe(false);
    expect(button.querySelector('.animate-spin')).toBeNull();
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('a loading icon-only button shows the spinner instead of its icon', () => {
    render(<Button loading icon={<Icon />} aria-label="Refresh" />);
    const button = screen.getByRole('button', { name: 'Refresh' });
    expect(screen.queryByTestId('icon')).toBeNull();
    expect(button.querySelector('.animate-spin')).not.toBeNull();
  });

  it('disabled does nothing; fullWidth, className, other attributes and the ref pass through', async () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button disabled fullWidth className="mt-4" data-x="1" ref={ref} onClick={onClick}>
        Pay
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Pay' });
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button.classList).toContain('w-full');
    expect(button.classList).toContain('mt-4');
    expect(button.dataset.x).toBe('1');
    expect(ref.current).toBe(button);
  });

  it('works from the keyboard and passes axe in every variant', async () => {
    const onClick = vi.fn();
    render(
      <div>
        {BUTTON_VARIANTS.map((variant) => (
          <Button key={variant} variant={variant} onClick={onClick}>
            {variant}
          </Button>
        ))}
      </div>,
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'primary' }));
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
    await expectNoAxeViolations();
  });
});

describe('Spinner', () => {
  it('without a label it is hidden from screen readers', () => {
    const { container } = render(<Spinner />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  it('with a label it is a status that says it', async () => {
    render(<Spinner label="Loading orders" size="lg" className="mx-auto" />);
    const status = screen.getByRole('status');
    expect(status.textContent).toBe('Loading orders');
    expect(status.classList).toContain('mx-auto');
    expect(status.querySelector('.size-8')).not.toBeNull();
    await expectNoAxeViolations();
  });
});
