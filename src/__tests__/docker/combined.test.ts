import { describe, expect, test, beforeAll, afterEach, afterAll } from '@jest/globals';
import { db } from '../../database/kysely.js';
import { 
  getRedisClient, 
  setupTestDatabase, 
  createTestCharacter, 
  cleanupTestCharacter 
} from '../utils/dockerTestSetup.js';

// Test character IDs will be stored here for cleanup
let testCharacterId: number;

describe('Combined Redis and Database Integration Tests', () => {
  // Setup before all tests
  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create a test character
    testCharacterId = await createTestCharacter(
      54321, // user ID
      'CombinedTestHero',
      'mage'
    );
  });

  // Clean up after each test
  afterEach(async () => {
    // Flush Redis data
    await getRedisClient().flushdb();
  });

  // Clean up after all tests
  afterAll(async () => {
    // Clean up database data
    await cleanupTestCharacter(testCharacterId);
  });

  test('should store character data in Redis based on database query', async () => {
    const redis = getRedisClient();
    
    // Query the character from the database
    const character = await db
      .selectFrom('characters')
      .selectAll()
      .where('id', '=', testCharacterId)
      .executeTakeFirst();
    
    // Store character data in Redis
    await redis.set(`character:${testCharacterId}`, JSON.stringify(character));
    
    // Retrieve the value from Redis
    const cachedCharacterJson = await redis.get(`character:${testCharacterId}`);
    const cachedCharacter = JSON.parse(cachedCharacterJson || '{}');
    
    // Verify the data matches
    expect(cachedCharacter).toEqual(character);
    expect(cachedCharacter.name).toBe('CombinedTestHero');
    expect(cachedCharacter.class).toBe('mage');
  });

  test('should update character data in both database and Redis', async () => {
    const redis = getRedisClient();
    
    // Update the character in database
    await db
      .updateTable('characters')
      .set({ level: 3, gold: 500 })
      .where('id', '=', testCharacterId)
      .execute();
    
    // Query the updated character
    const updatedCharacter = await db
      .selectFrom('characters')
      .selectAll()
      .where('id', '=', testCharacterId)
      .executeTakeFirst();
    
    // Update Redis cache
    await redis.set(`character:${testCharacterId}`, JSON.stringify(updatedCharacter));
    
    // Verify Redis cache
    const cachedCharacterJson = await redis.get(`character:${testCharacterId}`);
    const cachedCharacter = JSON.parse(cachedCharacterJson || '{}');
    
    // Verify the data
    expect(cachedCharacter.level).toBe(3);
    expect(cachedCharacter.gold).toBe(500);
    
    // Verify TTL can be set on keys
    await redis.expire(`character:${testCharacterId}`, 30);
    const ttl = await redis.ttl(`character:${testCharacterId}`);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(30);
  });
});