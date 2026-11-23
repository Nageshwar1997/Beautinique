import { createInterface } from 'node:readline/promises';

export type Ask = (question: string) => Promise<string>;

const YES = new Set(['haan', 'yes', 'y']);

// Asks on the terminal; with no terminal to answer (CI, a pipe) the answer is empty, which is a no.
export const askOnTerminal: Ask = async (question) => {
  if (!process.stdin.isTTY) return '';
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await rl.question(question);
  } finally {
    rl.close();
  }
};

// Nothing is written or published without a clear yes: anything but `haan`, `yes` or `y` is a no.
export async function confirm(ask: Ask, question: string): Promise<boolean> {
  const answer = await ask(`${question} (haan/no) `);
  return YES.has(answer.trim().toLowerCase());
}
