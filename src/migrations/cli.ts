import { migrateDown, migrateToLatest } from './migrator.js';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { connectDatabase } from '../database.js';

// Get the directory name correctly in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Command line interface for database migrations
 */
async function main(): Promise<void> {
  try {
    console.log('Connecting to database...');
    await connectDatabase();

    const command = process.argv[2] || 'up';

    if (command === 'up') {
      console.log('Running migrations...');
      await migrateToLatest();
      console.log('Migrations completed successfully');
    } else if (command === 'down') {
      console.log('Rolling back latest migration...');
      await migrateDown();
      console.log('Rollback completed successfully');
    } else if (command === 'create') {
      const name = process.argv[3];
      if (!name) {
        console.error('Migration name required');
        process.exit(1);
      }
      
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const filename = `${timestamp}_${name}.ts`;
      
      const template = `import { Kysely } from 'kysely';

// Define the database schema
interface Database {
  chat_members: Record<string, unknown>;
  conversations: Record<string, unknown>;
}

export async function up(db: Kysely<Database>): Promise<void> {
  // Migration code
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Rollback code
}
`;
      await fs.writeFile(path.join(__dirname, filename), template);
      console.log(`Created migration: ${filename}`);
    } else {
      console.error('Unknown command. Use: up, down, or create');
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Exit process to avoid hanging
    process.exit(0);
  }
}

// Run the migration CLI
main().catch(err => {
  console.error(err);
  process.exit(1);
});