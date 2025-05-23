import 'dotenv/config';
import { bot } from './bot';
import { db } from './database/kysely';

// Log any database connection issues
db.introspection.getTables().catch(error => {
  console.error('Database connection error:', error);
  process.exit(1);
});

// Start the bot
console.log('Starting bot...');
bot.start({
  onStart: () => {
    console.log(`Bot @${bot.botInfo.username} is running!`);
  },
});

// Handle shutdown gracefully
const shutdown = async () => {
  console.log('Shutting down...');
  await bot.stop();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);