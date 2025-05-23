import { Bot, GrammyError, HttpError } from 'grammy';
import { StateService } from './services/StateService.js';
import { registerCommandHandlers } from './handlers/index.js';
import { env } from './config/env.js';

// Create bot instance
export const bot = new Bot(env.BOT_TOKEN);

// Initialize state service (used instead of grammyjs sessions)
export const stateService = new StateService();

// Error handling using Grammy's error boundary
const protectedBot = bot.errorBoundary((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  
  if (err.error instanceof GrammyError) {
    console.error('Error in request:', err.error.description);
  } else if (err.error instanceof HttpError) {
    console.error('Could not contact Telegram:', err.error);
  } else {
    console.error('Unknown error:', err.error);
  }
});

// Register command handlers
registerCommandHandlers(protectedBot);
