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

// Disable mock modules
jest.dontMock('ioredis');
jest.dontMock('../src/database/kysely.js');