import { parseHelpOnly } from '../lib/args.ts';
import { createContext } from '../lib/context.ts';
import { CliError } from '../lib/errors.ts';
import { login, whoami } from '../lib/npm.ts';
import { main } from './_main.ts';

const HELP = `npm run login

Logs in to npm in the browser (web login with 2FA). The session lasts 2 hours; publishing asks for a
2FA code per package. Does nothing when you are already logged in.

  --help, -h    this help`;

await main(async () => {
  if (parseHelpOnly(process.argv.slice(2))) {
    console.log(HELP);
    return;
  }
  const ctx = createContext();
  const before = await whoami(ctx);
  if (before.state === 'logged-in') {
    ctx.log.success(`Already logged in to npm as ${before.user}.`);
    return;
  }
  if (before.state === 'offline') {
    throw new CliError(`Cannot reach npm: ${before.detail}`, {
      code: 'OFFLINE',
      hint: 'Check the internet connection.',
    });
  }
  ctx.log.info(
    'npm opens a browser page to log in (sessions last 2 hours; publishing asks for 2FA).',
  );
  await login(ctx);
  const after = await whoami(ctx);
  if (after.state !== 'logged-in') {
    throw new CliError('npm login finished, but npm still does not know you.', {
      code: 'LOGIN_FAILED',
    });
  }
  ctx.log.success(`Logged in to npm as ${after.user}.`);
});
