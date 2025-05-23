// Create a mock directory for mocking modules
jest.mock('../../config/env', () => ({
  validateEnv: jest.fn().mockReturnValue({
    DATABASE_URL: 'mock-db-url',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
    REDIS_PASSWORD: '',
    TELEGRAM_BOT_TOKEN: 'mock-token',
    NODE_ENV: 'test'
  }),
  env: {
    DATABASE_URL: 'mock-db-url',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
    REDIS_PASSWORD: '',
    TELEGRAM_BOT_TOKEN: 'mock-token',
    NODE_ENV: 'test'
  }
}));

// Mock the database
jest.mock('../../database/kysely', () => ({
  db: {
    selectFrom: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    updateTable: jest.fn().mockReturnThis(),
    insertInto: jest.fn().mockReturnThis(),
    deleteFrom: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    whereIn: jest.fn().mockReturnThis(),
    whereRef: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([]),
    executeTakeFirst: jest.fn().mockResolvedValue(null),
    executeTakeFirstOrThrow: jest.fn().mockImplementation(() => {
      throw new Error('No record found');
    }),
  }
}));