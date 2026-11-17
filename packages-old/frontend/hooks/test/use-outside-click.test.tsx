import { cleanup, fireEvent, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type OutsideClickOptions, useOutsideClick } from '../src/use-outside-click';

type TCallback = (event: PointerEvent) => void;

interface HarnessProps {
  callback: TCallback;
  options?: OutsideClickOptions;
}

const Harness = ({ callback, options }: HarnessProps) => {
  const ref = useOutsideClick<HTMLDivElement>(callback, options);

  return (
    <div>
      <div ref={ref} data-testid="inside">
        <button data-testid="inside-child">inside</button>
      </div>
      <button data-testid="outside">outside</button>
    </div>
  );
};

const press = (element: Element) => {
  fireEvent.pointerDown(element);
};

describe('useOutsideClick', () => {
  // Testing Library only auto-cleans when `afterEach` is a global (vitest globals are off here).
  afterEach(() => {
    cleanup();
  });

  it('calls the callback when the press happens outside the element', () => {
    const callback = vi.fn();
    const { getByTestId } = render(<Harness callback={callback} />);

    press(getByTestId('outside'));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('passes the original event to the callback', () => {
    const callback = vi.fn<TCallback>();
    const { getByTestId } = render(<Harness callback={callback} />);
    const outside = getByTestId('outside');

    press(outside);

    expect(callback.mock.calls[0]?.[0].target).toBe(outside);
    expect(callback.mock.calls[0]?.[0].type).toBe('pointerdown');
  });

  it('ignores presses on the element itself and on its children', () => {
    const callback = vi.fn();
    const { getByTestId } = render(<Harness callback={callback} />);

    press(getByTestId('inside'));
    press(getByTestId('inside-child'));

    expect(callback).not.toHaveBeenCalled();
  });

  it('does nothing while the ref is not attached to an element', () => {
    const callback = vi.fn();
    const NoRef = () => {
      useOutsideClick<HTMLDivElement>(callback);
      return <button data-testid="somewhere">somewhere</button>;
    };
    const { getByTestId } = render(<NoRef />);

    press(getByTestId('somewhere'));

    expect(callback).not.toHaveBeenCalled();
  });

  it('is enabled by default when no options are passed', () => {
    const callback = vi.fn();
    const { getByTestId } = render(<Harness callback={callback} />);

    press(getByTestId('outside'));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('is enabled when the options object leaves `enabled` out', () => {
    const callback = vi.fn();
    const { getByTestId } = render(<Harness callback={callback} options={{}} />);

    press(getByTestId('outside'));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not listen while `enabled` is false, and starts when it turns true', () => {
    const callback = vi.fn();
    const { getByTestId, rerender } = render(
      <Harness callback={callback} options={{ enabled: false }} />,
    );

    press(getByTestId('outside'));
    expect(callback).not.toHaveBeenCalled();

    rerender(<Harness callback={callback} options={{ enabled: true }} />);
    press(getByTestId('outside'));
    expect(callback).toHaveBeenCalledTimes(1);

    rerender(<Harness callback={callback} options={{ enabled: false }} />);
    press(getByTestId('outside'));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('stops listening after unmount', () => {
    const callback = vi.fn();
    const { getByTestId, unmount } = render(<Harness callback={callback} />);
    const outside = getByTestId('outside');

    unmount();
    press(document.body);
    press(outside);

    expect(callback).not.toHaveBeenCalled();
  });

  it('still sees the press when an inner handler stops propagation (capture phase)', () => {
    const callback = vi.fn();
    const { getByTestId } = render(<Harness callback={callback} />);
    const outside = getByTestId('outside');
    outside.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
    });

    press(outside);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls the latest callback after it changes', () => {
    const oldCallback = vi.fn();
    const newCallback = vi.fn();
    const { getByTestId, rerender } = render(<Harness callback={oldCallback} />);

    rerender(<Harness callback={newCallback} />);
    press(getByTestId('outside'));

    expect(oldCallback).not.toHaveBeenCalled();
    expect(newCallback).toHaveBeenCalledTimes(1);
  });

  describe('subscription', () => {
    const pointerdownCalls = (spy: { mock: { calls: unknown[][] } }) =>
      spy.mock.calls.filter(([type]) => type === 'pointerdown').length;

    it('adds one document listener and keeps it while the callback changes on every render', () => {
      const add = vi.spyOn(document, 'addEventListener');
      const remove = vi.spyOn(document, 'removeEventListener');
      const Inline = () => {
        const ref = useOutsideClick<HTMLDivElement>(() => undefined); // new function each render
        return <div ref={ref} />;
      };

      const { rerender } = render(<Inline />);
      rerender(<Inline />);
      rerender(<Inline />);
      rerender(<Inline />);

      expect(pointerdownCalls(add)).toBe(1);
      expect(pointerdownCalls(remove)).toBe(0);
      add.mockRestore();
      remove.mockRestore();
    });

    it('removes the listener when it is disabled and adds it back when enabled again', () => {
      const add = vi.spyOn(document, 'addEventListener');
      const remove = vi.spyOn(document, 'removeEventListener');
      const callback = vi.fn();
      const { rerender } = render(<Harness callback={callback} options={{ enabled: true }} />);
      expect([pointerdownCalls(add), pointerdownCalls(remove)]).toEqual([1, 0]);

      rerender(<Harness callback={callback} options={{ enabled: false }} />);
      expect([pointerdownCalls(add), pointerdownCalls(remove)]).toEqual([1, 1]);

      rerender(<Harness callback={callback} options={{ enabled: true }} />);
      expect([pointerdownCalls(add), pointerdownCalls(remove)]).toEqual([2, 1]);
      add.mockRestore();
      remove.mockRestore();
    });

    it('removes the listener on unmount', () => {
      const add = vi.spyOn(document, 'addEventListener');
      const remove = vi.spyOn(document, 'removeEventListener');
      const { unmount } = render(<Harness callback={vi.fn()} />);

      unmount();

      expect(pointerdownCalls(add)).toBe(1);
      expect(pointerdownCalls(remove)).toBe(1);
      add.mockRestore();
      remove.mockRestore();
    });

    it('registers and removes the listener with the same capture flag', () => {
      const add = vi.spyOn(document, 'addEventListener');
      const remove = vi.spyOn(document, 'removeEventListener');
      const { unmount } = render(<Harness callback={vi.fn()} />);

      unmount();

      const addArgs = add.mock.calls.find(([type]) => type === 'pointerdown');
      const removeArgs = remove.mock.calls.find(([type]) => type === 'pointerdown');
      expect(addArgs?.[1]).toBe(removeArgs?.[1]);
      expect(addArgs?.[2]).toBe(true);
      expect(removeArgs?.[2]).toBe(true);
      add.mockRestore();
      remove.mockRestore();
    });
  });

  describe('React StrictMode', () => {
    it('calls the callback once per press and leaves a single listener', () => {
      const add = vi.spyOn(document, 'addEventListener');
      const remove = vi.spyOn(document, 'removeEventListener');
      const callback = vi.fn();
      const { getByTestId, unmount } = render(
        <StrictMode>
          <Harness callback={callback} />
        </StrictMode>,
      );

      press(getByTestId('outside'));
      expect(callback).toHaveBeenCalledTimes(1);

      unmount();
      const live =
        add.mock.calls.filter(([type]) => type === 'pointerdown').length -
        remove.mock.calls.filter(([type]) => type === 'pointerdown').length;
      expect(live).toBe(0);
      add.mockRestore();
      remove.mockRestore();
    });
  });

  describe('the element behind the ref', () => {
    const Swappable = ({ which, callback }: { which: 'a' | 'b'; callback: TCallback }) => {
      const ref = useOutsideClick<HTMLDivElement>(callback);

      return (
        <div>
          <div key={which} ref={ref} data-testid={`box-${which}`} />
          <button data-testid="outside">outside</button>
        </div>
      );
    };

    it('keeps working when the element is replaced by another one', () => {
      const callback = vi.fn();
      const { getByTestId, rerender } = render(<Swappable which="a" callback={callback} />);

      rerender(<Swappable which="b" callback={callback} />);

      press(getByTestId('box-b'));
      expect(callback).not.toHaveBeenCalled();

      press(getByTestId('outside'));
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  it('accepts a callback typed with the real event type, PointerEvent', () => {
    const received: string[] = [];
    const typed = (event: PointerEvent) => {
      received.push(event.pointerType);
    };
    const { getByTestId } = render(<Harness callback={typed} />);

    press(getByTestId('outside'));

    expect(received).toHaveLength(1);
  });
});
