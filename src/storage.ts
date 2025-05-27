import { type ChatMember } from "@grammyjs/types";

/**
 * A simple in-memory storage adapter for Grammy chat members plugin
 */
export class MemoryAdapter {
  private storage: Record<string, ChatMember> = {};

  /**
   * Read a chat member from storage
   * @param key The storage key (usually in format "chatId:userId")
   * @returns The stored chat member, or undefined if not found
   */
  async read(key: string): Promise<ChatMember | undefined> {
    return this.storage[key];
  }

  /**
   * Write a chat member to storage
   * @param key The storage key (usually in format "chatId:userId")
   * @param value The chat member to store
   */
  async write(key: string, value: ChatMember): Promise<void> {
    this.storage[key] = value;
  }

  /**
   * Delete a chat member from storage
   * @param key The storage key (usually in format "chatId:userId")
   */
  async delete(key: string): Promise<void> {
    delete this.storage[key];
  }
}