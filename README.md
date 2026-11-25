# Beautinique

Indian beauty-only e-commerce marketplace: apps for every role, backend services and shared npm packages, in one monorepo. Education and portfolio project, built like a production product.

The project is being rebuilt from scratch, starting with the root setup. Docs: [docs/](docs/README.md).

## Repository map

| Path                          | What it holds                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `packages/<category>/<name>/` | Shared packages, public on npm under `@beautinique`                                                  |
| `frontend/<app>/`             | The web apps, deployed on Vercel                                                                     |
| `backend/<service>/`          | The backend services, deployed together on Render                                                    |
| `scripts/<area>/`             | Repository tools; [scripts/foundation](scripts/foundation) runs setup, the containers and the guards |
| [configs/](configs)           | Shared TypeScript, ESLint and Vitest configs                                                         |
| [infra/](infra/compose.yaml)  | The laptop's containers (Docker Compose)                                                             |
| [.github/](.github)           | CI and Dependabot                                                                                    |
| [docs/](docs/README.md)       | Plans, decisions, rules and manuals                                                                  |

Each package, app, service and tool folder above is an npm workspace, and Turborepo runs the tasks across them. Only `scripts/foundation` exists so far.

## Run it on a laptop

You need:

- **Node 24.22.3 and npm 12.2.3**, exactly (pinned in [package.json](package.json)). With nvm: `nvm install 24.22.3`, `nvm use 24.22.3`, then `npm install --global npm@12.2.3`.
- **Docker**, running (Docker Desktop on Windows and macOS).
- **Git.**

From a fresh clone:

```sh
npm run setup
```

Setup stops with the fix if Node or npm is the wrong version. Then it installs the dependencies (`npm ci`), makes each deployable's `.env.development` and `.env.test` from its `.env.example`, and starts the backend containers. It keeps env files that already exist, and it lists the development secrets to fill in. It never makes or reads `.env.production`.

When the work is over, stop the containers with `npm run infra:down`.

### Two laptops

The code, VS Code and Node always run on the primary laptop. The containers run every day on a second laptop (Ubuntu Server), which the primary drives through the Docker context `bq-infra` over SSH (`npm run infra:use -- secondary`, or `-- primary` in an emergency; `npm run infra:status` shows which): `npm run infra:up -- backend` then also opens one SSH tunnel (ssh host `bq-infra-tunnel`), so the containers' ports answer on the primary's `127.0.0.1` and the env files stay as they are. Live data (backup, restore drill, break-glass) is handled on the primary only. Details: [docs/OPERATIONS.md](docs/OPERATIONS.md) §1 rules 11 to 14.

## Commands

Run them from the repository root.

| Command                                                                         | What it does                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run setup`                                                                 | Sets up a laptop (above)                                                                                                                                                                                                |
| `npm run packages:build`                                                        | Builds all packages, or the named ones (`-- shared-money`), each after the packages it needs; `-- --dry-run` only shows the order (`scripts/packages`)                                                                  |
| `npm run packages:create -- --category shared --name money --description "..."` | Creates a package from the template, installs and verifies it (asks for what the flags leave out)                                                                                                                       |
| `npm run packages:verify`                                                       | Everything a publish checks, without publishing: build, typecheck, lint, tests, the package rules, the tarball's contents and the exports                                                                               |
| `npm run packages:status`                                                       | A table of each package: repo version, npm version and state (published, to publish, new)                                                                                                                               |
| `npm run packages:republish -- --bump minor`                                    | New versions, the dependents' ranges, CHANGELOGs and the lockfile in one commit on a work branch; publishes nothing                                                                                                     |
| `npm run packages:publish`                                                      | The owner's publish from the `release` branch on a laptop (plan, "haan", npm's one-time code); `--dry-run` shows the plan                                                                                               |
| `npm run packages:update-deps -- --level minor`                                 | Newer versions of the packages' outside dependencies, plan first; every file is put back if the install fails                                                                                                           |
| `npm run infra:up -- backend`                                                   | Starts one profile's containers (`backend`: MongoDB replica set and Valkey) and waits until they are healthy                                                                                                            |
| `npm run infra:down`                                                            | Stops every container; on the secondary laptop it first saves a MongoDB snapshot to this laptop and closes the SSH tunnel                                                                                               |
| `npm run infra:use -- secondary`                                                | Picks the laptop that runs the containers (`secondary` daily, `primary` in an emergency); waits while containers or the tunnel still run                                                                                |
| `npm run infra:status`                                                          | Says which laptop runs the containers, whether Docker answers, which containers run and whether the SSH tunnel is open                                                                                                  |
| `npm run dev-data:copy`                                                         | Copies the secondary laptop's development MongoDB straight into this laptop's (never the other way); starts the secondary's MongoDB itself, without the tunnel, when it is not running                                  |
| `npm run dev-data:restore`                                                      | Restores the latest snapshot (`%USERPROFILE%\bq-dev-data\`, the newest 3 are kept) into this laptop's MongoDB; with `-- --before-copy`, this laptop's own data as `dev-data:copy` saved it before a copy that broke off |
| `npm test`                                                                      | Unit and integration tests with coverage; the integration tests need Docker running                                                                                                                                     |
| `npm run build`                                                                 | Builds every workspace                                                                                                                                                                                                  |
| `npm run dev`                                                                   | Starts every workspace's dev task                                                                                                                                                                                       |
| `npm run lint`                                                                  | ESLint, with type information                                                                                                                                                                                           |
| `npm run typecheck`                                                             | TypeScript                                                                                                                                                                                                              |
| `npm run format:check` / `npm run format`                                       | Prettier: check, or fix                                                                                                                                                                                                 |
| `npm run docs:check`                                                            | Checks that every relative link in the docs points at a file in the repository                                                                                                                                          |
| `npm run secrets:scan`                                                          | Scans the git history for secrets (needs gitleaks 8.30.1 on the laptop)                                                                                                                                                 |

One workspace: `npm test -w <workspace name>`. One test file: `npx vitest run <file>` inside the workspace.

## Branches and CI

Work starts from `prerelease` on its own branch and goes back by pull request. `prerelease` is development, and it reaches `release` (production) by pull request. Every pull request runs [CI](.github/workflows/ci.yml), three jobs side by side: the secret scan, the branch flow and `npm audit`; format, lint, types, build and docs; and the tests.

## License

[MIT](LICENSE).
