import { parseHelpOnly } from '../lib/args.ts';
import { createContext } from '../lib/context.ts';
import { CliError } from '../lib/errors.ts';
import { logout, whoami } from '../lib/npm.ts';
import { main } from './_main.ts';

const HELP = `npm run logout

Ends the npm session on this laptop and on the npm server. Does nothing when you are not logged in.

  --help, -h    this help`;

await main(async () => {
  if (parseHelpOnly(process.argv.slice(2))) {
    console.log(HELP);
    return;
  }
  const ctx = createContext();
  const before = await whoami(ctx);
  if (before.state === 'offline') {
    throw new CliError(`Cannot reach npm: ${before.detail}`, {
      code: 'OFFLINE',
      hint: 'Check the internet connection.',
    });
  }
  if (before.state !== 'logged-in') {
    ctx.log.success('Not logged in to npm; nothing to do.');
    return;
  }
  await logout(ctx);
  ctx.log.success(`Logged out ${before.user} (the npm session is ended on the server too).`);
});
