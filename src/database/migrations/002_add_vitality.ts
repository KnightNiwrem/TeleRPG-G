import { Kysely } from 'kysely';
import { Database } from '../schema.js';

export async function up(db: Kysely<Database>): Promise<void> {
  // Add vitality column to characters table
  await db.schema
    .alterTable('characters')
    .addColumn('vitality', 'integer', (col) => col.notNull().defaultTo(5))
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Remove vitality column from characters table
  await db.schema
    .alterTable('characters')
    .dropColumn('vitality')
    .execute();
}