import { Generated, Kysely, PostgresDialect, sql } from "kysely";
import pg from "pg";
import { config } from "./config.js";

// Define the database schema
interface Database {
  // Tables will be defined here if needed
  chat_members: Record<string, unknown>; // This will store chat member information
  players: PlayerTable; // This will store player information
}

// Player table schema
export interface PlayerTable {
  id: Generated<number>;
  name: string;
  telegram_user_id: string;
  telegram_chat_id: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Create pg pool
const pgPool = new pg.Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
});

// Create a Kysely instance for PostgreSQL
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: pgPool
  }),
});

// Function to ensure database connection
export async function connectDatabase(): Promise<void> {
  try {
    // Use pg client directly to test connection
    const client = await pgPool.connect();
    try {
      const result = await client.query('SELECT NOW() as now');
      console.log("Successfully connected to PostgreSQL database at:", result.rows[0].now);
      
      // Run database migrations
      await migrateDatabase();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to connect to PostgreSQL database:", error);
    throw error;
  }
}

/**
 * Run database migrations to ensure tables exist
 */
async function migrateDatabase(): Promise<void> {
  try {
    // Create players table if it doesn't exist
    await db.schema
      .createTable('players')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('telegram_user_id', 'varchar(255)', (col) => col.notNull().unique())
      .addColumn('telegram_chat_id', 'varchar(255)', (col) => col.notNull())
      .addColumn('created_at', 'timestamp', (col) => 
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .addColumn('updated_at', 'timestamp', (col) => 
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .execute();

    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Failed to run database migrations:", error);
    throw error;
  }
}