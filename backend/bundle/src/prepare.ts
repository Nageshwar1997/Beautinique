import type { RunningServer } from '@beautinique/backend-server-kit';

export type Env = Record<string, string | undefined>;

export interface StartOptions {
  port?: number;
  host?: string;
  handleSignals?: boolean;
}

/** What every backend/<deployable> exports from src/service.ts. */
export interface DeployableModule<Config, Options extends StartOptions> {
  readConfig(options?: { env?: Env; strip?: boolean }): Config;
  start(config: Config, options?: Options): Promise<RunningServer>;
}

/** A deployable whose config is read, ready to start. */
export interface Prepared<Options extends StartOptions> {
  name: string;
  start(options: Options): Promise<RunningServer>;
}

/** Reads the deployable's config now and strips its keys from env (ARCHITECTURE §3). */
export function prepare<Config, Options extends StartOptions>(
  name: string,
  deployable: DeployableModule<Config, Options>,
  env: Env,
): Prepared<Options> {
  const config = deployable.readConfig({ env, strip: true });
  return { name, start: (options) => deployable.start(config, options) };
}
