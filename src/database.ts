import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { config } from "./config.js";

// Define the database schema
interface Database {
  // Tables will be defined here if needed
}

// Create a Kysely instance for PostgreSQL
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
    }),
  }),
});

// Function to ensure database connection
export async function connectDatabase(): Promise<void> {
  try {
    // Simple query to test connection
    await db.executeQuery(
      {
        sql: "SELECT 1",
        parameters: [],
      },
      "query"
    );
    console.log("Successfully connected to PostgreSQL database");
  } catch (error) {
    console.error("Failed to connect to PostgreSQL database:", error);
    throw error;
  }
}