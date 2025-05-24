import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';

// Global teardown function that runs after all tests
export default async function teardown(): Promise<void> {
  console.log('Cleaning up test environment...');
  
  try {
    // Get dirname equivalent in ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Check if we're in Docker environment
    const isDockerEnv = process.env.NODE_ENV === 'test' && 
                        (process.env.DB_HOST === 'postgres-test' || 
                         process.env.REDIS_HOST === 'redis-test');
    
    if (isDockerEnv) {
      console.log('Detected Docker test environment - cleaning up real services');
      try {
        // Use the Docker-specific teardown
        const { teardownTestEnvironment } = await import('../utils/dockerTestSetup');
        await teardownTestEnvironment();
        console.log('Docker test environment teardown complete');
        return;
      } catch (error) {
        console.error('Failed to import dockerTestSetup.js for teardown:', error);
        throw error;
      }
    }
    
    // For non-Docker environment, use the regular mocked teardown
    try {
      // First try the typescript version
      const { teardownTestEnvironment } = await import('../utils/testSetup');
      await teardownTestEnvironment();
      console.log('Test environment teardown complete using testSetup.js');
    } catch (error) {
      console.error('Failed to import testSetup.js, trying testSetup.js directly:', error);
      
      // Fallback to the JS version
      const jsPath = path.resolve(__dirname, './testSetup.js');
      console.log('Trying to import teardown from:', jsPath);
      
      if (fs.existsSync(jsPath)) {
        const testSetupModule = await import(jsPath);
        const { teardownTestEnvironment } = testSetupModule;
        await teardownTestEnvironment();
        console.log('Test environment teardown complete using direct JS import');
      } else {
        throw new Error(`Could not find testSetup.js at ${jsPath}`);
      }
    }
  } catch (error) {
    console.error('Error in global teardown:', error);
    throw error;
  }
}