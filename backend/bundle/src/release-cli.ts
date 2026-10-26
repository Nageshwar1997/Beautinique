import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import type { Readable, Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { parseArgs, parseEnv } from 'node:util';

import type { Logger } from '@beautinique/backend-server-kit';
import type { ReleaseReport } from '@beautinique/backend-server-release';

import { names } from './deployables.ts';
import type { Env } from './prepare.ts';

const USAGE = `npm run db:release -- [options]

Runs the release steps (migrations, index sync; ARCHITECTURE §11.1) of every deployable that has a
database, without starting it. A start runs them too; this is for seeds and one-off runs.

  --deployable <name>  only this one (identity, core ...); default: all with a database
  --env live           the live database, with the values of backend/bundle/.env.production
                       (asks first); default: backend/bundle/.env (the laptop)
  --force              run them even when the database already has this release
  --help, -h           this help
`;

/** What a deployable with a database exports from src/service.ts for the release steps. */
interface Releasable {
  readConfig(options: { env: Env }): { mongoUri: string; mongoDbName: string };
  release(
    config: { mongoUri: string; mongoDbName: string },
    options: { logger: Logger; force?: boolean },
  ): Promise<ReleaseReport>;
}

const isReleasable = (module: unknown): module is Releasable =>
  typeof module === 'object' &&
  module !== null &&
  'release' in module &&
  typeof module.release === 'function' &&
  'readConfig' in module &&
  typeof module.readConfig === 'function';

export interface ReleaseCliIo {
  logger: Logger;
  output: Writable;
  /** Where the answer to the live question comes from. */
  input: Readable;
  /** The env files (tests use their own). */
  files?: { laptop: string; live: string };
  /** How a deployable is loaded (default: import by its name). */
  load?: (name: string) => Promise<unknown>;
}

const defaultFiles = {
  laptop: fileURLToPath(new URL('../.env', import.meta.url)),
  live: fileURLToPath(new URL('../.env.production', import.meta.url)),
};

/** The host of a MongoDB URI, never its user or password. */
function hostOf(uri: string): string {
  try {
    return new URL(uri).host;
  } catch {
    return 'an unreadable address';
  }
}

async function readEnvFile(path: string, live: boolean): Promise<Env> {
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch {
    throw new Error(
      live
        ? `${path} is missing: it holds the live values you set in Render (the owner's private copy).`
        : `${path} is missing: copy backend/bundle/.env.example to .env first.`,
    );
  }
  return parseEnv(text);
}

/** `npm run db:release`: returns the exit code. */
export async function releaseCli(args: string[], io: ReleaseCliIo): Promise<number> {
  const { logger, output } = io;
  const say = (line: string) => output.write(`${line}\n`);
  const files = io.files ?? defaultFiles;
  const load = io.load ?? ((name: string) => import(name) as Promise<unknown>);

  let options: { deployable?: string; env?: string; force?: boolean; help?: boolean };
  try {
    ({ values: options } = parseArgs({
      args,
      options: {
        deployable: { type: 'string' },
        env: { type: 'string' },
        force: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
      strict: true,
    }));
  } catch (error) {
    say(`${(error as Error).message}\n\n${USAGE}`);
    return 1;
  }
  if (options.help) {
    say(USAGE);
    return 0;
  }
  if (options.env !== undefined && options.env !== 'live') {
    say(`--env takes only "live" (the laptop is the default).\n\n${USAGE}`);
    return 1;
  }
  const live = options.env === 'live';
  if (options.deployable !== undefined && !names.includes(options.deployable)) {
    say(`There is no deployable "${options.deployable}". Deployables: ${names.join(', ')}.`);
    return 1;
  }

  const chosen: { name: string; module: Releasable }[] = [];
  for (const name of options.deployable === undefined ? names : [options.deployable]) {
    const module = await load(name);
    if (isReleasable(module)) chosen.push({ name, module });
    else if (options.deployable !== undefined) {
      say(`${name} has no database, so it has no release steps.`);
      return 1;
    }
  }

  try {
    const env = await readEnvFile(live ? files.live : files.laptop, live);
    const targets = chosen.map(({ name, module }) => {
      const config = module.readConfig({ env });
      return { name, module, config, where: `${config.mongoDbName} on ${hostOf(config.mongoUri)}` };
    });

    if (live) {
      say('The release steps will run on the LIVE databases:');
      for (const { name, where } of targets) say(`  ${name}: ${where}`);
      const questions = createInterface({ input: io.input, output, terminal: false });
      const answer = await questions.question('Type "live" to go on: ').finally(() => {
        questions.close();
      });
      if (answer.trim() !== 'live') {
        say('Stopped: nothing ran.');
        return 1;
      }
    }

    for (const { name, module, config, where } of targets) {
      const report = await module.release(config, { logger, force: options.force });
      say(
        report.upToDate
          ? `${name} (${where}): up to date`
          : `${name} (${where}): ${String(report.migrations.length)} migration(s), ` +
              `${String(report.indexes.created.length)} index(es) made, ` +
              `${String(report.steps.length)} step(s) in ${String(report.ms)} ms`,
      );
    }
    return 0;
  } catch (error) {
    logger.error({ err: error }, 'release steps failed');
    say(`Failed: ${(error as Error).message}`);
    return 1;
  }
}
