// Mock implementation for ioredis
import { jest } from '@jest/globals';

// Create Redis mock class with all required methods
const mockRedisInstance = {
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue({}),
  disconnect: jest.fn().mockResolvedValue({}),
  quit: jest.fn().mockResolvedValue({}),
  flushall: jest.fn().mockResolvedValue({}),
  flushdb: jest.fn().mockResolvedValue({}),
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
  ttl: jest.fn().mockResolvedValue(0),
  ping: jest.fn().mockResolvedValue('PONG'),
};

export const Redis = jest.fn().mockImplementation(() => mockRedisInstance);

export default {
  Redis
};