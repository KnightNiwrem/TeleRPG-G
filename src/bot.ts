import { Bot, BotError, type Context } from "grammy";
import { type ChatMemberUpdated } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";
import { createStorageAdapter } from "./storage.js";

// Define the bot context type including the chat members flavor
type BotContext = Context & ChatMembersFlavor;

/**
 * Create an error handler middleware that works with both long polling and webhooks
 */
export function errorHandler(error: BotError<BotContext>): void {
  console.error("Error in bot handler:", error);
}

/**
 * Set up the Telegram bot with handlers and middleware
 * @param bot - Grammy Bot instance
 */
export async function setupBot(bot: Bot<BotContext>): Promise<void> {
  // Create PostgreSQL adapter for chat members
  const psqlAdapter = await createStorageAdapter();
  
  // Create chat members plugin
  const membersPlugin = chatMembers(psqlAdapter);
  
  // Create a private chat only composer
  const privateChat = bot.chatType("private");

  // Handle chat member updates (when users join/leave groups) inside private chat composer
  privateChat.on("chat_member", async (ctx) => {
    const update = ctx.chatMember as ChatMemberUpdated;
    console.log(`Chat member update in chat ${update.chat.id}:`, 
      `${update.from.first_name} (${update.from.id}) - `,
      `old status: ${update.old_chat_member.status}, `,
      `new status: ${update.new_chat_member.status}`);
  });

  // Create error boundary inside private chat composer
  const errorBoundary = privateChat.errorBoundary(errorHandler);
  
  // Register chat members plugin middleware inside error boundary
  errorBoundary.use(membersPlugin);
  
  // Command handlers - registered inside the error boundary
  errorBoundary.command("start", async (ctx) => {
    await ctx.reply(
      `Hello, ${ctx.from?.first_name || "adventurer"}! Welcome to TeleRPG-G.`
    );
  });

  errorBoundary.command("help", async (ctx) => {
    await ctx.reply(
      "TeleRPG-G Help:\n" +
      "/start - Start the bot\n" +
      "/help - Show this help message\n" +
      "/members - Show your member status"
    );
  });

  // Add a new command to demonstrate chat members feature
  errorBoundary.command("members", async (ctx) => {
    if (!ctx.chat) {
      await ctx.reply("Chat information not available.");
      return;
    }
    
    try {
      // Get chat member information about the current user
      const chatId = ctx.chat.id;
      const userId = ctx.from?.id;
      
      if (!userId) {
        await ctx.reply("Could not identify your user ID.");
        return;
      }
      
      // Get chat member information using the chatMembers plugin
      const member = await ctx.chatMembers.getChatMember(chatId, userId);
      
      await ctx.reply(
        `Your status in this chat is: ${member.status}\n` +
        `Member tracking is working correctly.`
      );
    } catch (error) {
      console.error("Error retrieving chat members:", error);
      await ctx.reply("Error retrieving chat member information.");
    }
  });

  // Handle text messages - inside the error boundary
  errorBoundary.on("message:text", async (ctx) => {
    await ctx.reply("I received your message: " + ctx.message.text);
  });
}