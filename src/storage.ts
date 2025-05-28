import { PsqlAdapter } from "@grammyjs/storage-psql";
import { Client } from "pg";
import { type StorageAdapter } from "grammy";
import { type ChatMember } from "grammy/types";
import { type ConversationData, type VersionedState } from "@grammyjs/conversations";
import { config } from "./config.js";

/**
 * Create a PostgreSQL storage adapter for Grammy chat members plugin
 * @returns Configured PostgreSQL storage adapter instance
 */
export async function createChatMembersAdapter(): Promise<StorageAdapter<ChatMember>> {
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
  
  return adapter as StorageAdapter<ChatMember>;
}

/**
 * For compatibility with previous code
 * @deprecated Use createChatMembersAdapter instead
 */
export async function createStorageAdapter(): Promise<StorageAdapter<ChatMember>> {
  return createChatMembersAdapter();
}

/**
 * Create a versioned state storage adapter for Grammy conversations plugin
 * @returns Configured PostgreSQL storage adapter for conversations
 */
export async function createConversationsAdapter(): Promise<{
  read(key: string): Promise<VersionedState<ConversationData> | undefined>;
  write(key: string, state: VersionedState<ConversationData>): Promise<void>;
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
    tableName: "conversations"
  });
  
  // Create a wrapper that satisfies the VersionedStateStorage interface
  return {
    async read(key: string): Promise<VersionedState<ConversationData> | undefined> {
      const data = await adapter.read(key);
      return data as VersionedState<ConversationData> | undefined;
    },
    async write(key: string, state: VersionedState<ConversationData>): Promise<void> {
      await adapter.write(key, state);
    },
    async delete(key: string): Promise<void> {
      await adapter.delete(key);
    }
  };
}