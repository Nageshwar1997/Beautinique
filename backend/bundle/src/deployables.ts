// Written by `npm run create -- --type backend`: creating a deployable adds it here. Do not edit.
import * as core from 'core';
import * as gateway from 'gateway';
import * as identity from 'identity';
import * as notify from 'notify';

import { type Env, prepare, type Prepared, type StartOptions } from './prepare.ts';

/** Every deployable in backend/, in start order: the internal ones, then the gateway. */
export const names: readonly string[] = ['identity', 'notify', 'core', 'gateway'];

/** Reads every deployable's config (each one's keys then leave env). Nothing starts yet. */
export function prepareAll(env: Env) {
  const internal: Prepared<StartOptions>[] = [
    prepare('identity', identity, env),
    prepare('notify', notify, env),
    prepare('core', core, env),
  ];
  return { internal, gateway: prepare('gateway', gateway, env) };
}
