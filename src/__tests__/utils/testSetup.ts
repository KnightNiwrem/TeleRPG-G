import { migrateToLatest } from '../../database/migrateToLatest';
import { db } from '../../database/kysely';
import { Redis } from 'ioredis';

// Redis client for testing
let redisClient: Redis | null = null;

// Run migrations and setup test environment
export async function setupTestDatabase(): Promise<void> {
  try {
    // Run migrations to set up database schema
    await migrateToLatest(false, false);
    console.log('Database migrations completed successfully');
    
    // Initialize Redis client for tests
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || '',
    });
    
    // Verify Redis connection
    await redisClient.ping();
    console.log('Redis connection established successfully');
  } catch (error) {
    console.error('Error setting up test environment:', error);
    throw error;
  }
}

// Clean up after tests
export async function teardownTestEnvironment(): Promise<void> {
  try {
    // Clean up Redis
    if (redisClient) {
      await redisClient.flushall();
      await redisClient.quit();
    }
    
    // Clean up database
    await db.destroy();
  } catch (error) {
    console.error('Error tearing down test environment:', error);
    throw error;
  }
}

// Helper function to create test character
export async function createTestCharacter(userId: number, name: string, characterClass: string = 'warrior'): Promise<number> {
  const character = await db
    .insertInto('characters')
    .values({
      user_id: userId,
      name,
      class: characterClass,
      level: 1,
      exp: 0,
      max_hp: 100,
      current_hp: 100,
      max_sp: 50,
      current_sp: 50,
      strength: 10,
      intelligence: 10,
      dexterity: 10,
      constitution: 10,
      wisdom: 10,
      charisma: 10,
      gold: 100,
    })
    .returning('id')
    .executeTakeFirst();
  
  if (!character) {
    throw new Error('Failed to create test character');
  }
  
  return character.id;
}

// Helper function to clean up test character
export async function cleanupTestCharacter(characterId: number): Promise<void> {
  await db
    .deleteFrom('characters')
    .where('id', '=', characterId)
    .execute();
}

// Helper function for Redis operations
export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Did you call setupTestDatabase()?');
  }
  return redisClient;
}