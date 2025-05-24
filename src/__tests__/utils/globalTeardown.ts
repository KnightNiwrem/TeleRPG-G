import { teardownTestEnvironment } from './testSetup.js';

// Global teardown function that runs after all tests
export default async function teardown(): Promise<void> {
  console.log('Cleaning up test environment...');
  await teardownTestEnvironment();
}