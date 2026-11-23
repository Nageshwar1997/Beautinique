// `npm run infra:up -- <profile...>` and `npm run infra:down` (docs/OPERATIONS.md §1 rule 4).
import { compose, composeProfiles, dockerIsRunning, downArgs, upArgs } from '../src/infra.ts';

const [command, ...profiles] = process.argv.slice(2);

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

if (command !== 'up' && command !== 'down') {
  fail('Usage: npm run infra:up -- <profile...>  |  npm run infra:down');
}

if (!dockerIsRunning()) {
  fail('Docker is not running. Start Docker Desktop (or the Docker service) and try again.');
}

if (command === 'up') {
  const known = composeProfiles();
  if (profiles.length === 0) {
    fail(
      `Name the profile to start: npm run infra:up -- <profile>. Profiles: ${known.join(', ')}.`,
    );
  }
  const unknown = profiles.filter((profile) => !known.includes(profile));
  if (unknown.length > 0) {
    fail(`Unknown profile: ${unknown.join(', ')}. Profiles: ${known.join(', ')}.`);
  }
}

const result = compose(command === 'up' ? upArgs(profiles) : downArgs(), { stdio: 'inherit' });
process.exit(result.status ?? 1);
