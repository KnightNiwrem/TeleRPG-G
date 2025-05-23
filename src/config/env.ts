import { z } from 'zod';

// Define the environment schema with Zod
const envSchema = z.object({
  // Bot Configuration
  BOT_TOKEN: z.string({
    required_error: 'BOT_TOKEN is required',
  }).min(1, 'BOT_TOKEN cannot be empty'),

  // Database Configuration
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_NAME: z.string().default('telerpg'),
  DB_SSL: z.enum(['true', 'false']).default('false')
    .transform(val => val === 'true'),

  // Redis Configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),

  // BullMQ Configuration
  QUEUE_NAME: z.string().default('telerpg_queue'),
});

// Define the type for our validated environment
export type Env = z.infer<typeof envSchema>;

// Function to validate environment and return typed config
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { errors } = error;
      const errorMessage = errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      
      console.error('Environment validation failed:');
      console.error(errorMessage);
      process.exit(1);
    }
    
    throw error;
  }
}

// Create and export the validated config object
export const env = validateEnv();
