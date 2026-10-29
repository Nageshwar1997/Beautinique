import { act, renderHook } from '@testing-library/react';
import { type ReactNode, StrictMode, useEffect } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetPendingSearch } from '../../src/router/pending-search';
import {
  useQueryParamInput,
  type UseQueryParamInputOptions,
} from '../../src/router/use-query-param-input';

interface SetupOptions {
  key?: string;
  options?: UseQueryParamInputOptions;
  strict?: boolean;
}

const setup = (entry: string, { key = 'search', options, strict = false }: SetupOptions = {}) => {
  // every URL the router committed, in order (the first one is the starting URL)
  const urls: string[] = [];

  const Wrapper = ({ children }: { children: ReactNode }) => {
    const router = <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>;
    return strict ? <StrictMode>{router}</StrictMode> : router;
  };

  const rendered = renderHook(
    () => {
      const input = useQueryParamInput(key, options);
      const location = useLocation();
      const navigate = useNavigate();

      useEffect(() => {
        urls.push(location.pathname + location.search);
      }, [location.pathname, location.search]);

      return { input, location, navigate };
    },
    { wrapper: Wrapper },
  );

  return { ...rendered, urls };
};

const type = (result: ReturnType<typeof setup>['result'], text: string) => {
  act(() => {
    result.current.input.setValue(text);
  });
};

