import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
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

export async function down(db: Kysely<any>): Promise<void> {
  // Drop tables in reverse order
  await db.schema.dropTable('chat_members').ifExists().execute();
  await db.schema.dropTable('conversations').ifExists().execute();
}