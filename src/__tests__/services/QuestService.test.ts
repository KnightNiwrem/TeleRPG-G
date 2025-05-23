import { jest } from '@jest/globals';
import '../mocks';
import { QuestService } from '../../services/QuestService.js';
import { createMockDb } from '../utils/mockUtils.js';

describe('QuestService', () => {
  let questService: QuestService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = createMockDb();
    questService = new QuestService(mockDb);
  });

  describe('acceptQuest', () => {
    test('should return false if character not found', async () => {
      // Mock character not found
      mockDb.executeTakeFirst.mockResolvedValueOnce(null);

      const result = await questService.acceptQuest(123, 1);
      
      expect(result).toBe(false);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('characters');
      expect(mockDb.select).toHaveBeenCalledWith('id');
      expect(mockDb.where).toHaveBeenCalledWith('user_id', '=', 123);
    });

    test('should return false if quest already accepted', async () => {
      // Mock character found
      mockDb.executeTakeFirst
        .mockResolvedValueOnce({ id: 1 }) // For character
        .mockResolvedValueOnce({ quest_id: 1 }); // For existing quest

      const result = await questService.acceptQuest(123, 1);
      
      expect(result).toBe(false);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('characters');
      expect(mockDb.selectFrom).toHaveBeenCalledWith('character_quests');
    });

    test('should return false if quest not found', async () => {
      // Mock character found, quest not already accepted, but quest not found
      mockDb.executeTakeFirst
        .mockResolvedValueOnce({ id: 1 }) // For character
        .mockResolvedValueOnce(null) // For existing quest (not found)
        .mockResolvedValueOnce(null); // For quest (not found)

      const result = await questService.acceptQuest(123, 1);
      
      expect(result).toBe(false);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('quests');
      expect(mockDb.selectAll).toHaveBeenCalled();
    });

    test('should return false if level requirement not met', async () => {
      // Mock character found, quest not already accepted, quest found, but level requirement not met
      mockDb.executeTakeFirst
        .mockResolvedValueOnce({ id: 1 }) // For character
        .mockResolvedValueOnce(null) // For existing quest (not found)
        .mockResolvedValueOnce({ id: 1, level_requirement: 10 }) // For quest
        .mockResolvedValueOnce({ level: 5 }); // For character level (too low)

      const result = await questService.acceptQuest(123, 1);
      
      expect(result).toBe(false);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('characters');
      expect(mockDb.select).toHaveBeenCalledWith('level');
    });

    test('should return false if prerequisites not met', async () => {
      // Mock character found, quest not already accepted, quest found, level met, but prerequisites not met
      mockDb.executeTakeFirst
        .mockResolvedValueOnce({ id: 1 }) // For character
        .mockResolvedValueOnce(null) // For existing quest (not found)
        .mockResolvedValueOnce({ id: 1, level_requirement: 5, prerequisite_quest_ids: [2, 3] }) // For quest
        .mockResolvedValueOnce({ level: 5 }); // For character level (met)
      
      mockDb.execute
        .mockResolvedValueOnce([{ quest_id: 2 }]); // Only one prerequisite completed

      const result = await questService.acceptQuest(123, 1);
      
      expect(result).toBe(false);
      expect(mockDb.whereIn).toHaveBeenCalledWith('quest_id', [2, 3]);
      expect(mockDb.where).toHaveBeenCalledWith('completed', '=', true);
    });

    test('should return true if quest accepted successfully', async () => {
      // Mock all checks passing
      mockDb.executeTakeFirst
        .mockResolvedValueOnce({ id: 1 }) // For character
        .mockResolvedValueOnce(null) // For existing quest (not found)
        .mockResolvedValueOnce({ id: 1, level_requirement: 5, prerequisite_quest_ids: null }) // For quest
        .mockResolvedValueOnce({ level: 5 }); // For character level (met)
      
      mockDb.execute
        .mockResolvedValueOnce([{ id: 101 }, { id: 102 }]); // Quest objectives

      const result = await questService.acceptQuest(123, 1);
      
      expect(result).toBe(true);
      expect(mockDb.insertInto).toHaveBeenCalledWith('character_quests');
      expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
        character_id: 1,
        quest_id: 1,
        active: true,
        completed: false
      }));
      expect(mockDb.insertInto).toHaveBeenCalledWith('character_quest_objectives');
    });
  });

  describe('updateQuestProgress', () => {
    test('should return zero progress if character not found', async () => {
      // Mock character not found
      mockDb.executeTakeFirst.mockResolvedValueOnce(null);

      const result = await questService.updateQuestProgress(123, 1, 1);
      
      expect(result).toEqual({ currentProgress: 0, isCompleted: false });
      expect(mockDb.selectFrom).toHaveBeenCalledWith('characters');
    });

    test('should return zero progress if objective not found', async () => {
      // Mock character found but objective not found
      mockDb.executeTakeFirst
        .mockResolvedValueOnce({ id: 1 }) // For character
        .mockResolvedValueOnce(null); // For objective (not found)

      const result = await questService.updateQuestProgress(123, 1, 1);
      
      expect(result).toEqual({ currentProgress: 0, isCompleted: false });
      expect(mockDb.innerJoin).toHaveBeenCalledWith(
        'quest_objectives', 
        'quest_objectives.id', 
        'character_quest_objectives.objective_id'
      );
    });

    test('should update progress but not complete if target not reached', async () => {
      // Mock character found, objective found, progress updated but not completed
      mockDb.executeTakeFirst
        .mockResolvedValueOnce({ id: 1 }) // For character
        .mockResolvedValueOnce({ progress: 5, target: 10 }); // For objective (not completed)

      const result = await questService.updateQuestProgress(123, 1, 1, 2);
      
      expect(result).toEqual({ currentProgress: 7, isCompleted: false });
      expect(mockDb.updateTable).toHaveBeenCalledWith('character_quest_objectives');
      expect(mockDb.set).toHaveBeenCalledWith({ progress: 7 });
    });

    test('should complete quest when all objectives completed', async () => {
      // Mock character found, objective found, progress updated and completed
      mockDb.executeTakeFirst
        .mockResolvedValueOnce({ id: 1 }) // For character
        .mockResolvedValueOnce({ progress: 9, target: 10 }); // For objective (about to be completed)
      
      mockDb.execute
        .mockResolvedValueOnce([
          { progress: 10, target: 10 }, // First objective complete
          { progress: 5, target: 5 }    // Second objective complete
        ]);

      const result = await questService.updateQuestProgress(123, 1, 1, 2);
      
      expect(result).toEqual({ currentProgress: 10, isCompleted: true });
      expect(mockDb.updateTable).toHaveBeenCalledWith('character_quests');
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
        active: false,
        completed: true
      }));
    });
  });
});