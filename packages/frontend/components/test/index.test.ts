import { describe, expect, it } from 'vitest';

import * as api from '../src/index';

describe('@beautinique/frontend-components', () => {
  it('exports exactly its public API', () => {
    expect(Object.keys(api).sort()).toEqual(
      [
        'BUTTON_SIZES',
        'BUTTON_VARIANTS',
        'Button',
        'CONTROL_BOX',
        'Checkbox',
        'CodeInput',
        'Dialog',
        'Field',
        'Input',
        'PasswordInput',
        'Radio',
        'RadioGroup',
        'Spinner',
        'TONES',
        'TONE_CLASS',
        'Toaster',
        'Tooltip',
        'VISIBLE_TOASTS',
        'clearToasts',
        'cx',
        'dismissToast',
        'toast',
      ].sort(),
    );
  });

  it('has a static class for every tone (Tailwind sees them in the source)', () => {
    expect(api.TONES).toEqual([
      'brand',
      'neutral',
      'secondary',
      'accent',
      'success',
      'warning',
      'error',
      'info',
    ]);
    for (const tone of api.TONES) expect(api.TONE_CLASS[tone]).toBe(`tone-${tone}`);
  });

  it('cx joins only the truthy class names', () => {
    expect(api.cx('a', false, undefined, null, '', 'b')).toBe('a b');
  });
});
