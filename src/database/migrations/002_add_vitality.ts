import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add vitality column to characters table
  await db.schema
    .alterTable('characters')
    .addColumn('vitality', 'integer', (col) => col.notNull().defaultTo(5))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove vitality column from characters table
  await db.schema
    .alterTable('characters')
    .dropColumn('vitality')
    .execute();
}