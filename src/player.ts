import { db } from "./database.js";

// Player service interface
export interface Player {
  id: number;
  name: string;
  telegramUserId: string;
  telegramChatId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Player creation interface
export interface CreatePlayerData {
  name: string;
  telegramUserId: string;
  telegramChatId: string;
}

/**
 * Get a player by Telegram user ID
 * @param telegramUserId - Telegram user ID
 * @returns Player or undefined if not found
 */
export async function getPlayerByTelegramId(telegramUserId: string): Promise<Player | undefined> {
  const result = await db
    .selectFrom("players")
    .selectAll()
    .where("telegram_user_id", "=", telegramUserId)
    .executeTakeFirst();
  
  if (!result) {
    return undefined;
  }
  
  // Convert from DB schema to service interface
  return {
    id: result.id,
    name: result.name,
    telegramUserId: result.telegram_user_id,
    telegramChatId: result.telegram_chat_id,
    createdAt: result.created_at,
    updatedAt: result.updated_at
  };
}

/**
 * Create a new player
 * @param data - Player creation data
 * @returns Created player
 */
export async function createPlayer(data: CreatePlayerData): Promise<Player> {
  const result = await db
    .insertInto("players")
    .values({
      name: data.name,
      telegram_user_id: data.telegramUserId,
      telegram_chat_id: data.telegramChatId
    })
    .returning(["id", "name", "telegram_user_id", "telegram_chat_id", "created_at", "updated_at"])
    .executeTakeFirstOrThrow();
  
  // Convert from DB schema to service interface
  return {
    id: result.id,
    name: result.name,
    telegramUserId: result.telegram_user_id,
    telegramChatId: result.telegram_chat_id,
    createdAt: result.created_at,
    updatedAt: result.updated_at
  };
}