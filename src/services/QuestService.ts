import { db as defaultDb } from '../database/kysely.js';
import { Quest, QuestObjective, CharacterQuest } from '../core/types.js';

/**
 * QuestService - Handles quest-related operations
 */
export class QuestService {
  private db: any;

  /**
   * Create a new QuestService instance
   * @param dbInstance Optional database instance for dependency injection
   */
  constructor(dbInstance: any = defaultDb) {
    this.db = dbInstance;
  }
  /**
   * Get all active quests for a character
   * @param userId Telegram user ID
   * @returns Array of active quests with objectives
   */
  async getActiveQuests(userId: number): Promise<CharacterQuest[]> {
    // Get character ID
    const character = await this.db
      .selectFrom('characters')
      .select('id')
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return [];
    }
    
    // Get active quests
    const characterQuests = await this.db
      .selectFrom('character_quests')
      .innerJoin('quests', 'quests.id', 'character_quests.quest_id')
      .select([
        'character_quests.quest_id as questId',
        'character_quests.active',
        'character_quests.completed',
        'character_quests.started_at as startedAt',
        'character_quests.completed_at as completedAt',
        'quests.name',
        'quests.description',
        'quests.type',
        'quests.exp_reward as expReward',
        'quests.gold_reward as goldReward',
        'quests.item_rewards as itemRewards'
      ])
      .where('character_quests.character_id', '=', character.id)
      .where('character_quests.active', '=', true)
      .execute();
    
    // Get objectives for each quest
    const activeQuests = await Promise.all(
      characterQuests.map(async (quest: any) => {
        const objectives = await this.getQuestObjectives(character.id, quest.questId);
        
        return {
          characterId: character.id,
          questId: quest.questId,
          active: quest.active,
          completed: quest.completed,
          startedAt: quest.startedAt,
          completedAt: quest.completedAt,
          name: quest.name,
          description: quest.description,
          type: quest.type,
          expReward: quest.expReward,
          goldReward: quest.goldReward,
          itemRewards: quest.itemRewards,
          objectives
        };
      })
    );
    
