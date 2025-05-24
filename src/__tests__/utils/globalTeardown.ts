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
    
    // Try different paths to find testSetup module
    let testSetupModule;
    
    // Try options in order of preference
    try {
      // Option 1: Direct import with .js extension (ESM standard)
      testSetupModule = await import('./testSetup.js');
    } catch (e) {
      try {
        // Option 2: Absolute path with .js 
        const jsPath = path.resolve(__dirname, './testSetup.js');
        testSetupModule = await import(jsPath);
      } catch (e2) {
        try {
          // Option 3: Try with .ts extension
          const tsPath = path.resolve(__dirname, './testSetup.ts');
          testSetupModule = await import(tsPath);
        } catch (e3) {
          // Option 4: Try without extension
          const noExtPath = path.resolve(__dirname, './testSetup');
          testSetupModule = await import(noExtPath);
        }
      }
    }
    
    const { teardownTestEnvironment } = testSetupModule;
    await teardownTestEnvironment();
  } catch (error) {
    console.error('Error in global teardown:', error);
    throw error;
  }
}