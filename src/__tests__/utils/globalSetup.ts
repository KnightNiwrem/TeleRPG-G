import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
import { setupTestDatabase } from './testSetupExports.js';

// Global setup function that runs before all tests
export default async function setup(): Promise<void> {
  console.log('Setting up test environment...');
  
  try {
    // Get dirname equivalent in ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    console.log('Current directory:', __dirname);
    console.log('Files in directory:', fs.readdirSync(__dirname));
    
    await setupTestDatabase();
  } catch (error) {
    console.error('Error in global setup:', error);
    throw error;
  }
}