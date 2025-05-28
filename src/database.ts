import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { config } from "./config.js";

// Define the database schema
interface Database {
  // Tables will be defined here if needed
  chat_members: Record<string, unknown>; // This will store chat member information
  conversations: Record<string, unknown>; // This will store conversation state information
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
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to connect to PostgreSQL database:", error);
    throw error;
  }
}