const wait = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe('useQueryParamInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // the pending-navigation store is shared by the whole module: start every test from a clean one
    resetPendingSearch();
    vi.useRealTimers();
  });

  describe('value', () => {
    it('starts with the value of the URL param', () => {
      const { result } = setup('/products?search=lipstick');

      expect(result.current.input.value).toBe('lipstick');
    });

    it('starts empty when the URL has no such param', () => {
      const { result } = setup('/products?sortBy=name');

      expect(result.current.input.value).toBe('');
    });

    it('uses the key it is given', () => {
      const { result } = setup('/products?q=gloss&search=nope', { key: 'q' });

      expect(result.current.input.value).toBe('gloss');
    });
  });

  describe('typing', () => {
    it('shows the typed text at once but leaves the URL alone until the delay is over', () => {
      const { result } = setup('/products');

      type(result, 'lip');
      wait(599);

      expect(result.current.input.value).toBe('lip');
      expect(result.current.location.search).toBe('');
    });

    it('writes the text to the URL 600ms after the last keystroke by default', () => {
      const { result } = setup('/products');

      type(result, 'lip');
      wait(600);

      expect(result.current.location.search).toBe('?search=lip');
    });

    it('uses the delay it is given', () => {
      const { result } = setup('/products', { options: { delay: 200 } });

      type(result, 'lip');
      wait(199);
      expect(result.current.location.search).toBe('');

      wait(1);
      expect(result.current.location.search).toBe('?search=lip');
    });

    it('turns several quick keystrokes into one URL update', () => {
      const { result, urls } = setup('/products');

      type(result, 'l');
      wait(200);
      type(result, 'li');
      wait(200);
      type(result, 'lip');
      wait(600);

      expect(result.current.location.search).toBe('?search=lip');
      expect(urls).toEqual(['/products', '/products?search=lip']);
    });

    it('leaves the other params alone', () => {
      const { result } = setup('/products?sortBy=name&status=draft');

      type(result, 'lip');
      wait(600);

      expect(result.current.location.search).toBe('?sortBy=name&status=draft&search=lip');
    });

    it('removes leading whitespace, keeps trailing whitespace in the box, and trims the URL value', () => {
      const { result } = setup('/products');

      type(result, '  lip ');
      expect(result.current.input.value).toBe('lip ');

      wait(600);
      expect(result.current.location.search).toBe('?search=lip');
      // the URL update coming back must not eat the trailing space the user may be about to continue after
      expect(result.current.input.value).toBe('lip ');
    });

    it('removes the param when the text is emptied', () => {
      const { result } = setup('/products?search=lip&sortBy=name');

      type(result, '');
      wait(600);

      expect(result.current.location.search).toBe('?sortBy=name');
    });

    it('removes the param when the text is only spaces', () => {
      const { result } = setup('/products?search=lip');

      type(result, '   ');
      wait(600);

      expect(result.current.location.search).toBe('');
    });

    it('does not navigate when the trimmed text is what the URL already has', () => {
      const { result, urls } = setup('/products?search=lip');

      type(result, 'lip ');
      wait(600);

      expect(urls).toEqual(['/products?search=lip']);
    });

    it('works with another key', () => {
      const { result } = setup('/products', { key: 'q' });

      type(result, 'gloss');
      wait(600);

      expect(result.current.location.search).toBe('?q=gloss');
    });
  });

  describe('following the URL', () => {
    it('follows a URL change made by something else', () => {
      const { result } = setup('/products?search=old');

      act(() => {
        void result.current.navigate('/products?search=other');
      });

      expect(result.current.input.value).toBe('other');
    });

    it('is emptied when something else removes the param', () => {
      const { result } = setup('/products?search=lipstick&sortBy=name');

      act(() => {
        void result.current.navigate('/products?sortBy=name');
      });

      expect(result.current.input.value).toBe('');
    });

    it('follows browser Back and Forward', () => {
      const { result } = setup('/products');

      type(result, 'x1');
      wait(600);
      type(result, 'x2');
      wait(600);
      expect(result.current.location.search).toBe('?search=x2');

      act(() => {
        void result.current.navigate(-1);
      });
      expect(result.current.input.value).toBe('x1');

      act(() => {
        void result.current.navigate(-1);
      });
      expect(result.current.input.value).toBe('');

      act(() => {
        void result.current.navigate(1);
      });
      expect(result.current.input.value).toBe('x1');
    });

    it('drops a typed text that is still waiting when the URL changes by itself', () => {
      const { result } = setup('/products?search=old');

      type(result, 'new'); // waiting for its debounce
      act(() => {
        void result.current.navigate('/products?search=other');
      });
      wait(1000);

      expect(result.current.input.value).toBe('other');
      expect(result.current.location.search).toBe('?search=other');
    });

    it('can send the same text again after the URL was changed under it', () => {
      const { result } = setup('/products?search=abc');

      act(() => {
        void result.current.navigate('/products');
      });
      expect(result.current.input.value).toBe('');

      type(result, 'abc');
      wait(600);

      expect(result.current.location.search).toBe('?search=abc');
    });
  });

  describe('clear', () => {
    it('empties the box at once without touching the URL', () => {
      const { result, urls } = setup('/products?search=lip');

      act(() => {
        result.current.input.clear();
      });

      expect(result.current.input.value).toBe('');
      expect(urls).toEqual(['/products?search=lip']);
    });

    it('drops a typed text that is still waiting for its debounce', () => {
      const { result } = setup('/products');

      type(result, 'abc');
      act(() => {
        result.current.input.clear();
      });
      wait(1000);

      expect(result.current.location.search).toBe('');
      expect(result.current.input.value).toBe('');
    });

    it('drops an emptied text that is still waiting, so it cannot remove the param later', () => {
      const { result } = setup('/products?search=lip&sortBy=name');

      type(result, ''); // the user deleted everything: "remove the param" is waiting for its debounce
      act(() => {
        result.current.input.clear(); // the box is empty either way, but clear() must not touch the URL
      });
      wait(1000);

      expect(result.current.location.search).toBe('?search=lip&sortBy=name');
    });

    it('stays empty when the URL is cleared right after (a "Clear" button)', () => {
      const { result } = setup('/products?search=lip&sortBy=name');

      act(() => {
        result.current.input.clear();
        void result.current.navigate('/products');
      });

      expect(result.current.input.value).toBe('');
      expect(result.current.location.search).toBe('');
    });
  });

  describe('identities', () => {
    it('keeps setValue and clear while the user types and the URL changes', () => {
      const { result } = setup('/products');
      const { setValue, clear } = result.current.input;

      type(result, 'lip');
      wait(600);
      act(() => {
        void result.current.navigate('/products?search=other');
      });

      expect(result.current.input.setValue).toBe(setValue);
      expect(result.current.input.clear).toBe(clear);
    });

    it('returns the same object while nothing changed', () => {
      const { result, rerender } = setup('/products?search=lip');
      const first = result.current.input;

      rerender();

      expect(result.current.input).toBe(first);
    });
  });

  it('writes nothing after the component unmounted', () => {
    const { result, unmount, urls } = setup('/products');

    type(result, 'lip');
    unmount();
    wait(1000);

    expect(urls).toEqual(['/products']);
  });

  describe('flush', () => {
    it('sends the typed text at once, and nothing is sent again when the delay is over', () => {
      const { result, urls } = setup('/products');

      type(result, 'lip');
      act(() => {
        result.current.input.flush();
      });

      expect(result.current.location.search).toBe('?search=lip');

      wait(1000);
      expect(urls).toEqual(['/products', '/products?search=lip']);
    });

    it('sends the trimmed text, and removes the param when the text is empty', () => {
      const { result } = setup('/products?search=lip&sortBy=name');

      type(result, '  ');
      act(() => {
        result.current.input.flush();
      });

      expect(result.current.location.search).toBe('?sortBy=name');
    });

    it('does nothing when there is nothing waiting', () => {
      const { result, urls } = setup('/products?search=lip');

      act(() => {
        result.current.input.flush();
      });

      expect(urls).toEqual(['/products?search=lip']);
    });

    it('does nothing after the text was already sent', () => {
      const { result, urls } = setup('/products');

      type(result, 'lip');
      wait(600);
      act(() => {
        result.current.input.flush();
      });

      expect(urls).toEqual(['/products', '/products?search=lip']);
    });

    it('does nothing after clear()', () => {
      const { result, urls } = setup('/products');

      type(result, 'lip');
      act(() => {
        result.current.input.clear();
        result.current.input.flush();
      });

      expect(urls).toEqual(['/products']);
    });

    it('keeps what the box shows, trailing space included', () => {
      const { result } = setup('/products');

      type(result, 'lip ');
      act(() => {
        result.current.input.flush();
      });

      expect(result.current.input.value).toBe('lip ');
    });
  });

  describe('isPending', () => {
    it('is true while a typed text waits for its delay, and false once it has been sent', () => {
      const { result } = setup('/products');

      expect(result.current.input.isPending()).toBe(false);

      type(result, 'lip');
      expect(result.current.input.isPending()).toBe(true);

      wait(600);
      expect(result.current.input.isPending()).toBe(false);
    });

    it('is false after flush() and after clear()', () => {
      const { result } = setup('/products');

      type(result, 'lip');
      act(() => {
        result.current.input.flush();
      });
      expect(result.current.input.isPending()).toBe(false);

      type(result, 'lipstick');
      act(() => {
        result.current.input.clear();
      });
      expect(result.current.input.isPending()).toBe(false);
    });
  });

  describe('a URL value with a leading space', () => {
    it('is shown without it when the page opens', () => {
      const { result } = setup('/products?search=%20lip');

      expect(result.current.input.value).toBe('lip');
    });

    it('is shown without it when the box follows the URL', () => {
      const { result } = setup('/products');

      act(() => {
        void result.current.navigate('/products?search=%20%20lip%20gloss');
      });

      expect(result.current.input.value).toBe('lip gloss');
    });

    it('does not make the box send anything by itself', () => {
      const { urls } = setup('/products?search=%20lip');

      wait(1000);

      expect(urls).toEqual(['/products?search=%20lip']);
    });
  });

  describe('identities of flush and isPending', () => {
    it('stay the same while the user types and the URL changes', () => {
      const { result } = setup('/products');
      const { flush, isPending } = result.current.input;

      type(result, 'lip');
      wait(600);
      act(() => {
        void result.current.navigate('/products?search=other');
      });

      expect(result.current.input.flush).toBe(flush);
      expect(result.current.input.isPending).toBe(isPending);
    });
  });

  describe('React StrictMode', () => {
    it('updates the URL exactly once', () => {
      const { result, urls } = setup('/products', { strict: true });

      type(result, 'lip');
      wait(600);

      expect(result.current.location.search).toBe('?search=lip');
      expect(urls.filter((url) => url === '/products?search=lip')).toHaveLength(1);
    });
  });
});
