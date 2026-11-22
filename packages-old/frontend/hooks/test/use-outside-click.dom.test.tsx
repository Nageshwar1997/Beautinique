import { cleanup, fireEvent, render } from '@testing-library/react';
import { type RefObject, useRef } from 'react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type OutsideClickOptions, useOutsideClick } from '../src/use-outside-click';

type TCallback = (event: PointerEvent) => void;

const press = (element: Element, init?: PointerEventInit) => {
  fireEvent.pointerDown(element, init);
};

const Harness = ({ callback, options }: { callback: TCallback; options?: OutsideClickOptions }) => {
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

// Like the apps' Select / HierarchySelect: the trigger is the element with the ref, the options list
// is portalled to <body>, so in the DOM it is not inside the element although it belongs to it.
const PortalHarness = ({
  callback,
  extraIgnore = [],
  withPopup = true,
}: {
  callback: TCallback;
  extraIgnore?: RefObject<Element | null>[];
  withPopup?: boolean;
}) => {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const ref = useOutsideClick<HTMLDivElement>(callback, { ignore: [popupRef, ...extraIgnore] });

  return (
    <div>
      <div ref={ref} data-testid="inside" />
      {withPopup &&
        createPortal(
          <div ref={popupRef} data-testid="popup">
            <button data-testid="popup-child">option</button>
          </div>,
          document.body,
        )}
      <button data-testid="outside">outside</button>
    </div>
  );
};

describe('useOutsideClick: the DOM it has to cope with', () => {
  afterEach(() => {
    cleanup();
    document.body.replaceChildren();
  });

  describe('pointer types', () => {
    it.each(['mouse', 'touch', 'pen'])(
      'reports a %s press outside, and not one inside',
      (pointerType) => {
        const callback = vi.fn<TCallback>();
        const { getByTestId } = render(<Harness callback={callback} />);

        press(getByTestId('inside-child'), { pointerType });
        expect(callback).not.toHaveBeenCalled();

        press(getByTestId('outside'), { pointerType });
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0]?.[0].pointerType).toBe(pointerType);
      },
    );
  });

  describe('shadow DOM', () => {
    // A listener on `document` sees a press inside a shadow root with `target` = the shadow host, so
    // `element.contains(event.target)` says "outside" for an element that lives inside the root.
    const renderInShadowRoot = (callback: TCallback) => {
      const host = document.createElement('div');
      document.body.append(host);
      const container = document.createElement('div');
      host.attachShadow({ mode: 'open' }).append(container);
      render(<Harness callback={callback} />, { container });

      return (testId: string) => {
        const found = container.querySelector(`[data-testid="${testId}"]`);

        if (!found) throw new Error(`no ${testId}`);

        return found;
      };
    };

    it('a press inside the element is inside, even when the element is in a shadow root', () => {
      const callback = vi.fn();
      const get = renderInShadowRoot(callback);

      press(get('inside'));
      press(get('inside-child'));

      expect(callback).not.toHaveBeenCalled();
    });

    it('a press elsewhere in the same shadow root is still outside', () => {
      const callback = vi.fn();
      const get = renderInShadowRoot(callback);

      press(get('outside'));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('a press on the shadow host itself (outside the element) is outside', () => {
      const callback = vi.fn();
      const get = renderInShadowRoot(callback);
      const host = get('inside').getRootNode() as ShadowRoot;

      press(host.host);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('a target that is removed from the page before the hook sees the press', () => {
    // Another capture listener (a library, another hook) can remove the element that was pressed
    // before this hook's listener runs. `contains()` cannot answer for a detached node any more, the
    // path of the event still can: it is fixed when the event is dispatched.
    const removeOnPress = (element: Element) => {
      const remove = () => {
        element.remove();
      };
      window.addEventListener('pointerdown', remove, true); // window capture runs before document capture

      return () => {
        window.removeEventListener('pointerdown', remove, true);
      };
    };

    it('a press on a child of the element that gets removed first is still inside', () => {
      const callback = vi.fn();
      const { getByTestId } = render(<Harness callback={callback} />);
      const child = getByTestId('inside-child');
      const stop = removeOnPress(child);

      try {
        press(child);
      } finally {
        stop();
      }

      expect(child.isConnected).toBe(false);
      expect(callback).not.toHaveBeenCalled();
    });

    it('a press on an outside element that gets removed first is still outside', () => {
      const callback = vi.fn();
      const { getByTestId } = render(<Harness callback={callback} />);
      const outside = getByTestId('outside');
      const stop = removeOnPress(outside);

      try {
        press(outside);
      } finally {
        stop();
      }

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('`ignore`: popups portalled out of the element', () => {
    it('without `ignore` a press inside the portalled popup is outside (the problem)', () => {
      const callback = vi.fn();
      const Without = () => {
        const ref = useOutsideClick<HTMLDivElement>(callback);

        return (
          <div>
            <div ref={ref} />
            {createPortal(<button data-testid="popup-child" />, document.body)}
          </div>
        );
      };
      const { getByTestId } = render(<Without />);

      press(getByTestId('popup-child'));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('a press on the popup and on what is inside it is not outside', () => {
      const callback = vi.fn();
      const { getByTestId } = render(<PortalHarness callback={callback} />);

      press(getByTestId('popup'));
      press(getByTestId('popup-child'));
      press(getByTestId('inside'));

      expect(callback).not.toHaveBeenCalled();
    });

    it('a press anywhere else is still outside', () => {
      const callback = vi.fn();
      const { getByTestId } = render(<PortalHarness callback={callback} />);

      press(getByTestId('outside'));
      press(document.body);

      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('an ignored ref that is not attached (popup closed) is skipped, and does not break the check', () => {
      const callback = vi.fn();
      const { getByTestId } = render(<PortalHarness callback={callback} withPopup={false} />);

      press(getByTestId('outside'));
      press(getByTestId('inside'));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('the popup is ignored the moment it appears, and stops being once it is gone', () => {
      const callback = vi.fn();
      const { getByTestId, rerender, queryByTestId } = render(
        <PortalHarness callback={callback} withPopup={false} />,
      );

      rerender(<PortalHarness callback={callback} withPopup />);
      press(getByTestId('popup-child'));
      expect(callback).not.toHaveBeenCalled();

      rerender(<PortalHarness callback={callback} withPopup={false} />);
      expect(queryByTestId('popup')).toBeNull();
      press(getByTestId('outside'));
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('every ref in the list counts, not only the first', () => {
      const callback = vi.fn();
      const extra = { current: null as HTMLDivElement | null };
      const Two = () => {
        const popupRef = useRef<HTMLDivElement | null>(null);
        const ref = useOutsideClick<HTMLDivElement>(callback, { ignore: [popupRef, extra] });

        return (
          <div>
            <div ref={ref} />
            <div ref={popupRef} data-testid="first" />
            <div
              ref={(node) => {
                extra.current = node;
              }}
              data-testid="second"
            />
            <button data-testid="outside" />
          </div>
        );
      };
      const { getByTestId } = render(<Two />);

      press(getByTestId('first'));
      press(getByTestId('second'));
      expect(callback).not.toHaveBeenCalled();

      press(getByTestId('outside'));
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('uses the list of the latest render, not the one the listener was added with', () => {
      const callback = vi.fn();
      const Switch = ({ which }: { which: 'a' | 'b' }) => {
        const aRef = useRef<HTMLDivElement | null>(null);
        const bRef = useRef<HTMLDivElement | null>(null);
        const ref = useOutsideClick<HTMLDivElement>(callback, {
          ignore: which === 'a' ? [aRef] : [bRef],
        });

        return (
          <div>
            <div ref={ref} />
            <div ref={aRef} data-testid="a" />
            <div ref={bRef} data-testid="b" />
          </div>
        );
      };
      const { getByTestId, rerender } = render(<Switch which="a" />);

      press(getByTestId('a'));
      expect(callback).not.toHaveBeenCalled();
      press(getByTestId('b'));
      expect(callback).toHaveBeenCalledTimes(1);

      rerender(<Switch which="b" />);
      press(getByTestId('b'));
      expect(callback).toHaveBeenCalledTimes(1);
      press(getByTestId('a'));
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('a new `ignore` array on every render costs no listener changes', () => {
      const add = vi.spyOn(document, 'addEventListener');
      const remove = vi.spyOn(document, 'removeEventListener');
      const Inline = () => {
        const popupRef = useRef<HTMLDivElement | null>(null);
        const ref = useOutsideClick<HTMLDivElement>(() => undefined, { ignore: [popupRef] }); // new array each render

        return (
          <div>
            <div ref={ref} />
            <div ref={popupRef} />
          </div>
        );
      };

      const { rerender } = render(<Inline />);
      rerender(<Inline />);
      rerender(<Inline />);

      const pointerdowns = (spy: { mock: { calls: unknown[][] } }) =>
        spy.mock.calls.filter(([type]) => type === 'pointerdown').length;
      expect(pointerdowns(add)).toBe(1);
      expect(pointerdowns(remove)).toBe(0);
      add.mockRestore();
      remove.mockRestore();
    });

    it('an empty list changes nothing', () => {
      const callback = vi.fn();
      const Empty = () => {
        const ref = useOutsideClick<HTMLDivElement>(callback, { ignore: [] });

        return (
          <div>
            <div ref={ref} data-testid="inside" />
            <button data-testid="outside" />
          </div>
        );
      };
      const { getByTestId } = render(<Empty />);

      press(getByTestId('inside'));
      expect(callback).not.toHaveBeenCalled();
      press(getByTestId('outside'));
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('an ignored element inside a shadow root is ignored too', () => {
      const callback = vi.fn();
      const host = document.createElement('div');
      document.body.append(host);
      const root = host.attachShadow({ mode: 'open' });
      const popup = document.createElement('button');
      root.append(popup);
      const Shadowed = () => {
        const popupRef = useRef<HTMLElement | null>(popup);
        const ref = useOutsideClick<HTMLDivElement>(callback, { ignore: [popupRef] });

        return <div ref={ref} />;
      };
      render(<Shadowed />);

      press(popup);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
