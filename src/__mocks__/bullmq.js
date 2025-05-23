import { jest } from '@jest/globals';

// Mock objects for BullMQ
const mockJob = {
  id: 'test-job-id',
  timestamp: Date.now(),
  opts: { delay: 10000 },
  getState: jest.fn().mockResolvedValue('completed'),
  remove: jest.fn().mockResolvedValue({}),
};

const mockQueue = {
  add: jest.fn().mockResolvedValue(mockJob),
  getJob: jest.fn().mockResolvedValue(mockJob),
  close: jest.fn().mockResolvedValue({}),
};

const mockWorker = {
  on: jest.fn(),
  close: jest.fn().mockResolvedValue({}),
};

// Export mock classes
export const Queue = jest.fn(() => mockQueue);
export const Worker = jest.fn(() => mockWorker);
export const Job = jest.fn(() => mockJob);
export const FlowProducer = jest.fn(() => ({}));