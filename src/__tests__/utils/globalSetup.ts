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
    
    // Try both TS and JS versions of testSetup
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