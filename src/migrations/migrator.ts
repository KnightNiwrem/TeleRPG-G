import { FileMigrationProvider, Migrator } from 'kysely';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { db } from '../database.js';

// Get the directory name correctly in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Migrates the database to the latest version
 */
export async function migrateToLatest(): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    throw error;
  }
}

/**
 * Rolls back the latest migration
 */
export async function migrateDown(): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname),
    }),
  });

  const { error, results } = await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was rolled back successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to roll back migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate down');
    console.error(error);
    throw error;
  }
}