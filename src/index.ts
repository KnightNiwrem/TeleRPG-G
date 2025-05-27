import { Bot, type Context } from "grammy";
import { type ChatMembersFlavor } from "@grammyjs/chat-members";
import { config } from "./config.js";
import { setupBot } from "./bot.js";

// Define the bot context type including the chat members flavor
type BotContext = Context & ChatMembersFlavor;

// Main entry point
async function main(): Promise<void> {
  console.log("Starting TeleRPG-G bot...");
  
  // Create a bot instance with the extended context type
  const bot = new Bot<BotContext>(config.botToken);
  
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