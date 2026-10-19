# SyntiIQ

[![Quality Gate](https://sonarcloud.io/api/project_badges/quality_gate?project=RaulAltamirano_synti-iq&organization=RaulAltamirano)](https://sonarcloud.io/summary/new_code?id=RaulAltamirano_synti-iq)

Multi-channel e-commerce platform in one Yarn workspaces repository: a NestJS API and a Vue web app.

- `api/` — NestJS API (PostgreSQL/PostGIS, Redis, JWT, Swagger). Details: [api/README.md](api/README.md).
- `web/` — Vue 3 + Vite frontend. Details: [web/README.md](web/README.md).

SonarCloud covers the API only.

## Prerequisites

- Node.js >= 20.19
- Yarn classic >= 1.22 (one root `yarn.lock`)
- Docker and Docker Compose, for Postgres and Redis

## Local setup

From the repository root:

```bash
yarn install

cp api/.env.example api/.env
cp web/.env.example web/.env   # optional

docker compose -f api/docker-compose.yaml up -d

# RS256 keys used by the API (gitignored)
(cd api && ./scripts/generate-keys.sh)

yarn --cwd api start:dev   # http://localhost:3000
yarn --cwd web dev         # http://localhost:5173
```

Swagger: `http://localhost:3000/api/docs`.

`api/.env.example` uses `DB_PORT=5432`. Compose maps the host port from `DB_PORT` and defaults to **5434** when it is unset. Set `DB_PORT` in `api/.env` to the same host port Compose publishes.

For local web development, leave `VITE_API_BASE_URL` unset. Vite proxies `/api` to the Nest app (`VITE_DEV_API_PROXY_TARGET`, default `http://127.0.0.1:3000`). See [web/.env.example](web/.env.example).

Do not commit `api/.env`, `web/.env`, or `api/keys/`.

### Seed data

After the API can reach the database:

```bash
yarn --cwd api seed:all
```

## Scripts

Install once at the root. Run package scripts with `yarn --cwd <package> <script>`.

| Command | What it does |
| --- | --- |
| `yarn --cwd api start:dev` | API in watch mode |
| `yarn --cwd api build` | Compile the API |
| `yarn --cwd api test` | API unit tests |
| `yarn --cwd api test:cov` | API tests with coverage (`api/coverage/`) |
| `yarn --cwd api lint` / `format:check` | API lint and Prettier check |
| `yarn --cwd api quality` | API build, lint, test, and format check |
| `yarn --cwd web dev` | Vite dev server |
| `yarn --cwd web lint` / `format:check` | Web lint and Prettier check |
| `yarn --cwd web type-check` | `vue-tsc --noEmit` |
| `yarn --cwd web test` | Vitest unit tests |
| `yarn --cwd web build` | Type-check and production bundle |
| `yarn --cwd web storybook` | Storybook on port 6006 |

`yarn --cwd web quality` also builds Storybook. Web type-check may still fail on existing Vue errors; do not treat that as a required check yet.

## Branches

Feature branches target `dev`. `master` is the API release branch (Release Please). Do not rename `master` to `main`.

Branch names: `<issue>-<type>-<slug>` (for example `42-feat-store-add-stats`). Commits use Conventional Commits, header max 72 characters. See [api/docs/BRANCHING_STRATEGY.md](api/docs/BRANCHING_STRATEGY.md).

## Documentation

| Doc | Purpose |
| --- | --- |
| [api/README.md](api/README.md) | API env vars, scripts, module layout |
| [api/docs/README.md](api/docs/README.md) | API conventions, workflow, quality |
| [api/AGENTS.md](api/AGENTS.md) | API agent and developer guide |
| [web/README.md](web/README.md) | Web scripts, theme, layout |
| [web/docs/README.md](web/docs/README.md) | Web documentation index |
| [web/AGENTS.md](web/AGENTS.md) | Web agent and developer guide |

Husky (`commitlint` + `lint-staged`) is installed only at the repository root.

## License

UNLICENSED
