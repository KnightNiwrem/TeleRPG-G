import { PsqlAdapter } from "@grammyjs/storage-psql";
import { Client } from "pg";
import type { ChatMember } from "grammy/types";
import { config } from "./config.js";

/**
 * Create a PostgreSQL storage adapter for Grammy chat members plugin
 * @returns Configured PostgreSQL storage adapter instance
 */
export async function createStorageAdapter(): Promise<{
  read(key: string): Promise<ChatMember | undefined>;
  write(key: string, value: ChatMember): Promise<void>;
  delete(key: string): Promise<void>;
}> {
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
  return adapter as unknown as {
    read(key: string): Promise<ChatMember | undefined>;
    write(key: string, value: ChatMember): Promise<void>;
    delete(key: string): Promise<void>;
  };
}

/**
 * Create a PostgreSQL storage adapter for Grammy conversations
 * @returns Configured PostgreSQL storage adapter for conversations
 */
export async function createConversationsAdapter() {
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
  
  // For compatibility with conversations plugin, type "key" as a string literal
  return {
    type: "key" as const,
    adapter
  };
}