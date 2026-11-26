export type ConfigProblemKind =
  'environment' | 'file' | 'missing' | 'empty' | 'unknown' | 'invalid' | 'rule';

/** One thing that is wrong in a config. The message names the key and never holds a value. */
export interface ConfigProblem {
  /** The env key, or the name of the env file, or `NODE_ENV`. */
  key: string;
  kind: ConfigProblemKind;
  message: string;
}

/**
 * The config of a service is wrong, so the process must not start (docs/OPERATIONS.md §4 rule 5).
 * It lists every problem at once, so one boot shows everything to fix, and by key name only: a value
 * is a secret more often than not, and it must never reach a log.
 */
export class ConfigError extends Error {
  readonly service: string;
  readonly problems: readonly ConfigProblem[];

  constructor(service: string, problems: readonly ConfigProblem[]) {
    super(
      `The config of ${service} is wrong:\n${problems.map((problem) => `  - ${problem.message}`).join('\n')}`,
    );
    this.name = 'ConfigError';
    this.service = service;
    this.problems = problems;
  }
}
