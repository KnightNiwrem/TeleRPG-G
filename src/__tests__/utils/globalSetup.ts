import { setupTestDatabase } from './testSetup.js';

// Global setup function that runs before all tests
export default async function setup(): Promise<void> {
  console.log('Setting up test environment...');
  await setupTestDatabase();
}