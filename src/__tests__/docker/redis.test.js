// ES5 compatible version of redis.test.ts
const { describe, expect, test, afterEach, beforeAll } = require('@jest/globals');
const testSetupModule = require('../utils/testSetup.js');

describe('Redis Integration Tests', () => {
  // Initialize Redis client before tests
  beforeAll(async () => {
    await testSetupModule.setupTestDatabase();
  });

  // Clean up after each test
  afterEach(async () => {
    await testSetupModule.getRedisClient().flushdb();
  });

  test('should set and retrieve values from Redis', async () => {
    const redis = testSetupModule.getRedisClient();
    
    // Set a value
    await redis.set('test:key', 'test-value');
    
    // Retrieve the value
    const value = await redis.get('test:key');
    
    // Verify the value
    expect(value).toBe('test-value');
  });

  test('should delete values from Redis', async () => {
    const redis = testSetupModule.getRedisClient();
    
    // Set a value
    await redis.set('test:delete', 'delete-me');
    
    // Verify the value exists
    const beforeDelete = await redis.exists('test:delete');
    expect(beforeDelete).toBe(1);
    
    // Delete the value
    await redis.del('test:delete');
    
    // Verify the value is gone
    const afterDelete = await redis.exists('test:delete');
    expect(afterDelete).toBe(0);
  });

  test('should set values with expiration', async () => {
    const redis = testSetupModule.getRedisClient();
    
    // Set a value with an expiration of 1 second
    await redis.set('test:expire', 'expiring-value', 'EX', 1);
    
    // Check the TTL (Time To Live)
    const ttl = await redis.ttl('test:expire');
    expect(ttl).toBeGreaterThanOrEqual(0);
    expect(ttl).toBeLessThanOrEqual(1);
    
    // Wait for the key to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Verify the key is gone
    const exists = await redis.exists('test:expire');
    expect(exists).toBe(0);
  });
});