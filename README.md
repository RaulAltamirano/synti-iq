# Synti-IQ Web

![Synti-IQ](public/logo.svg)

Frontend for **Synti-IQ**: Vue 3 + TypeScript + Vite, Pinia, Tailwind CSS v4, and Storybook.

**Status:** active development.

---

## Stack

| Area        | Technology                                      |
| ----------- | ----------------------------------------------- |
| Framework   | Vue 3.5+, Vue Router 4                          |
| Build       | Vite 7                                          |
| Language    | TypeScript 5.9                                  |
| Styling     | Tailwind CSS 4 (`@tailwindcss/postcss`)         |
| State       | Pinia 3                                         |
| HTTP        | Axios                                           |
| Tests       | Vitest 4 (+ jsdom)                              |
| Docs / UI   | Storybook 10 (`@storybook/vue3-vite`)           |
| Icons       | Font Awesome 7 (`@fortawesome/vue-fontawesome`) |
| Git hooks   | Husky, lint-staged, Commitlint (conventional)   |

---

## Prerequisites

- **Node.js** (LTS recommended)
- **Yarn** classic (v1.x; lockfile: `yarn.lock`)

---

## Getting started

```bash
yarn install
cp .env.example .env   # optional: set VITE_API_BASE_URL, keys, etc.
yarn dev               # http://localhost:5173 (default Vite port)
```

Aliases: `yarn start:dev` → same as `yarn dev`.

---

## Scripts

| Command               | Description |
| --------------------- | ----------- |
| `yarn dev` / `yarn start:dev` | Dev server (Vite) |
| `yarn build`          | `vue-tsc -b` then production bundle |
| `yarn preview`        | Preview production build locally |
| `yarn type-check`     | TypeScript check (`vue-tsc --noEmit`) — no emit |
| `yarn lint`           | ESLint on `src/` |
| `yarn lint:fix`       | ESLint with `--fix` |
| `yarn format`         | Prettier write on `src/**/*.{ts,vue,js,cjs,mjs,json,css,md}` |
| `yarn format:check`   | Prettier check (CI-friendly) |
| `yarn test`           | Vitest run |
| `yarn test:watch`     | Vitest watch |
| `yarn test:coverage`  | Vitest with coverage |
| `yarn storybook`      | Storybook dev (port **6006**) |
| `yarn build-storybook`| Static Storybook build |
| `yarn quality`        | Full pipeline: build → lint → type-check → format:check → test → build-storybook |
| `yarn pre-pr`         | Same as `yarn quality` |

**Before a PR:** run `yarn quality` (or at least `yarn type-check`, `yarn format:check`, and the tests you touched). The repo may still have legacy lint/type issues outside your changes; fix what you own.

---

## Theme (light / dark)

- Preference is stored under **`synti-iq-theme-preference`** in `localStorage` (values: `light` \| `dark` \| `system`).
- Resolved darkness toggles the **`dark` class** on `<html>`; UI uses Tailwind **`dark:`** variants and design tokens (see `src/modules/ui/styles/tokens.css`, `src/assets/tailwind.css`).
- Pinia store id: **`themePreference`** (`src/modules/shared/store/ThemeStore.ts`). Boot alignment: `index.html` inline script + `src/modules/shared/theme/theme-preference.ts`.

---

## Project layout

- `src/modules/` — feature modules (e.g. `auth/`, `store/`, `ui/`, `shared/`)
- `src/modules/ui/` — shared UI components + Storybook stories
- `docs/` — [documentation index](docs/README.md), [frontend conventions](docs/FRONTEND_CONVENTIONS.md)
- AI/developer guide: [AGENTS.md](AGENTS.md)

---

## Workspace (monorepo)

This app lives next to **synti-iq-api**. To open API + web in one VS Code/Cursor window, use the workspace file in the parent folder:

`synti-iq-workspace/synti-iq.code-workspace`

---

## Code quality

- **ESLint** (`eslint.config.mjs`) + **Prettier** (`prettier.config.cjs`).
- Recommended extensions: see `.vscode/extensions.json`.
- **lint-staged** runs Prettier + ESLint on staged files (via Husky).

---

## Documentation

| Doc | Purpose |
| --- | ------- |
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/FRONTEND_CONVENTIONS.md](docs/FRONTEND_CONVENTIONS.md) | Components, Tailwind, Storybook, Pinia |
| [src/modules/ui/README.md](src/modules/ui/README.md) | UI module usage |

---

## CI suggestions

Typical checks:

```bash
yarn install --frozen-lockfile
yarn lint
yarn type-check
yarn format:check
yarn test
yarn build
```

Add `yarn build-storybook` when UI/stories change.

---

_License: see repository root / package metadata._
