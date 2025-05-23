import { jest } from '@jest/globals';

const Redis = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue({}),
  disconnect: jest.fn().mockResolvedValue({}),
  quit: jest.fn().mockResolvedValue({}),
}));

export default Redis;