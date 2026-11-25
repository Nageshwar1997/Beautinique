// An invalid Date (`new Date('x')`) answers NaN to everything; it must stop here instead of
// travelling on as a wrong day or an "Invalid Date" on a screen.
export function assertValidDate(value: Date, name: string): void {
  if (Number.isNaN(value.getTime())) {
    throw new RangeError(`${name} is not a valid date.`);
  }
}
