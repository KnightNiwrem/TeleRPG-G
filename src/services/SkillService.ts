import { db } from '../database/kysely.js';
import { Skill, CharacterSkill } from '../core/types.js';

/**
 * SkillService - Handles skill-related operations
 */
export class SkillService {
  /**
   * Get all skills available to a character based on class and level
   * @param userId Telegram user ID
   * @returns Array of skills
   */
  async getCharacterSkills(userId: number): Promise<Skill[]> {
    // Get character details
    const character = await db
      .selectFrom('characters')
      .select(['id', 'class', 'level'])
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return [];
    }
    
    // Get skills that the character has learned
    const learnedSkills = await db
      .selectFrom('character_skills')
      .innerJoin('skills', 'skills.id', 'character_skills.skill_id')
      .select([
        'skills.id',
        'skills.name',
        'skills.description',
        'skills.type',
        'skills.damage',
        'skills.healing',
        'skills.sp_cost as spCost',
        'skills.cooldown',
        'skills.class_restriction as classRestriction',
        'skills.level_requirement as levelRequirement',
        'character_skills.last_used as lastUsed'
      ])
      .where('character_skills.character_id', '=', character.id)
      .execute();
    
    // Map to Skill interface
    return learnedSkills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      type: skill.type,
      damage: skill.damage,
      healing: skill.healing,
      spCost: skill.spCost,
      cooldown: skill.cooldown,
      classRestriction: skill.classRestriction,
      levelRequirement: skill.levelRequirement
    }));
  }

  /**
   * Get skills available to learn for a character
   * @param userId Telegram user ID
   * @returns Array of skills that can be learned
   */
  async getAvailableSkills(userId: number): Promise<Skill[]> {
    // Get character details
    const character = await db
      .selectFrom('characters')
      .select(['id', 'class', 'level'])
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return [];
    }
    
    // Get skills already learned
    const learnedSkillIds = await db
      .selectFrom('character_skills')
      .select('skill_id')
      .where('character_id', '=', character.id)
      .execute();
    
    const learnedIds = learnedSkillIds.map(skill => skill.skill_id);
    
    // Get skills that match class and level requirements
    const availableSkills = await db
      .selectFrom('skills')
      .selectAll()
      .where(eb => 
        eb.or([
          eb('class_restriction', '=', character.class),
          eb('class_restriction', 'is', null)
        ])
      )
      .where('level_requirement', '<=', character.level)
      .whereNotIn('id', learnedIds.length > 0 ? learnedIds : [-1]) // Avoid empty IN clause
      .execute();
    
    // Map to Skill interface
    return availableSkills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      type: skill.type,
      damage: skill.damage,
      healing: skill.healing,
      spCost: skill.sp_cost,
      cooldown: skill.cooldown,
      classRestriction: skill.class_restriction,
      levelRequirement: skill.level_requirement
    }));
  }

  /**
   * Learn a new skill
   * @param userId Telegram user ID
   * @param skillId Skill ID
   * @returns Boolean indicating success
   */
  async learnSkill(userId: number, skillId: number): Promise<boolean> {
    // Get character details
    const character = await db
      .selectFrom('characters')
      .select(['id', 'class', 'level'])
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return false;
    }
    
    // Check if skill already learned
    const alreadyLearned = await db
      .selectFrom('character_skills')
      .select('skill_id')
      .where('character_id', '=', character.id)
      .where('skill_id', '=', skillId)
      .executeTakeFirst();
    
    if (alreadyLearned) {
      return false;
    }
    
    // Check if skill is available to learn
    const skill = await db
      .selectFrom('skills')
      .selectAll()
      .where('id', '=', skillId)
      .executeTakeFirst();
    
    if (!skill) {
      return false;
    }
    
    // Check class restriction
    if (skill.class_restriction && skill.class_restriction !== character.class) {
      return false;
    }
    
    // Check level requirement
    if (skill.level_requirement > character.level) {
      return false;
    }
    
    // Learn the skill
    await db
      .insertInto('character_skills')
      .values({
        character_id: character.id,
        skill_id: skillId,
        last_used: null
      })
      .execute();
    
    return true;
  }

  /**
   * Use a skill in combat
   * @param userId Telegram user ID
   * @param skillId Skill ID
   * @returns Object with success status and result message
   */
  async useSkill(userId: number, skillId: number): Promise<{ success: boolean; message: string; damage?: number; healing?: number }> {
    // Get character details
    const character = await db
      .selectFrom('characters')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return { success: false, message: 'Character not found' };
    }
    
    // Check if character has the skill
    const characterSkill = await db
      .selectFrom('character_skills')
      .innerJoin('skills', 'skills.id', 'character_skills.skill_id')
      .select([
        'skills.id',
        'skills.name',
        'skills.type',
        'skills.damage',
        'skills.healing',
        'skills.sp_cost as spCost',
        'skills.cooldown',
        'character_skills.last_used as lastUsed'
      ])
      .where('character_skills.character_id', '=', character.id)
      .where('character_skills.skill_id', '=', skillId)
      .executeTakeFirst();
    
    if (!characterSkill) {
      return { success: false, message: 'You do not know this skill' };
    }
    
    // Check cooldown
    if (characterSkill.lastUsed && characterSkill.cooldown > 0) {
      const lastUsedTime = new Date(characterSkill.lastUsed).getTime();
      const currentTime = Date.now();
      const cooldownMs = characterSkill.cooldown * 1000; // Convert to milliseconds
      
      if (currentTime - lastUsedTime < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - (currentTime - lastUsedTime)) / 1000);
        return { success: false, message: `Skill is on cooldown (${remainingSeconds}s remaining)` };
      }
    }
    
    // Check if character has enough SP
    if (character.current_sp < characterSkill.spCost) {
      return { success: false, message: 'Not enough spirit points' };
    }
    
    // Update last used time and reduce SP
    await db
      .updateTable('character_skills')
      .set({ last_used: new Date() })
      .where('character_id', '=', character.id)
      .where('skill_id', '=', skillId)
      .execute();
    
    await db
      .updateTable('characters')
      .set({ current_sp: character.current_sp - characterSkill.spCost })
      .where('id', '=', character.id)
      .execute();
    
    // Calculate skill effect
    let damageDealt = 0;
    let healingDone = 0;
    let resultMessage = '';
    
    switch (characterSkill.type) {
    case 'ATTACK':
      // Calculate damage based on skill damage and character stats
      const baseDamage = characterSkill.damage;
      const statBonus = character.intelligence * 0.5;
      damageDealt = Math.floor(baseDamage + statBonus);
      resultMessage = `You used ${characterSkill.name} and dealt ${damageDealt} damage!`;
      break;
      
    case 'HEAL':
      // Calculate healing based on skill healing and character stats
      const baseHealing = characterSkill.healing;
      const wisdomBonus = character.wisdom * 0.5;
      healingDone = Math.floor(baseHealing + wisdomBonus);
        
      // Apply healing
      const newHp = Math.min(character.max_hp, character.current_hp + healingDone);
      await db
        .updateTable('characters')
        .set({ current_hp: newHp })
        .where('id', '=', character.id)
        .execute();
        
      resultMessage = `You used ${characterSkill.name} and healed for ${healingDone} HP!`;
      break;
      
    case 'BUFF':
      resultMessage = `You used ${characterSkill.name} and gained a temporary buff!`;
      break;
      
    case 'DEBUFF':
      resultMessage = `You used ${characterSkill.name} and applied a debuff to the enemy!`;
      break;
    }
    
    return {
      success: true,
      message: resultMessage,
      damage: damageDealt > 0 ? damageDealt : undefined,
      healing: healingDone > 0 ? healingDone : undefined
    };
  }
}