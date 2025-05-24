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
    
    // Use dynamic import with absolute path to JS file
    const jsPath = path.resolve(__dirname, './testSetup.js');
    const testSetupModule = await import(jsPath);
    const { teardownTestEnvironment } = testSetupModule;
    await teardownTestEnvironment();
  } catch (error) {
    console.error('Error in global teardown:', error);
    throw error;
  }
}