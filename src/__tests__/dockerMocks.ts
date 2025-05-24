// ESM Module Mocking Setup for Docker testing
// This file only mocks the services that need to be mocked for unit tests
// but does NOT mock Redis and Postgres as they are available in Docker environment

import { jest } from '@jest/globals';

// Ensure mocks are properly closed after tests
afterAll(async () => {
  // Reset all mocks to avoid lingering connections
  jest.restoreAllMocks();
});

// Mock only the services, not the database or Redis
jest.mock('../../config/env.js');
jest.mock('../../services/CharacterService.js');
jest.mock('../../services/AreaService.js');
jest.mock('../../services/QuestService.js');
jest.mock('../../services/QueueService.js');

// Note: We explicitly DON'T mock database or Redis
// jest.mock('../../database/kysely.js'); - Not mocked for Docker tests
// jest.mock('ioredis'); - Not mocked for Docker tests
jest.mock('bullmq');