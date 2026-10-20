import { checkbox, confirm, input, select, Separator } from '@inquirer/prompts';

import { CancelledError, CliError } from './errors.ts';

export interface Choice<T> {
  name: string;
  value: T;
  description?: string;
  /** `true` or a reason; disabled choices are shown but cannot be picked. */
  disabled?: boolean | string;
  checked?: boolean;
}

export interface SeparatorChoice {
  separator: string;
}

export type ChoiceItem<T> = Choice<T> | SeparatorChoice;

export type Validate = (value: string) => true | string | Promise<true | string>;

/** Every question the CLI asks goes through this, so tests can answer them. */
export interface Prompter {
  select<T>(message: string, choices: ChoiceItem<T>[], options?: { default?: T }): Promise<T>;
  checkbox<T>(
    message: string,
    choices: ChoiceItem<T>[],
    options?: { required?: boolean },
  ): Promise<T[]>;
  confirm(message: string, options?: { default?: boolean }): Promise<boolean>;
  input(message: string, options?: { default?: string; validate?: Validate }): Promise<string>;
}

const isSeparator = <T>(c: ChoiceItem<T>): c is SeparatorChoice => 'separator' in c;

async function cancellable<T>(work: Promise<T>): Promise<T> {
  try {
    return await work;
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      throw new CancelledError();
    }
    throw error;
  }
}

export function inquirerPrompter(): Prompter {
  const toInquirer = <T>(choices: ChoiceItem<T>[]) =>
    choices.map((c) =>
      isSeparator(c)
        ? new Separator(c.separator)
        : {
            name: c.name,
            value: c.value,
            description: c.description,
            disabled: c.disabled,
            checked: c.checked,
          },
    );
  return {
    select: (message, choices, options = {}) =>
      cancellable(
        select({ message, choices: toInquirer(choices), default: options.default, pageSize: 15 }),
      ),
    checkbox: (message, choices, options = {}) =>
      cancellable(
        checkbox({
          message,
          choices: toInquirer(choices),
          pageSize: 15,
          required: options.required ?? true,
        }),
      ),
    confirm: (message, options = {}) =>
      cancellable(confirm({ message, default: options.default ?? false })),
    input: (message, options = {}) =>
      cancellable(input({ message, default: options.default, validate: options.validate })),
  };
}

/**
 * For runs without a terminal: any question that was not answered by a flag is an error. A confirmation
 * passes only when the user said so up front (--yes / --ci); without a terminal it is never assumed.
 */
export function noPrompter(flagHint: string, assumeYes = false): Prompter {
  const unanswered = (message: string) =>
    Promise.reject(
      new CliError(`This needs an answer, but the run is non-interactive: "${message}"`, {
        code: 'NEEDS_ANSWER',
        hint: flagHint,
      }),
    );
  return {
    select: (message) => unanswered(message),
    checkbox: (message) => unanswered(message),
    confirm: (message) =>
      assumeYes
        ? Promise.resolve(true)
        : Promise.reject(
            new CliError(`"${message}" needs a yes, but there is no terminal to ask in.`, {
              code: 'NEEDS_ANSWER',
              hint: 'Run it in a terminal, or pass --yes if you really mean it.',
            }),
          ),
    input: (message) => unanswered(message),
  };
}

export interface ScriptedPrompter extends Prompter {
  asked: string[];
  remaining(): number;
}

/**
 * Answers questions in order (tests). An answer may be a function that receives the choices,
 * so a test can assert what was offered.
 */
export function scriptedPrompter(answers: unknown[]): ScriptedPrompter {
  const queue = [...answers];
  const asked: string[] = [];
  const next = async (message: string, choices?: ChoiceItem<unknown>[], validate?: Validate) => {
    asked.push(message);
    if (queue.length === 0) {
      throw new Error(`No scripted answer for: ${message}`);
    }
    const answer = queue.shift();
    const value =
      typeof answer === 'function' ? (answer as (c: unknown) => unknown)(choices) : answer;
    if (validate && typeof value === 'string') {
      const verdict = await validate(value);
      if (verdict !== true) {
        throw new Error(`Scripted answer "${value}" rejected for "${message}": ${verdict}`);
      }
    }
    if (choices && !Array.isArray(value)) {
      const choice = choices.find((c) => !isSeparator(c) && Object.is(c.value, value));
      if (choice && !isSeparator(choice) && choice.disabled) {
        throw new Error(`Scripted answer picked a disabled choice for "${message}"`);
      }
    }
    return value;
  };
  return {
    asked,
    remaining: () => queue.length,
    select: (message, choices) => next(message, choices) as never,
    checkbox: (message, choices) => next(message, choices) as never,
    confirm: (message) => next(message) as Promise<boolean>,
    input: (message, options = {}) => next(message, undefined, options.validate) as Promise<string>,
  };
}
