import { db } from '../database/kysely';
import { ClassType, EntityType } from '../core/enums';
import { Character } from '../core/types';
import { NewCharacter } from '../database/schema';

/**
 * CharacterService - Handles character-related operations
 */
export class CharacterService {
  /**
   * Check if a user already has a character
   * @param userId Telegram user ID
   * @returns Boolean indicating if the user has a character
   */
  async hasCharacter(userId: number): Promise<boolean> {
    const character = await db
      .selectFrom('characters')
      .select('id')
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    return !!character;
  }

  /**
   * Get a character by user ID
   * @param userId Telegram user ID
   * @returns Character object or null if not found
   */
  async getCharacter(userId: number): Promise<Character | null> {
    const dbCharacter = await db
      .selectFrom('characters')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!dbCharacter) {
      return null;
    }
    
    // Map database columns to Character interface
    return {
      id: dbCharacter.id,
      userId: dbCharacter.user_id,
      name: dbCharacter.name,
      type: dbCharacter.type as EntityType,
      class: dbCharacter.class as ClassType,
      level: dbCharacter.level,
      experience: dbCharacter.experience,
      maxHp: dbCharacter.max_hp,
      currentHp: dbCharacter.current_hp,
      maxSp: dbCharacter.max_sp,
      currentSp: dbCharacter.current_sp,
      strength: dbCharacter.strength,
      intelligence: dbCharacter.intelligence,
      dexterity: dbCharacter.dexterity,
      wisdom: dbCharacter.wisdom,
      areaId: dbCharacter.area_id
    };
  }

  /**
   * Create a new character
   * @param userId Telegram user ID
   * @param name Character name
   * @param characterClass Character class
   * @returns The created character
   */
  async createCharacter(userId: number, name: string, characterClass: ClassType): Promise<Character> {
    // Check if user already has a character
    const hasCharacter = await this.hasCharacter(userId);
    
    if (hasCharacter) {
      throw new Error('User already has a character');
    }
    
    // Set base stats based on class
    let strength = 5;
    let intelligence = 5;
    let dexterity = 5;
    let wisdom = 5;
    
    switch (characterClass) {
      case ClassType.WARRIOR:
        strength = 8;
        dexterity = 6;
        break;
      case ClassType.MAGE:
        intelligence = 8;
        wisdom = 6;
        break;
      case ClassType.ROGUE:
        dexterity = 8;
        strength = 6;
        break;
      case ClassType.CLERIC:
        wisdom = 8;
        intelligence = 6;
        break;
    }
    
    // Calculate HP and SP based on stats
    const maxHp = 50 + (strength * 2);
    const maxSp = 30 + (intelligence * 2);
    
    // Create new character
    const newCharacter: NewCharacter = {
      user_id: userId,
      name,
      type: EntityType.CHARACTER,
      class: characterClass,
      level: 1,
      experience: 0,
      max_hp: maxHp,
      current_hp: maxHp,
      max_sp: maxSp,
      current_sp: maxSp,
      strength,
      intelligence,
      dexterity,
      wisdom,
      area_id: 1, // Start in first area (town)
    };
    
    const [dbCharacter] = await db
      .insertInto('characters')
      .values(newCharacter)
      .returning('id')
      .execute();
    
    // Add starting skills based on class
    await this.addStartingSkills(dbCharacter.id, characterClass);
    
    // Add starting equipment
    await this.addStartingEquipment(dbCharacter.id, characterClass);
    
    // Return the created character
    return this.getCharacter(userId) as Promise<Character>;
  }

  /**
   * Add starting skills for a new character
   * @param characterId Character ID
   * @param characterClass Character class
   */
  private async addStartingSkills(characterId: number, characterClass: ClassType): Promise<void> {
    // Get basic skill for the character's class
    const skill = await db
      .selectFrom('skills')
      .select('id')
      .where('class_restriction', '=', characterClass)
      .where('level_requirement', '=', 1)
      .limit(1)
      .executeTakeFirst();
    
    if (skill) {
      // Add skill to character
      await db
        .insertInto('character_skills')
        .values({
          character_id: characterId,
          skill_id: skill.id,
          last_used: null
        })
        .execute();
    }
  }

  /**
   * Add starting equipment for a new character
   * @param characterId Character ID
   * @param characterClass Character class
   */
  private async addStartingEquipment(characterId: number, characterClass: ClassType): Promise<void> {
    // Get starting weapon based on class
    let weaponId = 1; // Default: Rusty Sword
    
    if (characterClass === ClassType.MAGE || characterClass === ClassType.CLERIC) {
      weaponId = 2; // Wooden Staff for mages and clerics
    }
    
    // Add weapon to inventory
    await db
      .insertInto('inventory_items')
      .values({
        character_id: characterId,
        item_id: weaponId,
        quantity: 1,
        equipped: true
      })
      .execute();
    
    // Add basic armor
    await db
      .insertInto('inventory_items')
      .values({
        character_id: characterId,
        item_id: 3, // Leather Armor
        quantity: 1,
        equipped: true
      })
      .execute();
    
    // Add a health potion
    await db
      .insertInto('inventory_items')
      .values({
        character_id: characterId,
        item_id: 4, // Health Potion
        quantity: 2,
        equipped: false
      })
      .execute();
  }

  /**
   * Update character experience and handle level up
   * @param characterId Character ID
   * @param expGain Experience points to add
   * @returns Updated character data
   */
  async addExperience(characterId: number, expGain: number): Promise<Character> {
    // Get current character data
    const character = await db
      .selectFrom('characters')
      .selectAll()
      .where('id', '=', characterId)
      .executeTakeFirst();
    
    if (!character) {
      throw new Error('Character not found');
    }
    
    // Add experience
    let newExp = character.experience + expGain;
    let newLevel = character.level;
    let leveledUp = false;
    
    // Check for level up
    const expForNextLevel = character.level * 100;
    
    if (newExp >= expForNextLevel) {
      newLevel += 1;
      newExp -= expForNextLevel;
      leveledUp = true;
    }
    
    // Calculate new stats if leveled up
    let newMaxHp = character.max_hp;
    let newMaxSp = character.max_sp;
    let newStrength = character.strength;
    let newIntelligence = character.intelligence;
    let newDexterity = character.dexterity;
    let newWisdom = character.wisdom;
    
    if (leveledUp) {
      // Increase stats based on class
      switch (character.class) {
        case ClassType.WARRIOR:
          newStrength += 2;
          newDexterity += 1;
          break;
        case ClassType.MAGE:
          newIntelligence += 2;
          newWisdom += 1;
          break;
        case ClassType.ROGUE:
          newDexterity += 2;
          newStrength += 1;
          break;
        case ClassType.CLERIC:
          newWisdom += 2;
          newIntelligence += 1;
          break;
      }
      
      // Update HP and SP based on new stats
      newMaxHp = 50 + (newStrength * 2);
      newMaxSp = 30 + (newIntelligence * 2);
    }
    
    // Update character in database
    await db
      .updateTable('characters')
      .set({
        level: newLevel,
        experience: newExp,
        max_hp: newMaxHp,
        current_hp: newMaxHp, // Fully heal on level up
        max_sp: newMaxSp,
        current_sp: newMaxSp, // Fully restore SP on level up
        strength: newStrength,
        intelligence: newIntelligence,
        dexterity: newDexterity,
        wisdom: newWisdom,
      })
      .where('id', '=', characterId)
      .execute();
    
    // Return updated character
    const userId = character.user_id;
    return this.getCharacter(userId) as Promise<Character>;
  }
}