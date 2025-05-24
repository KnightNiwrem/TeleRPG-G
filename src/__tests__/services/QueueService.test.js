// ES5 compatible version of QueueService.test.ts
const { jest, describe, expect, test, beforeEach } = require('@jest/globals');
const { createMockDb } = require('../utils/mockUtils.js');
const QueueService = require('../../services/QueueService.js');

// Create mock objects for bullmq
const mockJob = {
  id: 'test-job-id',
  timestamp: Date.now(),
  opts: { delay: 10000 },
  getState: jest.fn(),
};

const mockQueue = {
  add: jest.fn().mockResolvedValue(mockJob),
  getJob: jest.fn().mockResolvedValue(mockJob),
};

const mockWorker = {
  on: jest.fn(),
};

// Mock modules inline
jest.mock('../../database/kysely.js', () => ({
  db: createMockDb()
}));

// Mock ioredis explicitly
jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue({}),
      disconnect: jest.fn().mockResolvedValue({}),
      quit: jest.fn().mockResolvedValue({}),
      flushall: jest.fn().mockResolvedValue({}),
      flushdb: jest.fn().mockResolvedValue({}),
      ping: jest.fn().mockResolvedValue('PONG')
    }))
  };
});

jest.mock('bullmq', () => ({
  Queue: jest.fn(() => mockQueue),
  Worker: jest.fn(() => mockWorker)
}));

// Mock env
jest.mock('../../config/env', () => ({
  env: {
    DATABASE_URL: 'mock-db-url',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
    REDIS_PASSWORD: '',
    QUEUE_NAME: 'test_queue',
    BOT_TOKEN: 'mock-bot-token',
    TELEGRAM_BOT_TOKEN: 'mock-token',
    NODE_ENV: 'test'
  },
  validateEnv: jest.fn()
}));

describe('QueueService', () => {
  let mockDb;
  
  // Reset modules before each test to get fresh mocks
  beforeEach(() => {
    jest.resetModules();
    mockDb = createMockDb();
    mockJob.getState.mockReset();
    mockQueue.add.mockClear();
    mockQueue.getJob.mockClear();
    mockWorker.on.mockClear();
  });

  describe('startLongRest', () => {
    test('should throw error if character not found', async () => {
      // Mock character not found
      mockDb.executeTakeFirst.mockResolvedValueOnce(null);
      
      const { startLongRest } = QueueService;
      
      await expect(startLongRest(123, 300)).rejects.toThrow('Character not found');
      expect(mockDb.selectFrom).toHaveBeenCalledWith('characters');
      expect(mockDb.select).toHaveBeenCalledWith('id');
      expect(mockDb.where).toHaveBeenCalledWith('user_id', '=', 123);
    });
  });

  describe('worker', () => {
    test('worker should attach event handlers', () => {
      expect(mockWorker.on).toHaveBeenCalledWith('completed', expect.any(Function));
      expect(mockWorker.on).toHaveBeenCalledWith('failed', expect.any(Function));
    });
  });
});