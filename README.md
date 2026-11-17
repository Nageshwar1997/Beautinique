# Beautinique

Indian beauty-only e-commerce marketplace: apps for every role, backend services and shared npm packages, in one monorepo. Education and portfolio project, built like a production product.

- Docs: [docs/](docs) (being rewritten from scratch); the previous docs are in [docs-old/](docs-old), kept for reference.
- Packages and releases: [docs-old/packages/README.md](docs-old/packages/README.md).

## Setup

Node 24 and npm 12.2+.

```bash
npm install
npm run build
```

Packages import each other's built `dist`, so build once after a fresh clone (and after pulling package changes).

## Common commands

```bash
npm run status
```

| Command                                          | What it does                                                 |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `npm run login` / `npm run logout`               | npm session for publishing                                   |
| `npm run create`                                 | new package in `packages/<shared\|frontend\|backend>/<name>` |
| `npm run publish`                                | publish new and waiting package versions                     |
| `npm run republish`                              | bump, check and publish new versions                         |
| `npm run verify`                                 | every publish check, nothing published                       |
| `npm run build`                                  | build every package, dependencies first                      |
| `npm run lint` / `typecheck` / `test` / `format` | code quality                                                 |

Packages are released from the `release` branch only. Every command explains itself with `-- --help`.

## License

[MIT](LICENSE). Fonts in `packages/frontend/styles` are OFL-1.1.
