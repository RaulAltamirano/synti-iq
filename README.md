# SyntiIQ

Enterprise-grade multi-channel e-commerce platform built with NestJS for managing sales, inventory, and operations across multiple channels.

## Features

- Multi-channel sales integration (Web, Mobile, Marketplaces)
- Real-time inventory management
- Product catalog with variants and attributes
- Order processing and fulfillment
- User authentication and role-based access control
- Analytics and reporting
- Store and cashier schedule management

## Tech Stack

- **Framework**: NestJS, TypeScript
- **Database**: PostgreSQL (PostGIS), Redis
- **Authentication**: JWT, Two-Factor Authentication
- **API**: REST
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Prerequisites

- Node.js >= 16
- Yarn >= 1.22
- Docker & Docker Compose
- PostgreSQL >= 13 (or use Docker)
- Redis >= 6 (or use Docker)

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd synti-iq-api
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Start services with Docker

```bash
docker-compose up -d
```

This will start PostgreSQL and Redis containers.

### 4. Configure environment

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_NAME=syntiiq

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Mail (Resend) - optional; if not set, welcome emails are skipped
# RESEND_API_KEY=re_xxx
# MAIL_FROM=onboarding@resend.dev   # Use resend.dev for testing (verified domain)

# JWT (RS256 - Asymmetric)
# Option 1: Use file paths (recommended)
JWT_PRIVATE_KEY_PATH=./keys/private_key_pkcs8.pem
JWT_PUBLIC_KEY_PATH=./keys/public_key.pem

# Option 2: Use environment variables (for Docker/containers)
# JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
# JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."

# Token expiration
JWT_ACCESS_EXPIRATION_TIME=15m
JWT_REFRESH_EXPIRATION_TIME=7d

# Frontend URL (for CORS and cookies)
FRONTEND_URL=http://localhost:5173
```

### 5. Generate RSA keys for JWT

The application uses RS256 (asymmetric) algorithm for JWT signing. Generate RSA keys:

```bash
./scripts/generate-keys.sh
```

This will create:

- `keys/private_key.pem` - Private key (keep secure!)
- `keys/public_key.pem` - Public key
- `keys/private_key_pkcs8.pem` - Private key in PKCS#8 format (recommended)

**Important**: Never commit these keys to version control. They are automatically excluded via `.gitignore`.

### 6. Database schema

TypeORM synchronizes the schema from entities when the application starts. Ensure the database is running and accessible.

### 7. Start the application

```bash
# Development mode
yarn start:dev

# Debug mode
yarn start:debug

# Production mode
yarn start:prod
```

The API will be available at `http://localhost:3000`

## API Documentation

Swagger documentation is available at:

- **Development**: `http://localhost:3000/api/docs`

### Postman Collection

The Postman collection is modular. Edit files in `postman/collections/`, then run `yarn postman:build` to regenerate `Synti-IQ-API.postman_collection.json`. See [postman/README.md](postman/README.md) for details.

## Available Scripts

```bash
# Development
yarn start:dev          # Start in watch mode
yarn start:debug        # Start in debug mode
yarn start:prod         # Start in production mode

# Testing
yarn test               # Run unit tests
yarn test:watch         # Run tests in watch mode
yarn test:cov           # Run tests with coverage
yarn test:e2e           # Run end-to-end tests

# Code Quality
yarn lint               # Lint and fix code
yarn lint:check         # Check linting without fixing
yarn format             # Format code with Prettier
yarn format:check       # Check formatting without fixing
yarn quality            # Full check: build + lint + test + format

# Build
yarn build              # Build for production
yarn postman:build      # Regenerate Postman collection from modular files

# Database seeding
yarn seed:all                    # Run all seeds (permissions, groups, roles, users, subscription_plans)
yarn seed:permissions            # Permissions only
yarn seed:groups                 # Permission groups only
yarn seed:roles                  # Roles only
yarn seed:users                  # Users only
yarn seed:subscription_plans     # Subscription plans only (Basic, Professional, Enterprise)
```

## Project Structure

```
src/
├── auth/               # Authentication & authorization
├── cash-register-session/  # Cash register sessions
├── cashier-profile/    # Cashier profile management
├── cashier-schedule-assignment/  # Cashier scheduling
├── core/               # Core application module
├── customer-profile/   # Customer profile management
├── default-profile/    # Default profile management
├── delivery-profiles/  # Delivery profile management
├── inventory/          # Inventory management
├── inventory-movement/ # Inventory movement tracking
├── location/           # Location management
├── product/            # Product catalog
├── product-category/   # Product categories
├── provider-profile/   # Provider profile management
├── recurring-schedule-template/  # Recurring schedules
├── sale/               # Sales management
├── sale-item/          # Sale items
├── shared/             # Shared utilities and modules
├── store/              # Store management
├── time-block/         # Time block management
├── transactions/       # Transaction management
├── user/               # User management
├── user-profile/       # User profile management
└── user-session/       # User session management
```

**Conventions:** All folder names use kebab-case. Package name: `synti-iq-api`.

### Conventions & Guides

- **[AGENTS.md](AGENTS.md)** — Agent and developer guide (naming, structure, validation, executable commands).
- **[docs/CONVENTIONS.md](docs/CONVENTIONS.md)** — Detailed technical conventions (DTOs, Swagger, error handling, tests).
- **.cursor/rules/** — Cursor rules for context-aware AI assistance.

For store creation behavior, SubscriptionPlan usage, and planned work (e.g. business subscriptions and max_stores limits), see [docs/STORE_AND_SUBSCRIPTION_PLANS.md](docs/STORE_AND_SUBSCRIPTION_PLANS.md).

### PR Review Pipeline

Pull requests trigger an automated review with SonarCloud, AI (Gemini), and Discord notifications. See [docs/PR_REVIEW_PIPELINE.md](docs/PR_REVIEW_PIPELINE.md) for setup details.

## Environment Variables

Required environment variables:

| Variable                      | Description              | Default                        |
| ----------------------------- | ------------------------ | ------------------------------ |
| `NODE_ENV`                    | Environment mode         | `development`                  |
| `PORT`                        | Application port         | `3000`                         |
| `DB_HOST`                     | Database host            | `localhost`                    |
| `DB_PORT`                     | Database port            | `5434`                         |
| `DB_USERNAME`                 | Database username        | `postgres`                     |
| `DB_PASSWORD`                 | Database password        | -                              |
| `DB_NAME`                     | Database name            | `syntiiq`                      |
| `REDIS_HOST`                  | Redis host               | `localhost`                    |
| `REDIS_PORT`                  | Redis port               | `6379`                         |
| `JWT_PRIVATE_KEY_PATH`        | Path to RSA private key  | `./keys/private_key_pkcs8.pem` |
| `JWT_PUBLIC_KEY_PATH`         | Path to RSA public key   | `./keys/public_key.pem`        |
| `JWT_ACCESS_EXPIRATION_TIME`  | Access token expiration  | `15m`                          |
| `JWT_REFRESH_EXPIRATION_TIME` | Refresh token expiration | `7d`                           |
| `FRONTEND_URL`                | Frontend URL for CORS    | `http://localhost:5173`        |

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build
```

## Workspace

This project is part of the SyntiIQ workspace. To open both frontend and backend together in Cursor/VSCode, use `synti-iq.code-workspace` from the parent directory.

## License

UNLICENSED
