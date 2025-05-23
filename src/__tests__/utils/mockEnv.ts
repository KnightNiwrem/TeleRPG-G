// Mock for the env module
export const validateEnv = jest.fn().mockReturnValue({
  DATABASE_URL: 'mock-db-url',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  REDIS_PASSWORD: '',
  TELEGRAM_BOT_TOKEN: 'mock-token',
  NODE_ENV: 'test'
});