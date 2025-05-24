// Docker test helper to ensure test data isolation
import { db } from '../../database/kysely.js';
import { getRedisClient } from './dockerTestSetup.js';

/**
 * Cleans up all test data from a specific test
 * This ensures that tests don't interfere with each other
 * 
 * @param {string} testName - Name of the test for logging
 * @param {object} options - Cleanup options
 * @param {boolean} options.flushRedis - Whether to flush Redis
 * @param {string[]} options.tables - Database tables to clean up
 * @param {object} options.where - Where conditions for database cleanup
 */
export async function cleanupTestData(testName = '', options = {}) {
  const { 
    flushRedis = true, 
    tables = [], 
    where = {} 
  } = options;
  
  console.log(`Cleaning up after test: ${testName}`);
  
  try {
    // Flush Redis if needed
    if (flushRedis) {
      const redis = getRedisClient();
      await redis.flushdb();
      console.log('Redis data flushed');
    }
    
    // Clean up specific tables if needed
    for (const table of tables) {
      try {
        // Build the delete query
        let deleteQuery = db.deleteFrom(table);
        
        // Add where conditions if any
        if (where[table]) {
          const conditions = where[table];
          for (const [column, value] of Object.entries(conditions)) {
            deleteQuery = deleteQuery.where(column, '=', value);
          }
        }
        
        // Execute the delete
        await deleteQuery.execute();
        console.log(`Cleaned up table: ${table}`);
      } catch (err) {
        console.error(`Error cleaning up table ${table}:`, err);
      }
    }
  } catch (error) {
    console.error('Error in test cleanup:', error);
  }
}