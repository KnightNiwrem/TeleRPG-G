import { db as defaultDb } from '../database/kysely.js';
import { Monster, Character } from '../core/types.js';
import { CharacterService } from './CharacterService.js';
import { AreaService } from './AreaService.js';
// @ts-ignore - Importing Redis with type issues
import Redis from 'ioredis';
import { InlineKeyboard } from 'grammy';

// Interface for combat state
interface CombatState {
  character: Character;
  enemy: Monster;
  turn: 'player' | 'enemy';
  round: number;
}

/**
 * CombatService - Handles combat-related operations
 */
export class CombatService {
  // @ts-ignore - Using any for Redis to fix typing issue
  private redis: any;
  private readonly prefix = 'combat_state:';
  private readonly expiry = 1800; // 30 minutes in seconds
  private characterService: CharacterService;
  private areaService: AreaService;
  private db: typeof defaultDb;

  constructor(
    dbInstance: typeof defaultDb = defaultDb,
    // @ts-ignore - Using any for Redis to fix typing issue
    redisInstance?: any,
    characterService?: CharacterService,
    areaService?: AreaService
  ) {
    // Initialize Redis connection if not provided
    // @ts-ignore - Using any to fix Redis constructor typing issue
    this.redis = redisInstance || new Redis(
      process.env.REDIS_HOST || 'localhost',
      parseInt(process.env.REDIS_PORT || '6379'),
      {
        password: process.env.REDIS_PASSWORD || '',
      }
    );

    this.db = dbInstance;
    this.characterService = characterService || new CharacterService(this.db);
    this.areaService = areaService || new AreaService(this.db);
  }

