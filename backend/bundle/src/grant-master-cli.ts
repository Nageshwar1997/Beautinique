import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';

import type { Logger } from '@beautinique/backend-server-kit';

import type { Env } from './prepare.ts';
import { defaultFiles, hostOf, readEnvFile, type ReleaseCliIo } from './release-cli.ts';

const USAGE = `npm run db:grant-master -- --email <email> [options]

Gives the Master role to an account that already exists (ARCHITECTURE §7.3): nobody can appoint the
first Master, so the owner does it here. At most 2 Masters. Runs identity's release steps first.

  --email <email>  the account (sign up in the customer app first)
  --env live       the live database, with the values of backend/bundle/.env.production
                   (asks first); default: backend/bundle/.env (the laptop)
  --help, -h       this help
`;

/** What identity exports from src/service.ts for this. */
interface MasterGranter {
  readConfig(options: { env: Env }): { mongoUri: string; mongoDbName: string };
  grantMaster(
    config: { mongoUri: string; mongoDbName: string },
    options: { email: string; logger: Logger },
  ): Promise<'given' | 'already-master'>;
}

const isGranter = (module: unknown): module is MasterGranter =>
  typeof module === 'object' &&
  module !== null &&
  'grantMaster' in module &&
  typeof module.grantMaster === 'function' &&
  'readConfig' in module &&
  typeof module.readConfig === 'function';

/** `npm run db:grant-master`: returns the exit code. */
export async function grantMasterCli(args: string[], io: ReleaseCliIo): Promise<number> {
  const { logger, output } = io;
  const say = (line: string) => output.write(`${line}\n`);
  const files = io.files ?? defaultFiles;
  const load = io.load ?? ((name: string) => import(name) as Promise<unknown>);

  let options: { email?: string; env?: string; help?: boolean };
  try {
    ({ values: options } = parseArgs({
      args,
      options: {
        email: { type: 'string' },
        env: { type: 'string' },
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
  if (options.email === undefined || options.email.trim() === '') {
    say(`--email is required.\n\n${USAGE}`);
    return 1;
  }
  if (options.env !== undefined && options.env !== 'live') {
    say(`--env takes only "live" (the laptop is the default).\n\n${USAGE}`);
    return 1;
  }
  const live = options.env === 'live';

  try {
    const identity = await load('identity');
    if (!isGranter(identity)) throw new Error('identity does not export grantMaster');
    const env = await readEnvFile(live ? files.live : files.laptop, live);
    const config = identity.readConfig({ env });
    const where = `${config.mongoDbName} on ${hostOf(config.mongoUri)}`;
    if (live) {
      say(`Master role for ${options.email} on the LIVE database: ${where}`);
      const questions = createInterface({ input: io.input, output, terminal: false });
      const answer = await questions.question('Type "live" to go on: ').finally(() => {
        questions.close();
      });
      if (answer.trim() !== 'live') {
        say('Stopped: nothing changed.');
        return 1;
      }
    }
    const outcome = await identity.grantMaster(config, { email: options.email, logger });
    say(
      outcome === 'given'
        ? `${options.email} is now a Master (${where}). The first sign-in to the Master app sets up the authenticator.`
        : `${options.email} is a Master already (${where}): nothing changed.`,
    );
    return 0;
  } catch (error) {
    logger.error({ err: error }, 'master grant failed');
    say(`Failed: ${(error as Error).message}`);
    return 1;
  }
}
