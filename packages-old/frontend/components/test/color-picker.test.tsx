import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ColorPicker } from '../src/index';
import { at } from './at';
import { expectNoAxeViolations } from './axe';

afterEach(() => {
  cleanup();
});

describe('ColorPicker', () => {
  it('a typed hex is the value, in capitals, once the box is left', async () => {
    const onChange = vi.fn();
    render(<ColorPicker label="Shade colour" onChange={onChange} hint="As on the pack" />);
    const input = screen.getByRole('textbox', { name: 'Shade colour' });
    expect(input.getAttribute('placeholder')).toBe('#RRGGBB');
    await expectNoAxeViolations();
    await userEvent.type(input, 'c2185b');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith('#C2185B');
    expect(input).toHaveProperty('value', '#C2185B');
  });

  it('emptying the box empties the value', async () => {
    const onChange = vi.fn();
    render(<ColorPicker label="Shade colour" defaultValue="#C2185B" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Shade colour' });
    await userEvent.clear(input);
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('the picker: a ready colour is chosen with a press', async () => {
    const onChange = vi.fn();
    render(
      <ColorPicker
        label="Shade colour"
        defaultValue="#FF0000"
        swatches={['#8B1E3F', '#C2185B']}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open the colour picker' }));
    const dialog = screen.getByRole('dialog', { name: 'Colour picker' });
    await expectNoAxeViolations();
    const ready = within(dialog).getByRole('listbox', { name: 'Ready colours' });
    const options = within(ready).getAllByRole('option');
    await userEvent.click(at(options, 1));
    expect(onChange).toHaveBeenLastCalledWith('#C2185B');
    // the open picker hides the page from screen readers
    expect(screen.getByRole('textbox', { name: 'Shade colour', hidden: true })).toHaveProperty(
      'value',
      '#C2185B',
    );
  });

  it('the hue slider and the area move with the arrow keys', async () => {
    const onChange = vi.fn();
    render(<ColorPicker label="Shade colour" defaultValue="#FF0000" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open the colour picker' }));
    const dialog = screen.getByRole('dialog', { name: 'Colour picker' });
    const hue = within(dialog).getByRole('slider', { name: /Hue/ });
    hue.focus();
    await userEvent.keyboard('{ArrowRight}');
    const afterHue = onChange.mock.lastCall?.[0] as string;
    expect(afterHue).toMatch(/^#[0-9A-F]{6}$/);
    expect(afterHue).not.toBe('#FF0000');
    // the area: two sliders (saturation, brightness)
    const saturation = at(
      within(dialog)
        .getAllByRole('slider')
        .filter((slider) => slider !== hue),
    );
    saturation.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange.mock.lastCall?.[0]).not.toBe(afterHue);
  });

  it('a grey keeps its hue: the slider does not jump while saturation is 0', async () => {
    const onChange = vi.fn();
    render(<ColorPicker label="Shade colour" defaultValue="#3366FF" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open the colour picker' }));
    const dialog = screen.getByRole('dialog', { name: 'Colour picker' });
    const hue = within(dialog).getByRole('slider', { name: /Hue/ });
    const before = hue.getAttribute('aria-valuenow');
    const saturation = at(
      within(dialog)
        .getAllByRole('slider')
        .filter((slider) => slider !== hue),
    );
    saturation.focus();
    // all the way to grey
    await userEvent.keyboard('{Home}');
    expect(hue.getAttribute('aria-valuenow')).toBe(before);
  });

  it('with an error it is invalid and says so; disabled, the picker button is too', async () => {
    const { rerender } = render(<ColorPicker label="Shade colour" error="Choose a colour" />);
    const input = screen.getByRole('textbox', { name: 'Shade colour' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Choose a colour')).not.toBeNull();
    await expectNoAxeViolations();
    rerender(<ColorPicker label="Shade colour" isDisabled />);
    expect(input).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Open the colour picker' })).toHaveProperty(
      'disabled',
      true,
    );
  });
});
