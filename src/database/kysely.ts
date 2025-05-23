import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from './schema.js';
import { env } from '../config/env.js';

// Initialize database connection pool
const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
});

// Create Kysely instance
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});