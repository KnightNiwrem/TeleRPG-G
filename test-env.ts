import 'dotenv/config';
import { validateEnv } from './src/config/env';

// Test environment validation
console.log('Testing environment validation...');
const env = validateEnv();
console.log('Environment validation succeeded:');
console.log(JSON.stringify(env, null, 2));