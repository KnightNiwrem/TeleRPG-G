import { Kysely, sql } from 'kysely';
import { Database } from '../schema.js';

export async function up(db: Kysely<Database>): Promise<void> {
  // Create player_interaction_states table
  await db.schema
    .createTable('player_interaction_states')
    .addColumn('player_id', 'bigint', (col) => 
      col.notNull().primaryKey().references('characters.user_id')
    )
    .addColumn('current_action', 'varchar', (col) => col.notNull())
    .addColumn('action_context', 'jsonb', (col) => col.notNull().defaultTo('{}'))
    .addColumn('expires_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('player_interaction_states').execute();
}