    return activeQuests;
  }

  /**
   * Get all available quests for a character
   * @param userId Telegram user ID
   * @returns Array of available quests
   */
  async getAvailableQuests(userId: number): Promise<Quest[]> {
    // Get character details
    const character = await this.db
      .selectFrom('characters')
      .select(['id', 'level', 'area_id as areaId'])
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return [];
    }
    
    // Get quests already accepted or completed
    const existingQuestIds = await this.db
      .selectFrom('character_quests')
      .select('quest_id')
      .where('character_id', '=', character.id)
      .execute();
    
    const existingIds = existingQuestIds.map((q: any) => q.quest_id);
    
    // Get quests that match level and area requirements
    const availableQuests = await this.db
      .selectFrom('quests')
      .selectAll()
      .where('level_requirement', '<=', character.level)
      .where((eb: any) => 
        eb.or([
          eb('area_id', '=', character.areaId),
          eb('area_id', 'is', null)
        ])
      )
      .whereNotIn('id', existingIds.length > 0 ? existingIds : [-1]) // Avoid empty IN clause
      .execute();
    
    // Filter quests that have unmet prerequisites
    const filteredQuests = await Promise.all(
      availableQuests.map(async (quest: any) => {
        // Check quest prerequisites
        if (quest.prerequisite_quest_ids && quest.prerequisite_quest_ids.length > 0) {
          const completedPrereqs = await this.db
            .selectFrom('character_quests')
            .select('quest_id')
            .where('character_id', '=', character.id)
            .where('completed', '=', true)
            .whereIn('quest_id', quest.prerequisite_quest_ids)
            .execute();
          
          // If not all prerequisites are completed, skip this quest
          if (completedPrereqs.length !== quest.prerequisite_quest_ids.length) {
            return null;
          }
        }
        
        // Map database columns to Quest interface
        return {
          id: quest.id,
          name: quest.name,
          description: quest.description,
          type: quest.type,
          levelRequirement: quest.level_requirement,
          expReward: quest.exp_reward,
          goldReward: quest.gold_reward,
          itemRewards: quest.item_rewards,
          areaId: quest.area_id,
          npcId: quest.npc_id,
          prerequisiteQuestIds: quest.prerequisite_quest_ids
        };
      })
    );
    
    // Remove null entries (quests with unmet prerequisites)
    return filteredQuests.filter((quest): quest is Quest => quest !== null);
  }

  /**
   * Get objectives for a quest with progress
   * @param characterId Character ID
   * @param questId Quest ID
   * @returns Array of quest objectives with progress
   */
  private async getQuestObjectives(characterId: number, questId: number): Promise<QuestObjective[]> {
    // Get quest objectives
    const objectives = await this.db
      .selectFrom('quest_objectives')
      .select([
        'id',
        'quest_id as questId',
        'description',
        'type',
        'target_id as targetId',
        'target'
      ])
      .where('quest_id', '=', questId)
      .execute();
    
    // Get progress for each objective
    const objectivesWithProgress = await Promise.all(
      objectives.map(async (objective: any) => {
        // Get progress from character_quest_objectives
        const progress = await this.db
          .selectFrom('character_quest_objectives')
          .select('progress')
          .where('character_id', '=', characterId)
          .where('quest_id', '=', questId)
          .where('objective_id', '=', objective.id)
          .executeTakeFirst();
        
        return {
          ...objective,
          progress: progress ? progress.progress : 0
        };
      })
    );
    
    return objectivesWithProgress;
  }

  /**
   * Accept a new quest
   * @param userId Telegram user ID
   * @param questId Quest ID
   * @returns Boolean indicating success
   */
  async acceptQuest(userId: number, questId: number): Promise<boolean> {
    // Get character ID
    const character = await this.db
      .selectFrom('characters')
      .select('id')
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return false;
    }
    
    // Check if quest exists and is not already accepted
    const existingQuest = await this.db
      .selectFrom('character_quests')
      .select('quest_id')
      .where('character_id', '=', character.id)
      .where('quest_id', '=', questId)
      .executeTakeFirst();
    
    if (existingQuest) {
      return false;
    }
    
    // Get quest details to verify requirements
    const quest = await this.db
      .selectFrom('quests')
      .selectAll()
      .where('id', '=', questId)
      .executeTakeFirst();
    
    if (!quest) {
      return false;
    }
    
    // Check level requirement
    const characterLevel = await this.db
      .selectFrom('characters')
      .select('level')
      .where('id', '=', character.id)
      .executeTakeFirst();
    
    if (!characterLevel || characterLevel.level < quest.level_requirement) {
      return false;
    }
    
    // Check prerequisites
    if (quest.prerequisite_quest_ids && quest.prerequisite_quest_ids.length > 0) {
      const completedPrereqs = await this.db
        .selectFrom('character_quests')
        .select('quest_id')
        .where('character_id', '=', character.id)
        .where('completed', '=', true)
        .whereIn('quest_id', quest.prerequisite_quest_ids)
        .execute();
      
      if (completedPrereqs.length !== quest.prerequisite_quest_ids.length) {
        return false;
      }
    }
    
    // Accept the quest
    await this.db
      .insertInto('character_quests')
      .values({
        character_id: character.id,
        quest_id: questId,
        active: true,
        completed: false,
        started_at: new Date(),
        completed_at: null
      })
      .execute();
    
    // Initialize objectives
    const objectives = await this.db
      .selectFrom('quest_objectives')
      .select('id')
      .where('quest_id', '=', questId)
      .execute();
    
    for (const objective of objectives) {
      await this.db
        .insertInto('character_quest_objectives')
        .values({
          character_id: character.id,
          quest_id: questId,
          objective_id: objective.id,
          progress: 0
        })
        .execute();
    }
    
    return true;
  }

  /**
   * Update quest objective progress
   * @param userId Telegram user ID
   * @param questId Quest ID
   * @param objectiveId Objective ID
   * @param progressAmount Amount to add to progress
   * @returns Updated progress and completion status
   */
  async updateQuestProgress(
    userId: number,
    questId: number,
    objectiveId: number,
    progressAmount: number = 1
  ): Promise<{ currentProgress: number; isCompleted: boolean }> {
    // Get character ID
    const character = await this.db
      .selectFrom('characters')
      .select('id')
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return { currentProgress: 0, isCompleted: false };
    }
    
    // Get current progress
    const currentObjective = await this.db
      .selectFrom('character_quest_objectives')
      .innerJoin('quest_objectives', 'quest_objectives.id', 'character_quest_objectives.objective_id')
      .select([
        'character_quest_objectives.progress',
        'quest_objectives.target'
      ])
      .where('character_quest_objectives.character_id', '=', character.id)
      .where('character_quest_objectives.quest_id', '=', questId)
      .where('character_quest_objectives.objective_id', '=', objectiveId)
      .executeTakeFirst();
    
    if (!currentObjective) {
      return { currentProgress: 0, isCompleted: false };
    }
    
    // Calculate new progress
    const newProgress = Math.min(currentObjective.progress + progressAmount, currentObjective.target);
    
    // Update progress
    await this.db
      .updateTable('character_quest_objectives')
      .set({ progress: newProgress })
      .where('character_id', '=', character.id)
      .where('quest_id', '=', questId)
      .where('objective_id', '=', objectiveId)
      .execute();
    
    // Check if objective is completed
    const isObjectiveCompleted = newProgress >= currentObjective.target;
    
    // Check if all objectives are completed
    let isQuestCompleted = false;
    
    if (isObjectiveCompleted) {
      const allObjectives = await this.db
        .selectFrom('character_quest_objectives')
        .innerJoin('quest_objectives', 'quest_objectives.id', 'character_quest_objectives.objective_id')
        .select([
          'character_quest_objectives.progress',
          'quest_objectives.target'
        ])
        .where('character_quest_objectives.character_id', '=', character.id)
        .where('character_quest_objectives.quest_id', '=', questId)
        .execute();
      
      isQuestCompleted = allObjectives.every((obj: any) => obj.progress >= obj.target);
      
      // If all objectives are completed, mark quest as completed
      if (isQuestCompleted) {
        await this.db
          .updateTable('character_quests')
          .set({
            active: false,
            completed: true,
            completed_at: new Date()
          })
          .where('character_id', '=', character.id)
          .where('quest_id', '=', questId)
          .execute();
        
        // Award quest rewards
        await this.awardQuestRewards(character.id, questId);
      }
    }
    
    return {
      currentProgress: newProgress,
      isCompleted: isQuestCompleted
    };
  }

  /**
   * Award quest rewards to character
   * @param characterId Character ID
   * @param questId Quest ID
   */
  private async awardQuestRewards(characterId: number, questId: number): Promise<void> {
    // Get quest rewards
    const quest = await this.db
      .selectFrom('quests')
      .select([
        'exp_reward as expReward',
        'gold_reward as goldReward',
        'item_rewards as itemRewards'
      ])
      .where('id', '=', questId)
      .executeTakeFirst();
    
    if (!quest) {
      return;
    }
    
    // Get character current stats
    const character = await this.db
      .selectFrom('characters')
      .select(['experience', 'level'])
      .where('id', '=', characterId)
      .executeTakeFirst();
    
    if (!character) {
      return;
    }
    
    // Award experience
    if (quest.expReward > 0) {
      // Calculate level up
      let newExp = character.experience + quest.expReward;
      let newLevel = character.level;
      
      // Check for level up
      const expForNextLevel = character.level * 100;
      
      if (newExp >= expForNextLevel) {
        newLevel += 1;
        newExp -= expForNextLevel;
      }
      
      // Update character
      await this.db
        .updateTable('characters')
        .set({
          experience: newExp,
          level: newLevel
        })
        .where('id', '=', characterId)
        .execute();
    }
    
    // Award item rewards
    if (quest.itemRewards && quest.itemRewards.length > 0) {
      for (const itemId of quest.itemRewards) {
        // Check if item already exists in inventory
        const existingItem = await this.db
          .selectFrom('inventory_items')
          .select('quantity')
          .where('character_id', '=', characterId)
          .where('item_id', '=', itemId)
          .executeTakeFirst();
        
        if (existingItem) {
          // Increase quantity
          await this.db
            .updateTable('inventory_items')
            .set({ quantity: existingItem.quantity + 1 })
            .where('character_id', '=', characterId)
            .where('item_id', '=', itemId)
            .execute();
        } else {
          // Add new item
          await this.db
            .insertInto('inventory_items')
            .values({
              character_id: characterId,
              item_id: itemId,
              quantity: 1,
              equipped: false
            })
            .execute();
        }
      }
    }
  }
}