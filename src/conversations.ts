import { Composer } from "grammy";
import type { Context } from "grammy";
import type { ChatMembersFlavor } from "@grammyjs/chat-members";
import { createPlayer } from "./player.js";

// Define the bot context type including the chat members flavor
type BotContext = Context & ChatMembersFlavor;

// Define conversation states
type RegistrationState = {
  step: "name";
} | {
  step: "confirm";
  name: string;
};

// Store for active registration conversations
const activeRegistrations = new Map<number, RegistrationState>();

/**
 * Create a composer for handling player registration
 * @returns Registration conversation composer
 */
export function createRegistrationConversation(): Composer<BotContext> {
  const composer = new Composer<BotContext>();
  
  // Start registration process
  composer.command("register", async (ctx) => {
    if (!ctx.from) {
      await ctx.reply("Could not identify your user details.");
      return;
    }
    
    // Start the registration process by asking for name
    activeRegistrations.set(ctx.from.id, { step: "name" });
    
    await ctx.reply(
      "Welcome to TeleRPG-G! Let's create your player.\n" +
      "First, what name would you like to use in the game?"
    );
  });
  
  // Handle responses in the registration process
  composer.on("message:text", async (ctx) => {
    if (!ctx.from || !ctx.chat) {
      return;
    }
    
    const state = activeRegistrations.get(ctx.from.id);
    
    // If not in registration mode, pass to next middleware
    if (!state) {
      return;
    }
    
    if (state.step === "name") {
      const name = ctx.message.text.trim();
      
      if (name.length < 3 || name.length > 20) {
        await ctx.reply("Your name must be between 3 and 20 characters. Please try again.");
        return;
      }
      
      // Update state with name and ask for confirmation
      activeRegistrations.set(ctx.from.id, {
        step: "confirm",
        name
      });
      
      await ctx.reply(
        `Your player name will be "${name}". Is that correct?\n` +
        "Reply with 'yes' to confirm or 'no' to choose a different name."
      );
      
    } else if (state.step === "confirm") {
      const response = ctx.message.text.toLowerCase();
      
      if (response === "yes" || response === "y") {
        try {
          // Create the player
          const player = await createPlayer({
            name: state.name,
            telegramUserId: ctx.from.id.toString(),
            telegramChatId: ctx.chat.id.toString()
          });
          
          // Registration complete, remove state
          activeRegistrations.delete(ctx.from.id);
          
          await ctx.reply(
            `Welcome, ${player.name}! Your player has been created successfully.\n` +
            "You can now start your adventure in TeleRPG-G!"
          );
        } catch (error) {
          console.error("Error creating player:", error);
          await ctx.reply("There was an error creating your player. Please try again later.");
        }
      } else if (response === "no" || response === "n") {
        // Go back to name step
        activeRegistrations.set(ctx.from.id, { step: "name" });
        await ctx.reply("No problem! Please enter a different name:");
      } else {
        await ctx.reply("Please reply with 'yes' or 'no'.");
      }
    }
  });
  
  return composer;
}