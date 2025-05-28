import { db } from "./database.js";

/**
 * Set up required database tables for the application
 */
export async function setupDatabaseTables(): Promise<void> {
  try {
    // Create conversations table if it doesn't exist
    await db.schema
      .createTable("conversations")
      .ifNotExists()
      .addColumn("key", "text", col => col.primaryKey())
      .addColumn("value", "jsonb", col => col.notNull())
      .execute();
    
    console.log("Conversations table setup complete");
  } catch (error) {
    console.error("Error setting up database tables:", error);
    throw error;
  }
}