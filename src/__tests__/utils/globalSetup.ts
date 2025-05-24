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
    console.log('Files in directory:', fs.readdirSync(__dirname));
    
    // Try different paths to find testSetup module
    let testSetupModule;
    
    // Try options in order of preference
    try {
      // Option 1: Direct import with .js extension (ESM standard)
      testSetupModule = await import('./testSetup.js');
      console.log('Found testSetup.js using direct import');
    } catch (e) {
      console.log('Direct import failed, trying absolute path');
      try {
        // Option 2: Absolute path with .js 
        const jsPath = path.resolve(__dirname, './testSetup.js');
        testSetupModule = await import(jsPath);
        console.log('Found testSetup using absolute .js path');
      } catch (e2) {
        console.log('Absolute .js path failed, trying .ts');
        try {
          // Option 3: Try with .ts extension
          const tsPath = path.resolve(__dirname, './testSetup.ts');
          testSetupModule = await import(tsPath);
          console.log('Found testSetup using .ts path');
        } catch (e3) {
          // Option 4: Try without extension
          const noExtPath = path.resolve(__dirname, './testSetup');
          testSetupModule = await import(noExtPath);
          console.log('Found testSetup using no extension path');
        }
      }
    }
    
    const { setupTestDatabase } = testSetupModule;
    await setupTestDatabase();
  } catch (error) {
    console.error('Error in global setup:', error);
    throw error;
  }
}