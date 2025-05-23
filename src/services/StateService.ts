import Redis from 'ioredis';
import { UserState } from '../core/types';

/**
 * StateService - Handles user state management without using grammyjs sessions
 * Uses Redis to store user state information
 */
export class StateService {
  private redis: Redis;
  private readonly prefix = 'user_state:';
  private readonly expiry = 3600; // 1 hour in seconds

  constructor() {
    // Initialize Redis connection
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || '',
    });

    // Test Redis connection
    this.redis.ping().catch(error => {
      console.error('Redis connection error:', error);
    });
  }

  /**
   * Set user state in Redis
   * @param userId Telegram user ID
   * @param state State object to store
   */
  async setUserState(userId: number, state: UserState): Promise<void> {
    const key = this.getUserKey(userId);
    
    // Add timestamp if not present
    if (!state.timestamp) {
      state.timestamp = Date.now();
    }
    
    await this.redis.set(key, JSON.stringify(state), 'EX', this.expiry);
  }

  /**
   * Get user state from Redis
   * @param userId Telegram user ID
   * @returns UserState object or null if not found
   */
  async getUserState(userId: number): Promise<UserState | null> {
    const key = this.getUserKey(userId);
    const stateJson = await this.redis.get(key);
    
    if (!stateJson) {
      return null;
    }
    
    try {
      return JSON.parse(stateJson) as UserState;
    } catch (error) {
      console.error('Error parsing user state JSON:', error);
      return null;
    }
  }

  /**
   * Clear user state from Redis
   * @param userId Telegram user ID
   */
  async clearUserState(userId: number): Promise<void> {
    const key = this.getUserKey(userId);
    await this.redis.del(key);
  }

  /**
   * Update specific fields in user state
   * @param userId Telegram user ID
   * @param updates Partial state updates
   */
  async updateUserState(userId: number, updates: Partial<UserState>): Promise<void> {
    const currentState = await this.getUserState(userId);
    
    if (!currentState) {
      // If no current state, create a new one with defaults
      await this.setUserState(userId, {
        action: 'idle',
        step: 'initial',
        ...updates,
      });
      return;
    }
    
    // Merge current state with updates
    const newState = {
      ...currentState,
      ...updates,
      timestamp: Date.now(), // Update timestamp
    };
    
    await this.setUserState(userId, newState);
  }

  /**
   * Generate Redis key for user state
   * @param userId Telegram user ID
   * @returns Redis key
   */
  private getUserKey(userId: number): string {
    return `${this.prefix}${userId}`;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}