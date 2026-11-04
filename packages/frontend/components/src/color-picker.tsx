import { type ReactNode, type Ref, useState } from 'react';
import {
  Button as AriaButton,
  type Color,
  ColorArea,
  ColorField,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorThumb,
  Dialog as AriaDialog,
  DialogTrigger,
  Input as AriaInput,
  Label,
  parseColor,
  Popover,
  SliderTrack,
} from 'react-aria-components';

import { cx } from './cx';
import { CONTROL_BOX } from './input';
import { FieldErrorText, FieldHint, FieldLabel, invalidProps, POPOVER } from './picker-parts';

/** Where the picker starts while the field is empty: the brand rose. */
const START = '#D6336C';

const THUMB =
  'size-6 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4),inset_0_0_0_1px_rgb(0_0_0/0.3)] data-focus-visible:size-8 data-focus-visible:ring-2 data-focus-visible:ring-focus-ring';

const toHsb = (hex: string): Color => parseColor(hex).toFormat('hsb');

export interface ColorPickerProps {
  /** The visible label (every field has one). */
  label: ReactNode;
  /** `#RRGGBB`; null = no colour yet. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Ready colours to pick with one press (e.g. a brand's shades), as `#RRGGBB`. */
  swatches?: readonly string[];
  hint?: ReactNode;
  /** What is wrong; the field is then invalid and described by it. */
  error?: ReactNode;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Sends the value with a native form. */
  name?: string;
  autoFocus?: boolean;
  id?: string;
  /** Classes of the outer element (label, field, hint, error). */
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A colour as `#RRGGBB`, without transparency (owner: a product shade): a hex box that can be typed
 * in, and a swatch button that opens a picker with a saturation/brightness area, a hue slider and
 * ready swatches (React Aria: arrow keys move the thumbs, screen readers hear the colour's name).
 *
 * ```tsx
 * <ColorPicker label="Shade colour" value={hex} onChange={setHex} swatches={["#8B1E3F", "#C2185B"]} />
 * ```
 */
export function ColorPicker({
  label,
  value,
  defaultValue,
  onChange,
  swatches,
  hint,
  error,
  isInvalid,
  isRequired,
  isDisabled = false,
  className,
  ref,
  ...rest
}: ColorPickerProps) {
  const [own, setOwn] = useState<string | null>(defaultValue ?? null);
  const current = value === undefined ? own : value;
  // the area and slider work in HSB, kept here so a grey (no hue) does not lose the hue
  const [picker, setPicker] = useState<Color>(() => toHsb(current ?? START));
  const [shown, setShown] = useState(current);
  if (current !== shown) {
    setShown(current);
    if (current !== null && current !== picker.toString('hex')) setPicker(toHsb(current));
  }

  const commit = (hex: string | null) => {
    if (value === undefined) setOwn(hex);
    onChange?.(hex);
  };
  const fromPicker = (color: Color) => {
    setPicker(color);
    commit(color.toString('hex'));
  };

  return (
    <ColorField
      {...rest}
      ref={ref}
      value={current}
      onChange={(color) => {
        commit(color === null ? null : color.toString('hex'));
      }}
      isRequired={isRequired ?? false}
      isDisabled={isDisabled}
      {...invalidProps(isInvalid, error)}
      className={cx('group flex flex-col gap-1.5', className)}
    >
      <FieldLabel required={isRequired}>{label}</FieldLabel>
      <div className={CONTROL_BOX}>
        <DialogTrigger>
          <AriaButton
            aria-label="Open the colour picker"
            isDisabled={isDisabled}
            className="focus-ring ms-1 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md outline-hidden data-disabled:cursor-not-allowed"
          >
            <ColorSwatch
              color={current ?? undefined}
              className={cx(
                'size-8 rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]',
                current === null &&
                  'bg-[repeating-linear-gradient(45deg,var(--color-surface-muted)_0_4px,transparent_4px_8px)]',
              )}
            />
          </AriaButton>
          <Popover offset={6} placement="bottom start" className={cx(POPOVER, 'p-3')}>
            <AriaDialog
              aria-label="Colour picker"
              className="flex w-56 flex-col gap-3 outline-hidden"
            >
              <ColorArea
                value={picker}
                onChange={fromPicker}
                xChannel="saturation"
                yChannel="brightness"
                className="aspect-square w-full rounded-lg"
              >
                <ColorThumb className={THUMB} />
              </ColorArea>
              <ColorSlider
                value={picker}
                onChange={fromPicker}
                channel="hue"
                className="flex flex-col gap-1"
              >
                <Label className="text-foreground-muted text-xs font-medium">Hue</Label>
                <SliderTrack className="h-6 w-full rounded-full">
                  <ColorThumb className={cx(THUMB, 'top-1/2')} />
                </SliderTrack>
              </ColorSlider>
              {swatches !== undefined && swatches.length > 0 && (
                <ColorSwatchPicker
                  aria-label="Ready colours"
                  value={current ?? undefined}
                  onChange={(color) => {
                    fromPicker(color.toFormat('hsb'));
                  }}
                  className="flex flex-wrap gap-1.5"
                >
                  {swatches.map((swatch) => (
                    <ColorSwatchPickerItem
                      key={swatch}
                      color={swatch}
                      className="focus-ring data-selected:ring-foreground relative size-8 cursor-pointer rounded-md outline-hidden data-selected:ring-2 data-selected:ring-offset-2"
                    >
                      <ColorSwatch className="size-full rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]" />
                    </ColorSwatchPickerItem>
                  ))}
                </ColorSwatchPicker>
              )}
            </AriaDialog>
          </Popover>
        </DialogTrigger>
        <AriaInput
          placeholder="#RRGGBB"
          className="placeholder:text-foreground-subtle h-full min-w-0 flex-1 bg-transparent px-3 py-2 font-mono uppercase outline-hidden disabled:cursor-not-allowed"
        />
      </div>
      <FieldHint>{hint}</FieldHint>
      <FieldErrorText error={error} />
    </ColorField>
  );
}
