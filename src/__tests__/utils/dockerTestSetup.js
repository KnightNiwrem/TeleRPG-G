// Docker-specific test setup for using real Redis and Postgres instances
import { migrateToLatest } from '../../database/migrateToLatest';
import { db } from '../../database/kysely';
import { Redis } from 'ioredis';

// Redis client for testing
let redisClient = null;

// Run migrations and setup test environment with real connections
export async function setupTestDatabase() {
  try {
    // Run migrations to set up database schema
    await migrateToLatest(false, false);
    console.log('Database migrations completed successfully for Docker testing');
    
    // Initialize Redis client for tests with real connection
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || '',
    });
    
    // Verify Redis connection
    await redisClient.ping();
    console.log('Redis connection established successfully for Docker testing');
    
    // Flush Redis to ensure clean test data
    await redisClient.flushdb();
  } catch (error) {
    console.error('Error setting up Docker test environment:', error);
    throw error;
  }
}

// Clean up after tests
export async function teardownTestEnvironment() {
  try {
    // Clean up Redis
    if (redisClient) {
      await redisClient.flushdb();
      await redisClient.quit();
      redisClient = null;
    }
    
    // Clean up database - ensure we close the connection properly
    await db.destroy();
    console.log('Database connection closed for Docker testing');
  } catch (error) {
    console.error('Error tearing down Docker test environment:', error);
    throw error;
  }
}

// Helper function to create test character
export async function createTestCharacter(userId, name, characterClass = 'warrior') {
  const character = await db
    .insertInto('characters')
    .values({
      user_id: userId,
      name,
      class: characterClass,
      level: 1,
      experience: 0,
      max_hp: 100,
      current_hp: 100,
      max_sp: 50,
      current_sp: 50,
      strength: 10,
      intelligence: 10,
      dexterity: 10,
      constitution: 10,
      vitality: 10,
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
export async function cleanupTestCharacter(characterId) {
  await db
    .deleteFrom('characters')
    .where('id', '=', characterId)
    .execute();
}

// Helper function for Redis operations
export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Did you call setupTestDatabase()?');
  }
  return redisClient;
}

// Helper function to ensure test isolation by cleaning up between tests
export async function cleanupBetweenTests() {
  // Clean Redis between tests
  if (redisClient) {
    await redisClient.flushdb();
  }
  
  // We could also truncate specific tables if needed
  // For now we'll just rely on individual tests to clean up their data
}