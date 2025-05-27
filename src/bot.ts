import { Bot, BotError, type Context, ApiClientOptions, hydrateApi } from "grammy";
import { ChatMemberUpdated } from "@grammyjs/types";
import { ChatMembers } from "grammy-chat-members";
import { PostgresAdapter } from "@grammyjs/storage-postgres";
import { config } from "./config.js";

/**
 * Create an error handler middleware that works with both long polling and webhooks
 */
export function errorHandler(error: BotError<Context>): void {
  console.error("Error in bot handler:", error);
}

/**
 * Set up the Telegram bot with handlers and middleware
 * @param bot - Grammy Bot instance
 */
export function setupBot(bot: Bot): void {
  // Configure the chat members plugin with PostgreSQL storage
  const storage = new PostgresAdapter({
    pool: {
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
    },
    tableName: "chat_members",
  });

  // Create chat members plugin using PostgreSQL storage
  const chatMembers = new ChatMembers({
    storage,
    // Allow all update types using hydrateApi
    allowedUpdates: hydrateApi(new ApiClientOptions()).allowed_updates,
  });

  // Register chat members plugin middleware
  bot.use(chatMembers.middleware());

  // Handle chat member updates
  bot.on("chat_member", async (ctx) => {
    const update = ctx.chatMember as ChatMemberUpdated;
    console.log(`Chat member update in chat ${update.chat.id}:`, 
      `${update.from.first_name} (${update.from.id}) - `,
      `old status: ${update.old_chat_member.status}, `,
      `new status: ${update.new_chat_member.status}`);
  });

  // Create error boundary
  const errorBoundary = bot.errorBoundary(errorHandler);
  
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
      "/members - Show current chat members count"
    );
  });

  // Add a new command to demonstrate chat members feature
  errorBoundary.command("members", async (ctx) => {
    if (!ctx.chat) {
      await ctx.reply("This command must be used in a chat group.");
      return;
    }
    
    try {
      // Get all members in the current chat
      const members = await chatMembers.getMembers(ctx.chat.id.toString());
      const count = Object.keys(members).length;
      
      await ctx.reply(`This chat has ${count} tracked members.`);
    } catch (error) {
      console.error("Error retrieving chat members:", error);
      await ctx.reply("Error retrieving chat members information.");
    }
  });

  // Handle text messages - inside the error boundary
  errorBoundary.on("message:text", async (ctx) => {
    await ctx.reply("I received your message: " + ctx.message.text);
  });
}