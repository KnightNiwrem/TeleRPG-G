import { Kysely } from 'kysely';

// Define the database schema
interface Database {
  chat_members: Record<string, unknown>;
  conversations: Record<string, unknown>;
}

export async function up(db: Kysely<Database>): Promise<void> {
  // Create conversations table if it doesn't exist
  await db.schema
    .createTable('conversations')
    .ifNotExists()
    .addColumn('key', 'text', col => col.primaryKey())
    .addColumn('value', 'jsonb', col => col.notNull())
    .execute();

  // Create chat_members table if it doesn't exist
  await db.schema
    .createTable('chat_members')
    .ifNotExists()
    .addColumn('key', 'text', col => col.primaryKey())
    .addColumn('value', 'jsonb', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Drop tables in reverse order
  await db.schema.dropTable('chat_members').ifExists().execute();
  await db.schema.dropTable('conversations').ifExists().execute();
}