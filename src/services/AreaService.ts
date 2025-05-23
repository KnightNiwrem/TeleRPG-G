import { db } from '../database/kysely';
import { Area } from '../core/types';

/**
 * AreaService - Handles area-related operations
 */
export class AreaService {
  /**
   * Get all areas
   * @returns Array of all areas
   */
  async getAllAreas(): Promise<Area[]> {
    const dbAreas = await db
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
    const dbArea = await db
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
    const character = await db
      .selectFrom('characters')
      .select(['id', 'level'])
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return [];
    }
    
    // Get areas that match the character's level
    const dbAreas = await db
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
    const result = await db
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
    const childAreas = await db
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
      levelRequirement: area.level_requirement,
      parentAreaId: area.parent_area_id
    }));
    
    return connectedAreas;
  }
}