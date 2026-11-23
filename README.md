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

## Commands

Run them from the repository root.

| Command                                   | What it does                                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run setup`                           | Sets up a laptop (above)                                                                                     |
| `npm run infra:up -- backend`             | Starts one profile's containers (`backend`: MongoDB replica set and Valkey) and waits until they are healthy |
| `npm run infra:down`                      | Stops every container                                                                                        |
| `npm test`                                | Unit and integration tests with coverage; the integration tests need Docker running                          |
| `npm run build`                           | Builds every workspace                                                                                       |
| `npm run dev`                             | Starts every workspace's dev task                                                                            |
| `npm run lint`                            | ESLint, with type information                                                                                |
| `npm run typecheck`                       | TypeScript                                                                                                   |
| `npm run format:check` / `npm run format` | Prettier: check, or fix                                                                                      |
| `npm run docs:check`                      | Checks that every relative link in the docs points at a file in the repository                               |
| `npm run secrets:scan`                    | Scans the git history for secrets (needs gitleaks 8.30.1 on the laptop)                                      |

One workspace: `npm test -w <workspace name>`. One test file: `npx vitest run <file>` inside the workspace.

## Branches and CI

Work starts from `prerelease` on its own branch and goes back by pull request. `prerelease` is development, and it reaches `release` (production) by pull request. Every pull request runs [CI](.github/workflows/ci.yml), three jobs side by side: the secret scan, the branch flow and `npm audit`; format, lint, types, build and docs; and the tests.

## License

[MIT](LICENSE).
