import { jest } from '@jest/globals';

export const Redis = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue({}),
  disconnect: jest.fn().mockResolvedValue({}),
  quit: jest.fn().mockResolvedValue({}),
  flushall: jest.fn().mockResolvedValue({}),
  ping: jest.fn().mockResolvedValue('PONG'),
}));