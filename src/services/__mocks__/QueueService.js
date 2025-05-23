import { jest } from '@jest/globals';

// Mock QueueService
export const QueueService = jest.fn().mockImplementation(() => ({
  addToQueue: jest.fn().mockResolvedValue({}),
  scheduleTask: jest.fn().mockResolvedValue({}),
  processQueue: jest.fn(),
}));