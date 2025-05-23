// Mock the env module
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

// QuestService.basic.test.ts
import { QuestService } from '../../services/QuestService.js';

// Test the core methods directly without using DB
describe('QuestService basic functionality', () => {
  let questService: QuestService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      selectFrom: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      executeTakeFirst: jest.fn(),
      execute: jest.fn()
    };
    questService = new QuestService(mockDb);
  });

  test('acceptQuest returns false if character not found', async () => {
    mockDb.executeTakeFirst.mockResolvedValueOnce(null);

    const result = await questService.acceptQuest(123, 1);
    
    expect(result).toBe(false);
  });

  test('updateQuestProgress returns zero progress if character not found', async () => {
    mockDb.executeTakeFirst.mockResolvedValueOnce(null);

    const result = await questService.updateQuestProgress(123, 1, 1);
    
    expect(result).toEqual({ currentProgress: 0, isCompleted: false });
  });
});