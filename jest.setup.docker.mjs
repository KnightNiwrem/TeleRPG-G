// Setup for Jest tests using Docker services
process.env.BOT_TOKEN = 'test-bot-token';
process.env.NODE_ENV = 'test';

// These values will be overridden by docker-compose.test.yml
// when running with 'npm run test:docker'
if (!process.env.DB_HOST) {
  process.env.DB_HOST = 'postgres-test';
  process.env.DB_PORT = '5432';
  process.env.DB_USER = 'postgres';
  process.env.DB_PASSWORD = 'postgres';
  process.env.DB_NAME = 'telerpg_test';
}

if (!process.env.REDIS_HOST) {
  process.env.REDIS_HOST = 'redis-test';
  process.env.REDIS_PORT = '6379';
  process.env.REDIS_PASSWORD = '';
}

// In ESM mode, jest is not available as a global. We need to import it.
try {
  const { jest } = await import('@jest/globals');
  
  // Explicitly unmock Redis and database modules for Docker testing
  jest.dontMock('ioredis');
  jest.dontMock('../../database/kysely.js');
  
  console.log('Jest setup complete for Docker environment - using real Redis and Postgres');
} catch (error) {
  console.error('Error setting up Jest environment:', error);
}