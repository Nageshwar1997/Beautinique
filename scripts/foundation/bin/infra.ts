// `npm run infra:up -- <profile...>`, `npm run infra:down`, `npm run infra:use -- <secondary|primary>`
// and `npm run infra:status` (docs/OPERATIONS.md §1 rules 4, 11 and 12). On a remote Docker context
// (the secondary laptop) `up` also opens the SSH tunnel for the published ports, and `down` first
// saves a MongoDB snapshot to this laptop, then closes the tunnel.
import { snapshotMongo } from '../src/dev-data.ts';
import {
  compose,
  composeProfiles,
  dockerIsRunning,
  downArgs,
  readComposeConfig,
  snapshotsOnDown,
  upArgs,
} from '../src/infra.ts';
import {
  contextExists,
  currentContext,
  describeContext,
  envOverrideProblem,
  isMachine,
  MACHINES,
  switchProblem,
  useContext,
} from '../src/machine.ts';
import {
  closeTunnel,
  dockerEndpoint,
  isRemoteEndpoint,
  openTunnel,
  portsTakenMessage,
  publishedPorts,
  readTunnel,
  takenPorts,
  tunnelLeftOpenNotice,
} from '../src/remote-infra.ts';

const [command, ...profiles] = process.argv.slice(2);

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const USAGE =
  'Usage: npm run infra:up -- <profile...>  |  npm run infra:down  |  npm run infra:use -- <secondary|primary>  |  npm run infra:status';

// The laptop the containers run on now, in words. DOCKER_HOST beats the context, as for Docker itself.
function target(): string {
  const host = process.env.DOCKER_HOST;
  if (host)
    return `${isRemoteEndpoint(host) ? 'another machine' : 'this laptop'} (DOCKER_HOST ${host})`;
  return describeContext(currentContext(), dockerEndpoint());
}

async function tunnelState() {
  const tunnel = readTunnel();
  const open = tunnel ? (await takenPorts(tunnel.ports)).length > 0 : false;
  return { tunnel, open };
}

// Running containers of the development project here; undefined if this Docker does not answer.
function runningContainers(): string[] | undefined {
  const ps = compose(['--profile', '*', 'ps', '--format', '{{.Service}} ({{.State}} {{.Health}})']);
  if (ps.status !== 0) return undefined;
  return String(ps.stdout)
    .split(/\r?\n/)
    .map((line) => line.replace(/ \)$/, ')').trim())
    .filter(Boolean);
}

if (command === 'use') {
  const machine = profiles[0];
  if (!isMachine(machine)) fail('Name the laptop: npm run infra:use -- secondary  |  primary');
  const override = envOverrideProblem(process.env);
  if (override) fail(override);
  const context = MACHINES[machine];
  if (!contextExists(context)) {
    fail(
      machine === 'secondary'
        ? `The Docker context ${context} does not exist yet: docker context create ${context} --docker "host=ssh://${context}" (docs/OPERATIONS.md §1 rule 13).`
        : `The Docker context ${context} does not exist: is Docker Desktop installed on this laptop?`,
    );
  }
  const before = target();
  if (currentContext() === context) {
    console.log(`Containers already run on ${before}.`);
    process.exit(0);
  }
  const running = dockerIsRunning() ? runningContainers()?.length : undefined;
  const problem = switchProblem({
    current: before,
    tunnelOpen: (await tunnelState()).open,
    leavingSecondary: isRemoteEndpoint(dockerEndpoint()),
    running,
  });
  if (problem) fail(problem);
  if (running === undefined) {
    console.warn(
      `${before} does not answer: if containers still run there, stop them once it is back.`,
    );
  }
  if (!useContext(context)) fail(`docker context use ${context} failed.`);
  console.log(`Containers will now run on ${target()}.`);
  if (!dockerIsRunning()) {
    console.warn(
      machine === 'primary'
        ? 'Docker does not answer here yet: start Docker Desktop before npm run infra:up.'
        : 'The secondary laptop does not answer yet: check that it is on and that ssh bq-infra works.',
    );
  }
  process.exit(0);
}

if (command === 'status') {
  console.log(`Containers run on: ${target()}`);
  const answering = dockerIsRunning();
  console.log(`Docker: ${answering ? 'answering' : 'not answering'}`);
  const running = answering ? runningContainers() : undefined;
  console.log(
    `Containers: ${running === undefined ? 'unknown' : running.length > 0 ? running.join(', ') : 'none'}`,
  );
  const { tunnel, open } = await tunnelState();
  console.log(
    `SSH tunnel: ${
      !tunnel
        ? 'not open'
        : open
          ? `open on 127.0.0.1 ports ${tunnel.ports.join(', ')} (process ${String(tunnel.pid)})`
          : 'remembered but not answering (npm run infra:down clears it)'
    }`,
  );
  process.exit(0);
}

if (command !== 'up' && command !== 'down') fail(USAGE);

if (!dockerIsRunning()) {
  fail(
    'Docker is not running. Start Docker Desktop (or the Docker service) and try again; on the secondary laptop check that it is on and that ssh bq-infra works.',
  );
}

const remote = isRemoteEndpoint(dockerEndpoint());
console.log(`Containers: ${target()}.`);

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

// On the secondary, the ports must be free here before anything starts.
const ports = command === 'up' && remote ? publishedPorts(readComposeConfig(profiles)) : [];
if (ports.length > 0) {
  const taken = await takenPorts(ports);
  if (taken.length > 0) fail(portsTakenMessage(taken, readTunnel()));
}

if (command === 'down' && snapshotsOnDown(remote)) {
  // A failed snapshot is a loud warning, not a reason to leave the containers running: `down`
  // keeps the data volume. A test project's `down` takes none (snapshotsOnDown).
  try {
    console.log(`Saved the MongoDB snapshot ${await snapshotMongo(undefined)} to this laptop.`);
  } catch (error) {
    console.warn(`No MongoDB snapshot was saved: ${(error as Error).message}`);
  }
}

const result = compose(command === 'up' ? upArgs(profiles) : downArgs(), { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);

if (command === 'up' && ports.length > 0) {
  try {
    await openTunnel(ports);
    console.log(`SSH tunnel open for 127.0.0.1 ports ${ports.join(', ')}.`);
  } catch (error) {
    fail((error as Error).message);
  }
}
if (command === 'down') {
  if (remote) {
    if (await closeTunnel()) console.log('SSH tunnel closed.');
  } else {
    // A `down` on this laptop's own Docker never closes the secondary's tunnel.
    const { tunnel, open } = await tunnelState();
    const notice = tunnelLeftOpenNotice(tunnel, open);
    if (notice) console.warn(notice);
  }
}
