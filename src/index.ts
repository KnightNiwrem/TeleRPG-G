import { Bot } from "grammy";
import { config } from "./config.js";
import { setupBot } from "./bot.js";
import { connectDatabase } from "./database.js";

// Main entry point
async function main(): Promise<void> {
  console.log("Starting TeleRPG-G bot...");
  
  // Connect to the database first
  try {
    await connectDatabase();
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
  
  // Create a bot instance
  const bot = new Bot(config.botToken);
  
  // Setup bot handlers and middleware
  setupBot(bot);
  
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