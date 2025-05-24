// In ESM environments, dynamically import the module to avoid extension issues
// Global teardown function that runs after all tests
export default async function teardown(): Promise<void> {
  console.log('Cleaning up test environment...');
  const { teardownTestEnvironment } = await import('./testSetup.js');
  await teardownTestEnvironment();
}