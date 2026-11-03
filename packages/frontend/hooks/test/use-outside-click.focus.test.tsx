import { cleanup, fireEvent, render } from '@testing-library/react';
import { StrictMode, useRef } from 'react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { useOutsideClick } from '../src/use-outside-click';

interface HarnessProps {
  callback?: (event: PointerEvent) => void;
  onFocusOutside?: (event: FocusEvent) => void;
  enabled?: boolean;
}

const Harness = ({ callback = () => undefined, onFocusOutside, enabled }: HarnessProps) => {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const ref = useOutsideClick<HTMLDivElement>(callback, {
    ...(onFocusOutside ? { onFocusOutside } : {}),
    ...(enabled === undefined ? {} : { enabled }),
    ignore: [popupRef],
  });

  return (
    <div>
      <div ref={ref}>
        <input data-testid="inside-input" />
      </div>
      {createPortal(
        <div ref={popupRef}>
          <input data-testid="popup-input" />
        </div>,
        document.body,
      )}
      <input data-testid="outside-input" />
      <button data-testid="outside-button">outside</button>
    </div>
  );
};

const focusinCalls = (spy: { mock: { calls: unknown[][] } }) =>
  spy.mock.calls.filter(([type]) => type === 'focusin').length;

describe('useOutsideClick: focus moving outside (`onFocusOutside`)', () => {
  afterEach(() => {
    cleanup();
    document.body.replaceChildren();
  });

  it('is off without `onFocusOutside`: no focus listener is added, nothing is reported', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const callback = vi.fn();
    const { getByTestId } = render(<Harness callback={callback} />);

    getByTestId('inside-input').focus();
    getByTestId('outside-input').focus();

    expect(callback).not.toHaveBeenCalled();
    expect(focusinCalls(add)).toBe(0);
    add.mockRestore();
  });

  it('reports focus that moves to an element outside, with the FocusEvent', () => {
    const onFocusOutside = vi.fn<(event: FocusEvent) => void>();
    const { getByTestId } = render(<Harness onFocusOutside={onFocusOutside} />);

    getByTestId('inside-input').focus();
    expect(onFocusOutside).not.toHaveBeenCalled();

    getByTestId('outside-input').focus(); // e.g. the user pressed Tab

    expect(onFocusOutside).toHaveBeenCalledTimes(1);
    expect(onFocusOutside.mock.calls[0]?.[0].type).toBe('focusin');
    expect(onFocusOutside.mock.calls[0]?.[0].target).toBe(getByTestId('outside-input'));
  });

  it('does not report focus that stays inside, or goes into an ignored popup', () => {
    const onFocusOutside = vi.fn();
    const { getByTestId } = render(<Harness onFocusOutside={onFocusOutside} />);

    getByTestId('inside-input').focus();
    fireEvent.focusIn(getByTestId('inside-input'));
    getByTestId('popup-input').focus();

    expect(onFocusOutside).not.toHaveBeenCalled();
  });

  it('keeps reporting presses outside to `callback`, and focus does not go to it', () => {
    const callback = vi.fn();
    const onFocusOutside = vi.fn();
    const { getByTestId } = render(<Harness callback={callback} onFocusOutside={onFocusOutside} />);

    fireEvent.pointerDown(getByTestId('outside-button'));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(onFocusOutside).not.toHaveBeenCalled();

    getByTestId('outside-input').focus();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(onFocusOutside).toHaveBeenCalledTimes(1);
  });

  it('a press on a focusable element outside reaches both: the press, then the focus', () => {
    const order: string[] = [];
    const { getByTestId } = render(
      <Harness callback={() => order.push('press')} onFocusOutside={() => order.push('focus')} />,
    );
    const button = getByTestId('outside-button');

    fireEvent.pointerDown(button);
    button.focus();

    expect(order).toEqual(['press', 'focus']);
  });

  it('sees focus even when an inner handler stops propagation (capture phase)', () => {
    const onFocusOutside = vi.fn();
    const { getByTestId } = render(<Harness onFocusOutside={onFocusOutside} />);
    const outside = getByTestId('outside-input');
    outside.addEventListener('focusin', (event) => {
      event.stopPropagation();
    });

    outside.focus();

    expect(onFocusOutside).toHaveBeenCalledTimes(1);
  });

  it('adds and removes the focus listener with the option, with the same capture flag', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const { rerender, unmount } = render(<Harness />);
    expect([focusinCalls(add), focusinCalls(remove)]).toEqual([0, 0]);

    rerender(<Harness onFocusOutside={() => undefined} />);
    expect([focusinCalls(add), focusinCalls(remove)]).toEqual([1, 0]);

    rerender(<Harness onFocusOutside={() => undefined} />); // a new function: nothing changes
    expect([focusinCalls(add), focusinCalls(remove)]).toEqual([1, 0]);

    rerender(<Harness />);
    expect([focusinCalls(add), focusinCalls(remove)]).toEqual([1, 1]);

    rerender(<Harness onFocusOutside={() => undefined} />);
    unmount();
    expect([focusinCalls(add), focusinCalls(remove)]).toEqual([2, 2]);

    const addArgs = add.mock.calls.find(([type]) => type === 'focusin');
    const removeArgs = remove.mock.calls.find(([type]) => type === 'focusin');
    expect(addArgs?.[1]).toBe(removeArgs?.[1]);
    expect(addArgs?.[2]).toBe(true);
    expect(removeArgs?.[2]).toBe(true);
    add.mockRestore();
    remove.mockRestore();
  });

  it('listens to nothing while `enabled` is false', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const callback = vi.fn();
    const onFocusOutside = vi.fn();
    const { getByTestId } = render(
      <Harness callback={callback} onFocusOutside={onFocusOutside} enabled={false} />,
    );

    getByTestId('outside-input').focus();
    fireEvent.pointerDown(getByTestId('outside-button'));

    expect(callback).not.toHaveBeenCalled();
    expect(onFocusOutside).not.toHaveBeenCalled();
    expect(focusinCalls(add)).toBe(0);
    add.mockRestore();
  });

  it('calls the latest `onFocusOutside`', () => {
    const oldHandler = vi.fn();
    const newHandler = vi.fn();
    const { getByTestId, rerender } = render(<Harness onFocusOutside={oldHandler} />);

    rerender(<Harness onFocusOutside={newHandler} />);
    getByTestId('outside-input').focus();

    expect(oldHandler).not.toHaveBeenCalled();
    expect(newHandler).toHaveBeenCalledTimes(1);
  });

  it('under StrictMode calls once per focus and leaves no listener behind', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const onFocusOutside = vi.fn();
    const { getByTestId, unmount } = render(
      <StrictMode>
        <Harness onFocusOutside={onFocusOutside} />
      </StrictMode>,
    );

    getByTestId('outside-input').focus();
    expect(onFocusOutside).toHaveBeenCalledTimes(1);

    unmount();
    expect(focusinCalls(add) - focusinCalls(remove)).toBe(0);
    add.mockRestore();
    remove.mockRestore();
  });
});

describe('useOutsideClick: types', () => {
  it('`callback` always gets a PointerEvent, `onFocusOutside` a FocusEvent', () => {
    const useTyped = () => {
      // never called, only type-checked
      useOutsideClick<HTMLDivElement>((event) => {
        expectTypeOf(event).toEqualTypeOf<PointerEvent>();
      });
      useOutsideClick<HTMLDivElement>(
        (event) => {
          expectTypeOf(event).toEqualTypeOf<PointerEvent>();
        },
        {
          enabled: true,
          onFocusOutside: (event) => {
            expectTypeOf(event).toEqualTypeOf<FocusEvent>();
          },
        },
      );
    };

    expectTypeOf(useTyped).toBeFunction();
  });

  it('returns a ref for the element type that was asked for', () => {
    type TRef = ReturnType<typeof useOutsideClick<HTMLDivElement>>;

    expectTypeOf<TRef['current']>().toEqualTypeOf<HTMLDivElement | null>();
  });
});
