import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { db } from '../database/kysely.js';
import { env } from '../config/env.js';

// Redis connection options
const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
};

// Queue name
const queueName = env.QUEUE_NAME;

// Create Redis client
const redisClient = new Redis(
  env.REDIS_HOST,
  env.REDIS_PORT,
  {
    password: env.REDIS_PASSWORD,
  }
});

// Initialize BullMQ queue
const queue = new Queue(queueName, { connection: redisClient });

// Job data type for long rest
interface LongRestJobData {
  userId: number;
  characterId: number;
  duration: number; // in seconds
}

/**
 * Create a new long rest job
 * @param userId Telegram user ID
 * @param duration Duration in seconds
 * @returns Job ID
 */
export async function startLongRest(userId: number, duration: number = 300): Promise<string> {
  // Get character ID
  const character = await db
    .selectFrom('characters')
    .select('id')
    .where('user_id', '=', userId)
    .executeTakeFirst();
  
  if (!character) {
    throw new Error('Character not found');
  }
  
  // Add job to queue
  const job = await queue.add('long_rest', {
    userId,
    characterId: character.id,
    duration
  } as LongRestJobData, {
    delay: duration * 1000, // Convert to milliseconds
    removeOnComplete: true,
    removeOnFail: false
  });
  
  return job.id as string;
}

/**
 * Check the status of a long rest job
 * @param jobId Job ID
 * @returns Object with job status and remaining time
 */
export async function checkLongRestStatus(jobId: string): Promise<{ 
  isActive: boolean; 
  timeRemaining: number | null; 
}> {
  const job = await queue.getJob(jobId);
  
  if (!job) {
    return { isActive: false, timeRemaining: null };
  }
  
  const state = await job.getState();
  
  if (state === 'active' || state === 'waiting' || state === 'delayed') {
    // Calculate remaining time
    let timeRemaining = null;
    
    if (job.opts.delay && job.timestamp) {
      const processAt = job.timestamp + job.opts.delay;
      timeRemaining = Math.max(0, Math.floor((processAt - Date.now()) / 1000));
    }
    
    return { isActive: true, timeRemaining };
  }
  
  return { isActive: false, timeRemaining: null };
}

// Initialize BullMQ worker
const worker = new Worker(queueName, async (job) => {
  if (job.name === 'long_rest') {
    const data = job.data as LongRestJobData;
    
    // Get character current stats
    const character = await db
      .selectFrom('characters')
      .select(['max_hp', 'max_sp'])
      .where('id', '=', data.characterId)
      .executeTakeFirst();
    
    if (!character) {
      throw new Error('Character not found');
    }
    
    // Apply long rest effect: restore HP and SP to full
    await db
      .updateTable('characters')
      .set({
        current_hp: character.max_hp,
        current_sp: character.max_sp
      })
      .where('id', '=', data.characterId)
      .execute();
    
    return { success: true, message: 'Long rest completed. HP and SP fully restored.' };
  }
  
  throw new Error('Unknown job type');
}, { connection: redisClient });

// Handle worker events
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});

// Export queue and worker for external access
export { queue, worker };