import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Kysely, Migrator, FileMigrationProvider } from 'kysely';
import { db } from './kysely.js';

// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateToLatest(exitOnError = true, closeConnection = true) {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  if (results?.length) {
    results.forEach((it) => {
      if (it.status === 'Success') {
        console.log(`Migration "${it.migrationName}" was executed successfully`);
      } else if (it.status === 'Error') {
        console.error(`Failed to execute migration "${it.migrationName}"`);
      }
    });
  } else {
    console.log('No migrations were executed');
  }

  if (error) {
    console.error('Failed to migrate');
    console.error(error);
    if (exitOnError) {
      process.exit(1);
    } else {
      throw error;
    }
  }

  if (closeConnection) {
    await db.destroy();
  }
}

// Run the migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToLatest(true, true);
}

// Export for use in other files
export { migrateToLatest };