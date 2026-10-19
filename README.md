# SyntiIQ

Multi-channel e-commerce platform (NestJS API + Vue web) in one repository.

## Layout

- `api/` — NestJS API
- `web/` — Vue web app

## Branches

- Feature work targets `dev`
- `master` is the API release branch (Release Please)

## Local setup

```bash
yarn install
yarn --cwd api start:dev
yarn --cwd web dev
```

API Docker dependencies: `docker compose -f api/docker-compose.yaml up -d`
