import { Kysely } from 'kysely';
import { Database } from '../schema.js';

export async function up(db: Kysely<Database>): Promise<void> {
  // Add unique constraint to the user_id column in characters table
  await db.schema
    .createIndex('characters_user_id_unique')
    .on('characters')
    .column('user_id')
    .unique()
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Drop the unique constraint index
  await db.schema
    .dropIndex('characters_user_id_unique')
    .execute();
}