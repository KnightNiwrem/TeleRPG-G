// In ESM environments, dynamically import the module to avoid extension issues
// Global setup function that runs before all tests
export default async function setup(): Promise<void> {
  console.log('Setting up test environment...');
  const { setupTestDatabase } = await import('./testSetup.js');
  await setupTestDatabase();
}