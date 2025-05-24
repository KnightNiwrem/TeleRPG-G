# Docker Integration Tests

This directory contains tests that run against real Redis and PostgreSQL services using Docker.

## Running Docker Tests

To run the Docker tests:

```bash
# Start the test containers
npm run test:docker:up

# In a different terminal, run the tests
npm run test:docker

# When finished, stop the containers
npm run test:docker:down
```

## Test Database and Redis

The Docker tests connect to actual PostgreSQL and Redis instances as defined in `docker-compose.test.yml`.

- PostgreSQL runs on port 5433 (mapped from container's port 5432)
- Redis runs on port 6380 (mapped from container's port 6379)

## Test Isolation

Tests are designed to clean up after themselves to maintain proper test isolation. Each test:

1. Creates its own test data
2. Runs assertions against that data
3. Cleans up the data after completion

For Redis, `flushdb()` is called after each test to clear Redis data. For PostgreSQL, test-specific data is 
removed using SQL deletions after tests complete.

## Test Setup

- The Docker test environment is configured in `jest.setup.docker.mjs`
- Test utilities are in `src/__tests__/utils/dockerTestSetup.js`
- Data cleanup utilities are in `src/__tests__/utils/dockerTestCleanup.js`

## Writing New Docker Tests

When writing new Docker tests:

1. Import from `../utils/dockerTestSetup.js` instead of `../utils/testSetup.js`
2. Use the real database connection from `../../database/kysely.js`
3. Use the real Redis connection from `getRedisClient()`
4. Clean up any data you create to maintain test isolation
5. Consider using the `cleanupTestData()` helper from `dockerTestCleanup.js`

Example:

```typescript
import { describe, test, beforeAll, afterAll } from '@jest/globals';
import { db } from '../../database/kysely.js';
import { 
  getRedisClient, 
  setupTestDatabase, 
  createTestCharacter, 
  cleanupTestCharacter 
} from '../utils/dockerTestSetup.js';

describe('My Docker Test', () => {
  let testCharacterId;

  beforeAll(async () => {
    await setupTestDatabase();
    testCharacterId = await createTestCharacter(12345, 'TestHero');
  });

  afterAll(async () => {
    await cleanupTestCharacter(testCharacterId);
  });

  test('should work with real Redis and Postgres', async () => {
    const redis = getRedisClient();
    await redis.set('my:test:key', 'test-value');
    
    // Test your functionality...
  });
});