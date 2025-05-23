import { Bot, GrammyError, HttpError } from 'grammy';
import { StateService } from './services/StateService.js';
import { registerCommandHandlers } from './handlers/index.js';
import { env } from './config/env.js';

// Create bot instance
export const bot = new Bot(env.BOT_TOKEN);

// Initialize state service (used instead of grammyjs sessions)
export const stateService = new StateService();

// Register command handlers
registerCommandHandlers(bot);

// Error handling
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  
  if (err instanceof GrammyError) {
    console.error('Error in request:', err.description);
  } else if (err instanceof HttpError) {
    console.error('Could not contact Telegram:', err);
  } else {
    console.error('Unknown error:', err);
  }
});