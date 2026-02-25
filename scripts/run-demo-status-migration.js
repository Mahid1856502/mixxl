#!/usr/bin/env node
/**
 * Run the demo_submission_status enum migration manually.
 * Use when db:push fails due to varchar->enum cast.
 *
 * Usage: node scripts/run-demo-status-migration.js
 * Requires: DATABASE_URL in env
 */
import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = fs.readFileSync(
  path.join(__dirname, '../migrations/0002_demo_submission_status_enum.sql'),
  'utf8'
);

async function run() {
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Migration 0002_demo_submission_status_enum completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
