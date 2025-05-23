import { db as defaultDb } from '../database/kysely.js';
import { Area, Monster } from '../core/types.js';
import { CharacterService } from './CharacterService.js';
import { Kysely } from 'kysely';
import { Database } from '../database/schema.js';

/**
 * AreaService - Handles area-related operations
 */
export class AreaService {
  private characterService: CharacterService;
  private db: Kysely<Database>;

  constructor(dbInstance: Kysely<Database> = defaultDb, characterService?: CharacterService) {
    this.db = dbInstance;
    this.characterService = characterService || new CharacterService(this.db);
  }

  /**
   * Get all areas
   * @returns Array of all areas
   */
  async getAllAreas(): Promise<Area[]> {
    const dbAreas = await this.db
      .selectFrom('areas')
      .selectAll()
      .execute();
    
    // Map database columns to Area interface
    return dbAreas.map(area => ({
      id: area.id,
      name: area.name,
      description: area.description,
      type: area.type,
      levelRequirement: area.level_requirement,
      parentAreaId: area.parent_area_id
    }));
  }

  /**
   * Get a single area by ID
   * @param areaId Area ID
   * @returns Area object or null if not found
   */
  async getArea(areaId: number): Promise<Area | null> {
    const dbArea = await this.db
      .selectFrom('areas')
      .selectAll()
      .where('id', '=', areaId)
      .executeTakeFirst();
    
    if (!dbArea) {
      return null;
    }
    
    // Map database columns to Area interface
    return {
      id: dbArea.id,
      name: dbArea.name,
      description: dbArea.description,
      type: dbArea.type,
      levelRequirement: dbArea.level_requirement,
      parentAreaId: dbArea.parent_area_id
    };
  }

  /**
   * Get areas that are available to a character based on their level and quest progress
   * @param userId Telegram user ID
   * @returns Array of available areas
   */
  async getAvailableAreas(userId: number): Promise<Area[]> {
    // Get character data to check level
    const character = await this.db
      .selectFrom('characters')
      .select(['id', 'level'])
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return [];
    }
    
    // Get areas that match the character's level
    const dbAreas = await this.db
      .selectFrom('areas')
      .selectAll()
      .where('level_requirement', '<=', character.level)
      .execute();
    
    // Map database columns to Area interface
    return dbAreas.map(area => ({
      id: area.id,
      name: area.name,
      description: area.description,
      type: area.type,
      levelRequirement: area.level_requirement,
      parentAreaId: area.parent_area_id
    }));
  }

  /**
   * Update a character's current area
   * @param userId Telegram user ID
   * @param areaId Area ID to move to
   * @returns Boolean indicating success
   */
  async moveCharacterToArea(userId: number, areaId: number): Promise<boolean> {
    // Verify the area exists
    const area = await this.getArea(areaId);
    
    if (!area) {
      return false;
    }
    
    // Update character's area
    const result = await this.db
      .updateTable('characters')
      .set({ area_id: areaId })
      .where('user_id', '=', userId)
      .execute();
    
    return result.length > 0;
  }

  /**
   * Get all connected areas from current area
   * @param areaId Current area ID
   * @returns Array of connected areas
   */
  async getConnectedAreas(areaId: number): Promise<Area[]> {
    // Get areas that have this area as parent
    const childAreas = await this.db
      .selectFrom('areas')
      .selectAll()
      .where('parent_area_id', '=', areaId)
      .execute();
    
    // Get the parent of this area
    const currentArea = await this.getArea(areaId);
    const parentAreas = [];
    
    if (currentArea?.parentAreaId) {
      const parentArea = await this.getArea(currentArea.parentAreaId);
      if (parentArea) {
        parentAreas.push(parentArea);
      }
    }
    
    // Combine and map to Area interface
    const connectedAreas = [...childAreas, ...parentAreas].map(area => ({
      id: area.id,
      name: area.name,
      description: area.description,
      type: area.type,
      levelRequirement: 'level_requirement' in area ? area.level_requirement : area.levelRequirement,
      parentAreaId: 'parent_area_id' in area ? area.parent_area_id : area.parentAreaId
    }));
    
    return connectedAreas;
  }

  /**
   * Get all enemies in the character's current area
   * @param userId Telegram user ID
   * @returns Array of monsters in the area
   */
  async getEnemiesInArea(userId: number): Promise<Monster[]> {
    // Get character's current area
    const character = await this.characterService.getCharacter(userId);
    
    if (!character) {
      return [];
    }
    
    // Get monsters in the area
    const dbMonsters = await this.db
      .selectFrom('monsters')
      .selectAll()
      .where('area_id', '=', character.areaId)
      .execute();
    
    // Map database monsters to Monster interface
    return dbMonsters.map(monster => ({
      id: monster.id,
      name: monster.name,
      type: monster.type,
      level: monster.level,
      maxHp: monster.max_hp,
      currentHp: monster.current_hp,
      areaId: monster.area_id,
      expReward: monster.exp_reward,
      goldReward: monster.gold_reward,
      itemDropRate: monster.item_drop_rate
    }));
  }

  /**
   * Describe the current area, including exits, NPCs, monsters, and other players
   * @param userId Telegram user ID
   * @returns Formatted area description
   */
  async describeArea(userId: number): Promise<{
    areaName: string;
    description: string;
    exits: string[];
    npcs: string[];
    monsters: string[];
    players: string[];
  }> {
    // Get character's current area
    const character = await this.characterService.getCharacter(userId);
    
    if (!character) {
      throw new Error('Character not found');
    }
    
    // Get area details
    const area = await this.getArea(character.areaId);
    if (!area) {
      throw new Error('Area not found');
    }
    
    // Get connected areas (exits)
    const connectedAreas = await this.getConnectedAreas(area.id);
    const exits = connectedAreas.map(connectedArea => connectedArea.name);
    
    // Get NPCs in the area
    const npcs = await this.db
      .selectFrom('npcs')
      .select('name')
      .where('area_id', '=', area.id)
      .execute();
    
    // Get monsters in the area
    const monsters = await this.db
      .selectFrom('monsters')
      .select('name')
      .where('area_id', '=', area.id)
      .execute();
    
    // Get other players in the area
    const otherPlayers = await this.db
      .selectFrom('characters')
      .select('name')
      .where('area_id', '=', area.id)
      .where('user_id', '!=', character.userId)
      .execute();
    
    return {
      areaName: area.name,
      description: area.description,
      exits: exits,
      npcs: npcs.map(npc => npc.name),
      monsters: monsters.map(monster => monster.name),
      players: otherPlayers.map(player => player.name)
    };
  }
}