import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { db } from '../../database/kysely.js';
import { createTestCharacter, cleanupTestCharacter } from '../utils/dockerTestSetup.js';

// Test character ID will be stored here for cleanup
let testCharacterId: number;

describe('Database Integration Tests', () => {
  // Setup test data before all tests
  beforeAll(async () => {
    // Create a test character
    testCharacterId = await createTestCharacter(
      12345, // user ID
      'TestHero',
      'warrior'
    );
  });

  // Clean up test data after all tests
  afterAll(async () => {
    await cleanupTestCharacter(testCharacterId);
  });

  test('should retrieve a character from the database', async () => {
    // Query the character we created
    const character = await db
      .selectFrom('characters')
      .selectAll()
      .where('id', '=', testCharacterId)
      .executeTakeFirst();

    // Verify character data
    expect(character).not.toBeNull();
    expect(character?.name).toBe('TestHero');
    expect(character?.class).toBe('warrior');
    expect(character?.level).toBe(1);
    expect(character?.user_id).toBe(12345);
  });

  test('should update character attributes', async () => {
    // Update the character
    await db
      .updateTable('characters')
      .set({ level: 2, experience: 100 })
      .where('id', '=', testCharacterId)
      .execute();

    // Retrieve the updated character
    const updatedCharacter = await db
      .selectFrom('characters')
      .selectAll()
      .where('id', '=', testCharacterId)
      .executeTakeFirst();

    // Verify the updates
    expect(updatedCharacter).not.toBeNull();
    expect(updatedCharacter?.level).toBe(2);
    expect(updatedCharacter?.experience).toBe(100);
  });
});