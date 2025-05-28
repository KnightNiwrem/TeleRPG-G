import { PsqlAdapter } from "@grammyjs/storage-psql";
import { Client } from "pg";
import type { ChatMember } from "grammy/types";
import { config } from "./config.js";

/**
 * Create a PostgreSQL storage adapter for Grammy chat members plugin
 * @returns Configured PostgreSQL storage adapter instance
 */
export async function createChatMembersAdapter(): Promise<{
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
 * For compatibility with previous code
 * @deprecated Use createChatMembersAdapter instead
 */
export async function createStorageAdapter(): Promise<{
  read(key: string): Promise<ChatMember | undefined>;
  write(key: string, value: ChatMember): Promise<void>;
  delete(key: string): Promise<void>;
}> {
  return createChatMembersAdapter();
}