# Postman Collection (Modular)

The Synti IQ API Postman collection is split into domain-specific files for easier editing and better Git diffs.

## Structure

```
postman/
├── base/
│   └── _base.postman_collection.json   # Shared scripts (token refresh, global tests) and variables
├── collections/
│   ├── auth.postman_collection.json
│   ├── user-sessions.postman_collection.json
│   ├── users.postman_collection.json
│   ├── products.postman_collection.json
│   ├── inventory.postman_collection.json
│   ├── stores.postman_collection.json
│   ├── store-schedules.postman_collection.json
│   ├── cashier-schedules.postman_collection.json
│   ├── sales.postman_collection.json
│   ├── payment-methods.postman_collection.json
│   ├── product-categories.postman_collection.json
│   ├── customer-addresses.postman_collection.json
│   ├── roles-permissions.postman_collection.json
│   └── referral.postman_collection.json
├── scripts/
│   └── split-collection.js            # One-time script to split a monolithic collection
├── build.js                            # Combines base + collections into one file
└── README.md
```

## How to Edit

1. Edit the relevant file in `postman/collections/` (e.g. `auth.postman_collection.json` for auth endpoints).
2. Run `yarn postman:build` to regenerate the combined collection.
3. Import `Synti-IQ-API.postman_collection.json` (project root) into Postman.

## How to Build

```bash
yarn postman:build
```

Output: `Synti-IQ-API.postman_collection.json` in the project root.

## Adding a New Domain

1. Create a new file in `postman/collections/` (e.g. `my-domain.postman_collection.json`).
2. Use this structure:

```json
{
  "info": {
    "_postman_id": "synti-iq-my-domain",
    "name": "My Domain",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "My Domain",
      "item": [ /* requests here */ ]
    }
  ]
}
```

3. Add the filename (without extension) to `COLLECTION_ORDER` in `postman/build.js` in the desired position.
4. Run `yarn postman:build`.

## Collection Order

The build merges collections in this order (defined in `postman/build.js`):

1. auth
2. user-sessions
3. users
4. products
5. inventory
6. stores
7. store-schedules
8. cashier-schedules
9. sales
10. payment-methods
11. product-categories
12. customer-addresses
13. roles-permissions
14. referral

Auth is always first so login/refresh flows work correctly.

## Running with Newman

```bash
newman run Synti-IQ-API.postman_collection.json -e Postman-Environment.postman_environment.json
```

## Split Script (One-Time)

If you have a monolithic collection and need to split it:

```bash
node postman/scripts/split-collection.js
```

This reads `Synti-IQ-API.postman_collection.json` and creates one file per domain in `postman/collections/`. Add new folder names to `FOLDER_TO_FILENAME` in the script if needed.
