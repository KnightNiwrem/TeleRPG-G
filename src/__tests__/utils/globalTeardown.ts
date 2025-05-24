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
    
    // Try both TS and JS versions of testSetup for teardown
    try {
      // First try the typescript version
      const { teardownTestEnvironment } = await import('../utils/testSetup.js');
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