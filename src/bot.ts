import { Bot } from "grammy";

/**
 * Set up the Telegram bot with handlers and middleware
 * @param bot - Grammy Bot instance
 */
export function setupBot(bot: Bot): void {
  // Error handling middleware
  bot.catch((err) => {
    console.error("Error in bot handler:", err);
  });

  // Command handlers
  bot.command("start", async (ctx) => {
    await ctx.reply(
      `Hello, ${ctx.from?.first_name || "adventurer"}! Welcome to TeleRPG-G.`
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      "TeleRPG-G Help:\n" +
      "/start - Start the bot\n" +
      "/help - Show this help message"
    );
  });

  // Handle text messages
  bot.on("message:text", async (ctx) => {
    await ctx.reply("I received your message: " + ctx.message.text);
  });
}