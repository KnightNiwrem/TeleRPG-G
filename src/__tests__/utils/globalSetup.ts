import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';

// Global setup function that runs before all tests
export default async function setup(): Promise<void> {
  console.log('Setting up test environment...');
  
  try {
    // Get dirname equivalent in ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    console.log('Current directory:', __dirname);
    
    // Check if we're in Docker environment
    const isDockerEnv = process.env.NODE_ENV === 'test' && 
                        (process.env.DB_HOST === 'postgres-test' || 
                         process.env.REDIS_HOST === 'redis-test');
    
    if (isDockerEnv) {
      console.log('Detected Docker test environment - using real services');
      try {
        // Use the Docker-specific setup
        const { setupTestDatabase } = await import('../utils/dockerTestSetup.js');
        await setupTestDatabase();
        console.log('Docker test environment setup complete');
        return;
      } catch (error) {
        console.error('Failed to import dockerTestSetup.js:', error);
        throw error;
      }
    }
    
    // For non-Docker environment, use the regular mocked setup
    try {
      // First try the typescript version
      const { setupTestDatabase } = await import('../utils/testSetup.js');
      await setupTestDatabase();
      console.log('Test database setup complete using testSetup.js');
    } catch (error) {
      console.error('Failed to import testSetup.js, trying testSetup.js directly:', error);
      
      // Fallback to the JS version
      const jsPath = path.resolve(__dirname, './testSetup.js');
      console.log('Trying to import from:', jsPath);
      
      if (fs.existsSync(jsPath)) {
        const testSetupModule = await import(jsPath);
        const { setupTestDatabase } = testSetupModule;
        await setupTestDatabase();
        console.log('Test database setup complete using direct JS import');
      } else {
        throw new Error(`Could not find testSetup.js at ${jsPath}`);
      }
    }
  } catch (error) {
    console.error('Error in global setup:', error);
    throw error;
  }
}