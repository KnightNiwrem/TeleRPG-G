import { Composer } from "grammy";
import { conversations, createConversation, type Conversation } from "@grammyjs/conversations";
import { createPlayer } from "./player.js";
import { type BotContext } from "./index.js";

/**
 * Player registration conversation
 */
async function registrationConversation(conversation: Conversation<BotContext, BotContext>, ctx: BotContext) {
  // Check if we have user information
  if (!ctx.from || !ctx.chat) {
    await ctx.reply("Could not identify your user details.");
    return;
  }

  // Welcome message
  await ctx.reply(
    "Welcome to TeleRPG-G! Let's create your player.\n" +
    "First, what name would you like to use in the game?"
  );

  // Get player name with validation
  let isValidName = false;
  let name = "";
  
  while (!isValidName) {
    // Wait for the user's name input
    const nameCtx = await conversation.wait();
    
    if (!nameCtx.message?.text) continue;
    name = nameCtx.message.text.trim();
    
    if (name.length < 3 || name.length > 20) {
      await nameCtx.reply("Your name must be between 3 and 20 characters. Please try again.");
    } else {
      isValidName = true;
    }
  }

  // Ask for confirmation
  await ctx.reply(
    `Your player name will be "${name}". Is that correct?\n` +
    "Reply with 'yes' to confirm or 'no' to choose a different name."
  );

  // Process confirmation
  let confirmed = false;
  while (!confirmed) {
    // Wait for yes/no response
    const confirmCtx = await conversation.wait();
    
    if (!confirmCtx.message?.text) continue;
    const response = confirmCtx.message.text.toLowerCase();
    
    if (response === "yes" || response === "y") {
      try {
        // Create the player
        const player = await createPlayer({
          name: name,
          telegramUserId: ctx.from.id.toString(),
          telegramChatId: ctx.chat.id.toString()
        });
        
        await ctx.reply(
          `Welcome, ${player.name}! Your player has been created successfully.\n` +
          "You can now start your adventure in TeleRPG-G!"
        );
        confirmed = true;
      } catch (error) {
        console.error("Error creating player:", error);
        await ctx.reply("There was an error creating your player. Please try again later.");
        return;
      }
    } else if (response === "no" || response === "n") {
      await ctx.reply("No problem! Let's choose a different name. What name would you like to use?");
      
      // Go back to asking for a name
      isValidName = false;
      while (!isValidName) {
        const nameCtx = await conversation.wait();
        
        if (!nameCtx.message?.text) continue;
        name = nameCtx.message.text.trim();
        
        if (name.length < 3 || name.length > 20) {
          await nameCtx.reply("Your name must be between 3 and 20 characters. Please try again.");
        } else {
          isValidName = true;
        }
      }
      
      // Ask for confirmation again
      await ctx.reply(
        `Your player name will be "${name}". Is that correct?\n` +
        "Reply with 'yes' to confirm or 'no' to choose a different name."
      );
    } else {
      await confirmCtx.reply("Please reply with 'yes' or 'no'.");
    }
  }
}

/**
 * Create a composer for handling player registration
 * @returns Registration conversation composer
 */
export function createRegistrationConversation(): Composer<BotContext> {
  const composer = new Composer<BotContext>();
  
  // Add the conversations plugin
  composer.use(conversations());
  
  // Add the registration conversation
  composer.use(createConversation(registrationConversation));
  
  // Start registration process
  composer.command("register", async (ctx) => {
    if (!ctx.from) {
      await ctx.reply("Could not identify your user details.");
      return;
    }
    
    // Start the registration conversation
    await ctx.conversation.enter("registrationConversation");
  });
  
  return composer;
}