// CommonJS compatibility mock for ioredis
// This helps with Jest's require statements

module.exports = {
  Redis: function() {
    return {
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue({}),
      disconnect: jest.fn().mockResolvedValue({}),
      quit: jest.fn().mockResolvedValue({}),
      flushall: jest.fn().mockResolvedValue({}),
      flushdb: jest.fn().mockResolvedValue({}),
      ping: jest.fn().mockResolvedValue('PONG'),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      exists: jest.fn().mockResolvedValue(0),
      ttl: jest.fn().mockResolvedValue(0)
    };
  }
};