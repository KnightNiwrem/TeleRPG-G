// Mock for the env module
export const validateEnv = () => ({
  DATABASE_URL: 'mock-db-url',
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  REDIS_PASSWORD: '',
  BOT_TOKEN: 'mock-bot-token',
  TELEGRAM_BOT_TOKEN: 'mock-token',
  NODE_ENV: 'test'
});

export const env = {
  DATABASE_URL: 'mock-db-url',
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  REDIS_PASSWORD: '',
  BOT_TOKEN: 'mock-bot-token',
  TELEGRAM_BOT_TOKEN: 'mock-token',
  NODE_ENV: 'test'
};