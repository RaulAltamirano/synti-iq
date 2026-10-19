#!/usr/bin/env node
/**
 * Build script: combines base + domain collections into a single Postman collection.
 * Run: yarn postman:build (or node postman/build.js)
 *
 * Output: Synti-IQ-API.postman_collection.json (project root)
 */

const fs = require('fs');
const path = require('path');

const POSTMAN_DIR = __dirname;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BASE_PATH = path.join(POSTMAN_DIR, 'base', '_base.postman_collection.json');
const COLLECTIONS_DIR = path.join(POSTMAN_DIR, 'collections');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'Synti-IQ-API.postman_collection.json');

// Order matters: Auth first, then the rest. Add new domains here when needed.
const COLLECTION_ORDER = [
  'auth',
  'mail',
  'user-sessions',
  'users',
  'products',
  'inventory',
  'stores',
  'store-schedules',
  'cashier-schedules',
  'sales',
  'payment-methods',
  'product-categories',
  'customer-addresses',
  'roles-permissions',
  'referral',
];

const COLLECTION_DESCRIPTION = `# 📚 Synti IQ E-commerce API Collection

Complete API collection for Synti IQ E-commerce platform with automated token management, comprehensive documentation, and best practices.

## 🎯 Features

- ✅ Automated token management
- 📖 Comprehensive documentation
- 🧪 Automated tests
- 🔄 Auto-refresh tokens
- 📊 Response validation

## 🚀 Getting Started

1. Import this collection and environment
2. Select the environment: **Synti IQ - Development**
3. Run **🔐 Authentication → Login** to get your tokens
4. All protected endpoints use cookies automatically (enable 'Send cookies' in Postman)

## 📝 Environment Variables

- \`base_url\`: API base URL (default: http://localhost:3000)
- \`access_token\`: JWT access token (stored from cookie for reference; auth uses cookies)
- \`refresh_token\`: JWT refresh token (auto-set after login)
- \`user_id\`: Current user ID (auto-set after login)
- \`user_email\`: User email for login
- \`user_password\`: User password for login

## 🔗 Swagger Documentation

Visit: \`{{base_url}}/api/docs\` for interactive API documentation`;

function main() {
  if (!fs.existsSync(BASE_PATH)) {
    console.error('Base collection not found:', BASE_PATH);
    process.exit(1);
  }

  const base = JSON.parse(fs.readFileSync(BASE_PATH, 'utf8'));
  const mergedItems = [];

  for (const name of COLLECTION_ORDER) {
    const filePath = path.join(COLLECTIONS_DIR, `${name}.postman_collection.json`);
    if (!fs.existsSync(filePath)) {
      console.warn('Collection not found:', filePath, '- skipping');
      continue;
    }

    const sub = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (sub.item && sub.item.length > 0) {
      mergedItems.push(...sub.item);
    }
  }

  const result = {
    info: {
      _postman_id: 'synti-iq-api-collection',
      name: '🚀 Synti IQ API',
      description: COLLECTION_DESCRIPTION,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      _exporter_id: 'synti-iq',
      version: '1.0.0',
    },
    item: mergedItems,
    event: base.event,
    variable: base.variable,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf8');
  console.log('Built:', OUTPUT_PATH);
  console.log('  Folders:', mergedItems.length);
  console.log('  Requests:', countRequests(mergedItems));
}

function countRequests(items) {
  let count = 0;
  for (const item of items) {
    if (item.request) {
      count++;
    } else if (item.item) {
      count += countRequests(item.item);
    }
  }
  return count;
}

main();
