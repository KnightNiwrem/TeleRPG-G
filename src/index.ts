import 'dotenv/config';
import './config/env'; // Import and validate environment variables
import { bot } from './bot.js';
import { db } from './database/kysely.js';

// Check database version and connection
async function checkDatabaseConnection() {
  try {
    // Simply use a direct query without typing complexities
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const result = await pool.query('SELECT version()');
    console.log(`Connected to PostgreSQL: ${result.rows[0]?.version || 'Unknown version'}`);
    
    await pool.end();
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
  try {
    await bot.start({
      onStart: (botInfo) => {
        console.log(`Bot @${botInfo.username} is running!`);
      },
    });
  } catch (error) {
    console.error('Failed to initiate bot startup:', error);
    throw error;
  }
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
try {
  await start();
} catch (error) {
  console.error('Application startup error:', error);
  process.exit(1);
}
