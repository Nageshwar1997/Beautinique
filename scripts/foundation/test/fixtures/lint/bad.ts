// Wrong on purpose: an `any` and a promise nobody waits for. Only the lint test reads this file.
export function parse(input: any): unknown {
  return input;
}

export async function save(): Promise<void> {
  await Promise.resolve();
}

export function run(): void {
  save();
}
