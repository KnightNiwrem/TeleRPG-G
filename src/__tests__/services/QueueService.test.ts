import { jest } from '@jest/globals';
import '../mocks';
import { createMockDb } from '../utils/mockUtils.js';
import * as QueueService from '../../services/QueueService.js';
import { Queue, Worker } from 'bullmq';

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

// Mock modules
jest.mock('ioredis');
jest.mock('bullmq');

jest.mock('../../database/kysely.js', () => ({
  db: createMockDb()
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

    test('should add job to queue and return job ID', async () => {
      // Mock character found
      mockDb.executeTakeFirst.mockResolvedValueOnce({ id: 1 });
      
      const { startLongRest } = QueueService;
      
      const result = await startLongRest(123, 300);
      
      expect(result).toBe('test-job-id');
      expect(mockQueue.add).toHaveBeenCalledWith(
        'long_rest',
        {
          userId: 123,
          characterId: 1,
          duration: 300
        },
        {
          delay: 300000, // 300 seconds in milliseconds
          removeOnComplete: true,
          removeOnFail: false
        }
      );
    });

    test('should use default duration if not provided', async () => {
      // Mock character found
      mockDb.executeTakeFirst.mockResolvedValueOnce({ id: 1 });
      
      const { startLongRest } = QueueService;
      
      await startLongRest(123); // No duration provided
      
      expect(mockQueue.add).toHaveBeenCalledWith(
        'long_rest',
        {
          userId: 123,
          characterId: 1,
          duration: 300 // Default value
        },
        expect.any(Object)
      );
    });
  });

  describe('checkLongRestStatus', () => {
    test('should return inactive status if job not found', async () => {
      // Mock job not found
      mockQueue.getJob.mockResolvedValueOnce(null);
      
      const { checkLongRestStatus } = QueueService;
      
      const result = await checkLongRestStatus('non-existent-job');
      
      expect(result).toEqual({ isActive: false, timeRemaining: null });
      expect(mockQueue.getJob).toHaveBeenCalledWith('non-existent-job');
    });

    test('should return active status with remaining time for active job', async () => {
      // Mock job found and active
      mockJob.getState.mockResolvedValueOnce('active');
      
      // Manually set timestamp and delay for predictable test
      const now = Date.now();
      mockJob.timestamp = now - 5000; // Started 5 seconds ago
      mockJob.opts = { delay: 30000 }; // 30 seconds total duration
      
      // Mock Date.now for consistent results
      const realDateNow = Date.now;
      global.Date.now = jest.fn(() => now);
      
      const { checkLongRestStatus } = QueueService;
      
      const result = await checkLongRestStatus('test-job-id');
      
      // Restore Date.now
      global.Date.now = realDateNow;
      
      expect(result.isActive).toBe(true);
      expect(result.timeRemaining).toBe(25); // 30 seconds total - 5 seconds elapsed = 25 seconds remaining
    });

    test('should return active status with remaining time for delayed job', async () => {
      // Mock job found and delayed
      mockJob.getState.mockResolvedValueOnce('delayed');
      
      const { checkLongRestStatus } = QueueService;
      
      const result = await checkLongRestStatus('test-job-id');
      
      expect(result.isActive).toBe(true);
      expect(typeof result.timeRemaining).toBe('number');
    });

    test('should return inactive status for completed job', async () => {
      // Mock job found but completed
      mockJob.getState.mockResolvedValueOnce('completed');
      
      const { checkLongRestStatus } = QueueService;
      
      const result = await checkLongRestStatus('test-job-id');
      
      expect(result).toEqual({ isActive: false, timeRemaining: null });
    });
  });

  describe('worker', () => {
    test('worker should be initialized with proper queue name and connection', () => {
      expect(Worker).toHaveBeenCalledWith(
        'test_queue',
        expect.any(Function),
        { connection: expect.any(Object) }
      );
    });

    test('worker should attach event handlers', () => {
      expect(mockWorker.on).toHaveBeenCalledWith('completed', expect.any(Function));
      expect(mockWorker.on).toHaveBeenCalledWith('failed', expect.any(Function));
    });
  });
});