  /**
   * Check if a user is currently in combat
   * @param userId Telegram user ID
   * @returns Boolean indicating if the user is in combat
   */
  async isInCombat(userId: number): Promise<boolean> {
    const key = this.getCombatKey(userId);
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  /**
   * Get the current combat state for a user
   * @param userId Telegram user ID
   * @returns Combat state or null if not in combat
   */
  async getCombatState(userId: number): Promise<CombatState | null> {
    const key = this.getCombatKey(userId);
    const stateJson = await this.redis.get(key);
    
    if (!stateJson) {
      return null;
    }
    
    try {
      return JSON.parse(stateJson) as CombatState;
    } catch (error) {
      console.error('Error parsing combat state JSON:', error);
      return null;
    }
  }

  /**
   * Find a random enemy in the character's current area
   * @param userId Telegram user ID
   * @returns Monster object or null if none found
   */
  async findEnemy(userId: number): Promise<Monster | null> {
    // Get character's current area
    const character = await this.characterService.getCharacter(userId);
    
    if (!character) {
      return null;
    }
    
    // Find monsters in the current area
    const dbMonsters = await this.db
      .selectFrom('monsters')
      .selectAll()
      .where('area_id', '=', character.areaId)
      .where('level', '<=', character.level + 2) // Don't find monsters too high level
      .execute();
    
    if (dbMonsters.length === 0) {
      return null;
    }
    
    // Pick a random monster
    const randomIndex = Math.floor(Math.random() * dbMonsters.length);
    const dbMonster = dbMonsters[randomIndex];
    
    // Map database columns to Monster interface
    return {
      id: dbMonster.id,
      name: dbMonster.name,
      type: dbMonster.type,
      level: dbMonster.level,
      maxHp: dbMonster.max_hp,
      currentHp: dbMonster.current_hp,
      areaId: dbMonster.area_id,
      expReward: dbMonster.exp_reward,
      goldReward: dbMonster.gold_reward,
      itemDropRate: dbMonster.item_drop_rate
    };
  }

  /**
   * Find a specific enemy by name in the character's current area
   * @param userId Telegram user ID
   * @param targetName Name of the target enemy
   * @returns Monster object or null if not found
   */
  async findEnemyByName(userId: number, targetName: string): Promise<Monster | null> {
    // Get character's current area
    const character = await this.characterService.getCharacter(userId);
    
    if (!character) {
      return null;
    }
    
    // Find monsters in the current area with matching name (case insensitive)
    const dbMonsters = await this.db
      .selectFrom('monsters')
      .selectAll()
      .where('area_id', '=', character.areaId)
      .where((eb) => eb('name', 'like', `%${targetName}%`))
      .execute();
    
    if (dbMonsters.length === 0) {
      return null;
    }
    
    // Return the first matching monster
    const dbMonster = dbMonsters[0];
    
    // Map database columns to Monster interface
    return {
      id: dbMonster.id,
      name: dbMonster.name,
      type: dbMonster.type,
      level: dbMonster.level,
      maxHp: dbMonster.max_hp,
      currentHp: dbMonster.current_hp,
      areaId: dbMonster.area_id,
      expReward: dbMonster.exp_reward,
      goldReward: dbMonster.gold_reward,
      itemDropRate: dbMonster.item_drop_rate
    };
  }

  /**
   * Initiate combat between a character and a target monster by name
   * @param userId Telegram user ID
   * @param targetName Name of the target enemy
   * @returns Result with success status, message, and combat data if successful
   */
  async initiateCombat(userId: number, targetName: string): Promise<{
    success: boolean;
    message: string;
    character?: Character;
    enemy?: Monster;
    keyboard?: InlineKeyboard;
  }> {
    // Check if already in combat
    const inCombat = await this.isInCombat(userId);
    if (inCombat) {
      return {
        success: false,
        message: 'You are already in combat!'
      };
    }
    
    // Find the target monster
    const enemy = await this.findEnemyByName(userId, targetName);
    if (!enemy) {
      return {
        success: false,
        message: `Could not find "${targetName}" in this area. Try exploring or check the spelling.`
      };
    }
    
    // Get character data
    const character = await this.characterService.getCharacter(userId);
    if (!character) {
      return {
        success: false,
        message: 'Error retrieving character data.'
      };
    }
    
    // Start combat
    await this.startCombat(userId, enemy.id);
    
    // Create combat options keyboard
    const keyboard = new InlineKeyboard()
      .text('Attack', 'combat_attack')
      .text('Use Skill', 'combat_skill')
      .row()
      .text('Use Item', 'combat_item')
      .text('Flee', 'combat_flee');
    
    return {
      success: true,
      message: 'Combat initiated successfully',
      character,
      enemy,
      keyboard
    };
  }

  /**
   * Start combat between a character and a monster
   * @param userId Telegram user ID
   * @param monsterId Monster ID
   * @returns Combat state
   */
  async startCombat(userId: number, monsterId: number): Promise<CombatState> {
    // Get character and monster data
    const character = await this.characterService.getCharacter(userId);
    
    if (!character) {
      throw new Error('Character not found');
    }
    
    const dbMonster = await this.db
      .selectFrom('monsters')
      .selectAll()
      .where('id', '=', monsterId)
      .executeTakeFirst();
    
    if (!dbMonster) {
      throw new Error('Monster not found');
    }
    
    // Map database monster to Monster interface
    const monster: Monster = {
      id: dbMonster.id,
      name: dbMonster.name,
      type: dbMonster.type,
      level: dbMonster.level,
      maxHp: dbMonster.max_hp,
      currentHp: dbMonster.max_hp, // Start with full HP
      areaId: dbMonster.area_id,
      expReward: dbMonster.exp_reward,
      goldReward: dbMonster.gold_reward,
      itemDropRate: dbMonster.item_drop_rate
    };
    
    // Create combat state
    const combatState: CombatState = {
      character,
      enemy: monster,
      turn: 'player', // Player goes first
      round: 1
    };
    
    // Save combat state to Redis
    const key = this.getCombatKey(userId);
    await this.redis.set(key, JSON.stringify(combatState), 'EX', this.expiry);
    
    return combatState;
  }

  /**
   * Process player attack in combat
   * @param userId Telegram user ID
   * @returns Updated combat state and result message
   */
  async processPlayerAttack(userId: number): Promise<{ state: CombatState; message: string }> {
    // Get current combat state
    const combatState = await this.getCombatState(userId);
    
    if (!combatState) {
      throw new Error('Not in combat');
    }
    
    if (combatState.turn !== 'player') {
      throw new Error('Not player\'s turn');
    }
    
    // Calculate damage based on character stats
    const baseDamage = 5 + Math.floor(combatState.character.strength / 2);
    const critChance = combatState.character.dexterity * 0.01; // 1% per point
    
    // Check for critical hit
    const isCritical = Math.random() < critChance;
    const damage = isCritical ? baseDamage * 1.5 : baseDamage;
    const roundedDamage = Math.floor(damage);
    
    // Apply damage to enemy
    const enemy = { ...combatState.enemy };
    enemy.currentHp = Math.max(0, enemy.currentHp - roundedDamage);
    
    // Check if enemy is defeated
    if (enemy.currentHp <= 0) {
      // End combat and award experience
      await this.endCombat(userId);
      // Add experience using safe method
      await this.characterService.handleBattleRewards(combatState.character.id, enemy.expReward);
      
      return {
        state: { ...combatState, enemy },
        message: `You hit ${enemy.name} for ${roundedDamage} damage${isCritical ? ' (Critical hit!)' : ''}! The ${enemy.name} is defeated! You gained ${enemy.expReward} experience.`
      };
    }
    
    // Update combat state for enemy's turn
    const newState: CombatState = {
      ...combatState,
      enemy,
      turn: 'enemy',
    };
    
    // Save updated state
    const key = this.getCombatKey(userId);
    await this.redis.set(key, JSON.stringify(newState), 'EX', this.expiry);
    
    return {
      state: newState,
      message: `You hit ${enemy.name} for ${roundedDamage} damage${isCritical ? ' (Critical hit!)' : ''}!`
    };
  }

  /**
   * Process enemy attack in combat
   * @param userId Telegram user ID
   * @returns Updated combat state and result message
   */
  async processEnemyAttack(userId: number): Promise<{ state: CombatState; message: string }> {
    // Get current combat state
    const combatState = await this.getCombatState(userId);
    
    if (!combatState) {
      throw new Error('Not in combat');
    }
    
    if (combatState.turn !== 'enemy') {
      throw new Error('Not enemy\'s turn');
    }
    
    // Calculate enemy damage
    const baseDamage = 3 + Math.floor(combatState.enemy.level / 2);
    const damage = Math.floor(baseDamage * (Math.random() * 0.4 + 0.8)); // 80-120% of base damage
    
    // Apply damage to character
    const character = { ...combatState.character };
    character.currentHp = Math.max(0, character.currentHp - damage);
    
    // Check if character is defeated
    if (character.currentHp <= 0) {
      // End combat and reset character HP
      await this.endCombat(userId);
      await this.db
        .updateTable('characters')
        .set({ current_hp: Math.floor(character.maxHp * 0.5) }) // Restore to 50% HP after defeat
        .where('id', '=', character.id)
        .execute();
      
      return {
        state: { ...combatState, character },
        message: `The ${combatState.enemy.name} hits you for ${damage} damage! You have been defeated!`
      };
    }
    
    // Update combat state for next round
    const newState: CombatState = {
      ...combatState,
      character,
      turn: 'player',
      round: combatState.round + 1
    };
    
    // Save updated state
    const key = this.getCombatKey(userId);
    await this.redis.set(key, JSON.stringify(newState), 'EX', this.expiry);
    
    return {
      state: newState,
      message: `The ${combatState.enemy.name} hits you for ${damage} damage!`
    };
  }

  /**
   * End combat for a user
   * @param userId Telegram user ID
   */
  async endCombat(userId: number): Promise<void> {
    const key = this.getCombatKey(userId);
    await this.redis.del(key);
  }

  /**
   * Generate Redis key for combat state
   * @param userId Telegram user ID
   * @returns Redis key
   */
  private getCombatKey(userId: number): string {
    return `${this.prefix}${userId}`;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}