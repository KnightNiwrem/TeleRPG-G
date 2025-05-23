import Redis from 'ioredis';
import { UserState, UserStateAction } from '../core/types';

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
   * @param ttlSeconds Optional TTL in seconds (defaults to this.expiry)
   */
  async setUserState(userId: number, state: UserState, ttlSeconds?: number): Promise<void> {
    const key = this.getUserKey(userId);
    
    // Add timestamp if not present
    if (!state.timestamp) {
      state.timestamp = Date.now();
    }
    
    // Use provided TTL or default expiry
    const expiry = ttlSeconds || this.expiry;
    
    await this.redis.set(key, JSON.stringify(state), 'EX', expiry);
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
   * @param ttlSeconds Optional TTL in seconds
   */
  async updateUserState(userId: number, updates: Partial<UserState>, ttlSeconds?: number): Promise<void> {
    const currentState = await this.getUserState(userId);
    
    if (!currentState) {
      // If no current state, create a new one with defaults
      await this.setUserState(userId, {
        action: 'idle',
        step: 'initial',
        ...updates,
      }, ttlSeconds);
      return;
    }
    
    // Merge current state with updates
    const newState = {
      ...currentState,
      ...updates,
      timestamp: Date.now(), // Update timestamp
    };
    
    await this.setUserState(userId, newState, ttlSeconds);
  }

  /**
   * Get player's current interaction state for multi-step commands
   * @param playerId Telegram user ID
   * @returns The current action and context
   */
  async getState(playerId: number): Promise<{
    currentAction: string | null;
    actionContext: any | null;
    expiresAt: number | null;
  }> {
    const state = await this.getUserState(playerId);
    
    if (!state) {
      return {
        currentAction: null,
        actionContext: null,
        expiresAt: null,
      };
    }
    
    // Get TTL for the key
    const key = this.getUserKey(playerId);
    const ttl = await this.redis.ttl(key);
    const expiresAt = ttl > 0 ? Date.now() + (ttl * 1000) : null;
    
    return {
      currentAction: state.action,
      actionContext: state.data || {},
      expiresAt,
    };
  }

  /**
   * Set player's interaction state for multi-step commands
   * @param playerId Telegram user ID
   * @param action Current action (e.g., 'AWAITING_TARGET')
   * @param context Action context data
   * @param ttlSeconds Optional TTL in seconds
   */
  async setState(playerId: number, action: string, context: any, ttlSeconds?: number): Promise<void> {
    await this.setUserState(
      playerId,
      {
        action: action as UserStateAction,
        step: 'initial',
        data: context,
      },
      ttlSeconds
    );
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