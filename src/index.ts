import 'dotenv/config';
import './config/env'; // Import and validate environment variables
import { bot } from './bot.js';
import { db } from './database/kysely.js';
import { sql } from 'kysely';

// Check database version and connection
async function checkDatabaseConnection() {
  try {
    const result = await db.executeQuery(
      db.selectFrom('information_schema.tables')
        .select(sql`version() as version`)
        .limit(1)
        .compile()
    );
    console.log(`Connected to PostgreSQL: ${result.rows[0]?.version || 'Unknown version'}`);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Start the application
async function start() {
  // Check database connection
  await checkDatabaseConnection();

  // Start the bot
  console.log('Starting bot...');
  bot.start({
    onStart: () => {
      console.log(`Bot @${bot.botInfo.username} is running!`);
    },
  });
}

// Handle shutdown gracefully
const shutdown = async () => {
  console.log('Shutting down...');
  await bot.stop();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Run the application
start().catch(error => {
  console.error('Application startup error:', error);
  process.exit(1);
});