import { Bot, type Context } from "grammy";
import { type ChatMembersFlavor } from "@grammyjs/chat-members";
import { type ConversationFlavor } from "@grammyjs/conversations";
import { config } from "./config.js";
import { setupBot } from "./bot.js";
import { connectDatabase } from "./database.js";
import { migrateToLatest } from "./migrations/migrator.js";

// Define the bot context type including the chat members and conversations flavors
type BotContext = Context & ChatMembersFlavor & ConversationFlavor<Context>;

// Main entry point
async function main(): Promise<void> {
  console.log("Starting TeleRPG-G bot...");
  
  // Connect to the database first
  try {
    await connectDatabase();
    
    // Run migrations to set up the database schema
    await migrateToLatest();
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
  
  // Create a bot instance with the extended context type
  const bot = new Bot<BotContext>(config.botToken);
  
  // Setup bot handlers and middleware
  await setupBot(bot);
  
  // Start the bot
  await bot.start({
    onStart: (botInfo) => {
      console.log(`Bot @${botInfo.username} started successfully!`);
    },
  });
}

// Run the main function
main().catch((error) => {
  console.error("Fatal error occurred:", error);
  process.exit(1);
});