import { PsqlAdapter } from "@grammyjs/storage-psql";
import { Client } from "pg";
import { config } from "./config.js";

/**
 * Create a PostgreSQL storage adapter for Grammy chat members plugin
 * @returns Configured PostgreSQL storage adapter instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createChatMembersAdapter(): Promise<any> {
  const client = new Client({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
  });
  
  // Create PostgreSQL adapter
  const adapter = await PsqlAdapter.create({
    client,
    tableName: "chat_members"
  });
  
  // Type assertion to make it compatible with the expected type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return adapter as any;
}

/**
 * For compatibility with previous code
 * @deprecated Use createChatMembersAdapter instead
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createStorageAdapter(): Promise<any> {
  return createChatMembersAdapter();
}

/**
 * Create a PostgreSQL storage adapter for Grammy conversations plugin
 * @returns Configured PostgreSQL storage adapter instance for conversations
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createConversationsAdapter(): Promise<any> {
  const client = new Client({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
  });
  
  // Create PostgreSQL adapter for conversations
  const adapter = await PsqlAdapter.create({
    client,
    tableName: "conversations"
  });
  
  // Type assertion needed due to complex generic type compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return adapter as any;
}