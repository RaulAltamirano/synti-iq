#!/usr/bin/env node
/**
 * One-time script to split the monolithic Postman collection into domain-specific files.
 * Run from project root: node postman/scripts/split-collection.js
 *
 * Reads: Synti-IQ-API.postman_collection.json
 * Writes: postman/collections/*.postman_collection.json
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SOURCE_COLLECTION = path.join(PROJECT_ROOT, 'Synti-IQ-API.postman_collection.json');
const COLLECTIONS_DIR = path.join(PROJECT_ROOT, 'postman', 'collections');

// Explicit mapping: folder name (exact match) -> output filename (without extension)
const FOLDER_TO_FILENAME = {
  '🔐 Authentication': 'auth',
  '📱 User Sessions': 'user-sessions',
  'Users': 'users',
  'Products': 'products',
  'Inventory': 'inventory',
  'Stores': 'stores',
  'Store Schedules': 'store-schedules',
  'Cashier Schedules': 'cashier-schedules',
  'Sales': 'sales',
  'Payment Methods': 'payment-methods',
  'Product Categories': 'product-categories',
  '📍 Customer Addresses': 'customer-addresses',
  '🔐 Roles & Permissions': 'roles-permissions',
  '🎁 Referral': 'referral',
};

function main() {
  if (!fs.existsSync(SOURCE_COLLECTION)) {
    console.error('Source collection not found:', SOURCE_COLLECTION);
    process.exit(1);
  }

  const collection = JSON.parse(fs.readFileSync(SOURCE_COLLECTION, 'utf8'));
  const items = collection.item || [];

  if (!fs.existsSync(COLLECTIONS_DIR)) {
    fs.mkdirSync(COLLECTIONS_DIR, { recursive: true });
  }

  let processed = 0;
  for (const folder of items) {
    const filename = FOLDER_TO_FILENAME[folder.name];
    if (!filename) {
      console.warn('No mapping for folder:', folder.name, '- skipping');
      continue;
    }

    const subCollection = {
      info: {
        _postman_id: `synti-iq-${filename}`,
        name: folder.name,
        description: folder.description || '',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        version: '1.0.0',
      },
      item: [folder],
    };

    const outputPath = path.join(COLLECTIONS_DIR, `${filename}.postman_collection.json`);
    fs.writeFileSync(outputPath, JSON.stringify(subCollection, null, 2), 'utf8');
    console.log('Wrote:', outputPath, `(${folder.item?.length || 0} requests)`);
    processed++;
  }

  console.log(`\nSplit complete: ${processed} domain files created.`);
}

main();
