import { jest } from '@jest/globals';
import '../mocks';
import { AreaService } from '../../services/AreaService.js';
import { CharacterService } from '../../services/CharacterService.js';
import { createMockDb } from '../utils/mockUtils.js';
import { AreaType } from '../../core/enums.js';

// Mock the CharacterService
jest.mock('../../services/CharacterService');

describe('AreaService', () => {
  let areaService: AreaService;
  let mockDb: ReturnType<typeof createMockDb>;
  let mockCharacterService: jest.Mocked<CharacterService>;

  beforeEach(() => {
    mockDb = createMockDb();
    mockCharacterService = new CharacterService() as jest.Mocked<CharacterService>;
    areaService = new AreaService(mockDb, mockCharacterService);
  });

  describe('getAllAreas', () => {
    test('should return empty array when no areas found', async () => {
      // Mock database to return empty array
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await areaService.getAllAreas();
      
      expect(result).toEqual([]);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('areas');
      expect(mockDb.selectAll).toHaveBeenCalled();
    });

    test('should return mapped areas array when areas found', async () => {
      // Mock database to return areas
      mockDb.execute.mockResolvedValueOnce([
        { 
          id: 1, 
          name: 'Forest', 
          description: 'A dense forest', 
          type: AreaType.WILDERNESS, 
          level_requirement: 1, 
          parent_area_id: null 
        },
        { 
          id: 2, 
          name: 'Cave', 
          description: 'A dark cave', 
          type: AreaType.DUNGEON, 
          level_requirement: 3, 
          parent_area_id: 1 
        }
      ]);

      const result = await areaService.getAllAreas();
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: 'Forest',
        description: 'A dense forest',
        type: AreaType.WILDERNESS,
        levelRequirement: 1,
        parentAreaId: null
      });
      expect(result[1]).toEqual({
        id: 2,
        name: 'Cave',
        description: 'A dark cave',
        type: AreaType.DUNGEON,
        levelRequirement: 3,
        parentAreaId: 1
      });
      expect(mockDb.selectFrom).toHaveBeenCalledWith('areas');
      expect(mockDb.selectAll).toHaveBeenCalled();
    });
  });

  describe('getArea', () => {
    test('should return null when area not found', async () => {
      // Mock database to return null
      mockDb.executeTakeFirst.mockResolvedValueOnce(null);

      const result = await areaService.getArea(999);
      
      expect(result).toBeNull();
      expect(mockDb.selectFrom).toHaveBeenCalledWith('areas');
      expect(mockDb.where).toHaveBeenCalledWith('id', '=', 999);
    });

    test('should return area when found', async () => {
      // Mock database to return area
      mockDb.executeTakeFirst.mockResolvedValueOnce({
        id: 1,
        name: 'Forest',
        description: 'A dense forest',
        type: AreaType.WILDERNESS,
        level_requirement: 1,
        parent_area_id: null
      });

      const result = await areaService.getArea(1);
      
      expect(result).toEqual({
        id: 1,
        name: 'Forest',
        description: 'A dense forest',
        type: AreaType.WILDERNESS,
        levelRequirement: 1,
        parentAreaId: null
      });
      expect(mockDb.selectFrom).toHaveBeenCalledWith('areas');
      expect(mockDb.where).toHaveBeenCalledWith('id', '=', 1);
    });
  });

  describe('getAvailableAreas', () => {
    test('should return empty array when character not found', async () => {
      // Mock database to return null for character
      mockDb.executeTakeFirst.mockResolvedValueOnce(null);

      const result = await areaService.getAvailableAreas(123);
      
      expect(result).toEqual([]);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('characters');
      expect(mockDb.select).toHaveBeenCalledWith(['id', 'level']);
      expect(mockDb.where).toHaveBeenCalledWith('user_id', '=', 123);
    });

    test('should return areas matching character level', async () => {
      // Mock database to return character and areas
      mockDb.executeTakeFirst.mockResolvedValueOnce({ id: 1, level: 3 });
      mockDb.execute.mockResolvedValueOnce([
        { 
          id: 1, 
          name: 'Forest', 
          description: 'A dense forest', 
          type: AreaType.WILDERNESS, 
          level_requirement: 1, 
          parent_area_id: null 
        },
        { 
          id: 2, 
          name: 'Cave', 
          description: 'A dark cave', 
          type: AreaType.DUNGEON, 
          level_requirement: 3, 
          parent_area_id: 1 
        }
      ]);

      const result = await areaService.getAvailableAreas(123);
      
      expect(result).toHaveLength(2);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('characters');
      expect(mockDb.select).toHaveBeenCalledWith(['id', 'level']);
      expect(mockDb.where).toHaveBeenCalledWith('level_requirement', '<=', 3);
    });
  });

  describe('moveCharacterToArea', () => {
    test('should return false if area not found', async () => {
      // Mock getArea to return null
      jest.spyOn(areaService, 'getArea').mockResolvedValueOnce(null);

      const result = await areaService.moveCharacterToArea(123, 999);
      
      expect(result).toBe(false);
      expect(mockDb.updateTable).not.toHaveBeenCalled();
    });

    test('should return false if update fails', async () => {
      // Mock getArea to return area and update to return empty array
      jest.spyOn(areaService, 'getArea').mockResolvedValueOnce({
        id: 1,
        name: 'Forest',
        description: 'A dense forest',
        type: AreaType.WILDERNESS,
        levelRequirement: 1,
        parentAreaId: null
      });
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await areaService.moveCharacterToArea(123, 1);
      
      expect(result).toBe(false);
      expect(mockDb.updateTable).toHaveBeenCalledWith('characters');
      expect(mockDb.set).toHaveBeenCalledWith({ area_id: 1 });
      expect(mockDb.where).toHaveBeenCalledWith('user_id', '=', 123);
    });

    test('should return true if update succeeds', async () => {
      // Mock getArea to return area and update to return non-empty array
      jest.spyOn(areaService, 'getArea').mockResolvedValueOnce({
        id: 1,
        name: 'Forest',
        description: 'A dense forest',
        type: AreaType.WILDERNESS,
        levelRequirement: 1,
        parentAreaId: null
      });
      mockDb.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await areaService.moveCharacterToArea(123, 1);
      
      expect(result).toBe(true);
      expect(mockDb.updateTable).toHaveBeenCalledWith('characters');
      expect(mockDb.set).toHaveBeenCalledWith({ area_id: 1 });
      expect(mockDb.where).toHaveBeenCalledWith('user_id', '=', 123);
    });
  });

  describe('getConnectedAreas', () => {
    test('should return only child areas if no parent area', async () => {
      // Mock getArea to return area with no parent and execute to return child areas
      jest.spyOn(areaService, 'getArea').mockResolvedValueOnce({
        id: 1,
        name: 'Forest',
        description: 'A dense forest',
        type: AreaType.WILDERNESS,
        levelRequirement: 1,
        parentAreaId: null
      });
      mockDb.execute.mockResolvedValueOnce([
        {
          id: 2,
          name: 'Cave',
          description: 'A dark cave',
          type: AreaType.DUNGEON,
          level_requirement: 3,
          parent_area_id: 1
        }
      ]);

      const result = await areaService.getConnectedAreas(1);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('areas');
      expect(mockDb.where).toHaveBeenCalledWith('parent_area_id', '=', 1);
    });

    test('should return child and parent areas', async () => {
      // Mock getArea to return area with parent
      jest.spyOn(areaService, 'getArea')
        .mockResolvedValueOnce({
          id: 2,
          name: 'Cave',
          description: 'A dark cave',
          type: AreaType.DUNGEON,
          levelRequirement: 3,
          parentAreaId: 1
        })
        .mockResolvedValueOnce({
          id: 1,
          name: 'Forest',
          description: 'A dense forest',
          type: AreaType.WILDERNESS,
          levelRequirement: 1,
          parentAreaId: null
        });
      
      // Mock execute to return child areas
      mockDb.execute.mockResolvedValueOnce([
        {
          id: 3,
          name: 'Deep Cave',
          description: 'A deeper part of the cave',
          type: AreaType.DUNGEON,
          level_requirement: 5,
          parent_area_id: 2
        }
      ]);

      const result = await areaService.getConnectedAreas(2);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(3); // Child area
      expect(result[1].id).toBe(1); // Parent area
    });
  });

  describe('getEnemiesInArea', () => {
    test('should return empty array if character not found', async () => {
      // Mock getCharacter to return null
      mockCharacterService.getCharacter = jest.fn().mockResolvedValueOnce(null);

      const result = await areaService.getEnemiesInArea(123);
      
      expect(result).toEqual([]);
      expect(mockCharacterService.getCharacter).toHaveBeenCalledWith(123);
    });

    test('should return monsters in character area', async () => {
      // Mock getCharacter to return character
      mockCharacterService.getCharacter = jest.fn().mockResolvedValueOnce({
        id: 1,
        areaId: 2
      });

      // Mock database to return monsters
      mockDb.execute.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Goblin',
          type: 'MONSTER',
          level: 1,
          max_hp: 20,
          current_hp: 20,
          area_id: 2,
          exp_reward: 5,
          gold_reward: 2,
          item_drop_rate: 0.1
        },
        {
          id: 2,
          name: 'Wolf',
          type: 'MONSTER',
          level: 2,
          max_hp: 30,
          current_hp: 30,
          area_id: 2,
          exp_reward: 10,
          gold_reward: 3,
          item_drop_rate: 0.2
        }
      ]);

      const result = await areaService.getEnemiesInArea(123);
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Goblin');
      expect(result[1].name).toBe('Wolf');
      expect(mockDb.selectFrom).toHaveBeenCalledWith('monsters');
      expect(mockDb.where).toHaveBeenCalledWith('area_id', '=', 2);
    });
  });

  describe('describeArea', () => {
    test('should throw error if character not found', async () => {
      // Mock getCharacter to return null
      mockCharacterService.getCharacter = jest.fn().mockResolvedValueOnce(null);

      await expect(areaService.describeArea(123)).rejects.toThrow('Character not found');
    });

    test('should throw error if area not found', async () => {
      // Mock getCharacter to return character
      mockCharacterService.getCharacter = jest.fn().mockResolvedValueOnce({
        id: 1,
        areaId: 999
      });

      // Mock getArea to return null
      jest.spyOn(areaService, 'getArea').mockResolvedValueOnce(null);

      await expect(areaService.describeArea(123)).rejects.toThrow('Area not found');
    });

    test('should return area description with exits, NPCs, monsters, and players', async () => {
      // Mock getCharacter to return character
      mockCharacterService.getCharacter = jest.fn().mockResolvedValueOnce({
        id: 1,
        userId: 123,
        areaId: 1
      });

      // Mock getArea to return area
      jest.spyOn(areaService, 'getArea').mockResolvedValueOnce({
        id: 1,
        name: 'Forest',
        description: 'A dense forest',
        type: AreaType.WILDERNESS,
        levelRequirement: 1,
        parentAreaId: null
      });

      // Mock getConnectedAreas
      jest.spyOn(areaService, 'getConnectedAreas').mockResolvedValueOnce([
        {
          id: 2,
          name: 'Cave',
          description: 'A dark cave',
          type: AreaType.DUNGEON,
          levelRequirement: 3,
          parentAreaId: 1
        }
      ]);

      // Mock database queries
      mockDb.execute
        .mockResolvedValueOnce([ // NPCs
          { name: 'Merchant' },
          { name: 'Guard' }
        ])
        .mockResolvedValueOnce([ // Monsters
          { name: 'Wolf' },
          { name: 'Bear' }
        ])
        .mockResolvedValueOnce([ // Other players
          { name: 'Player1' },
          { name: 'Player2' }
        ]);

      const result = await areaService.describeArea(123);
      
      expect(result).toEqual({
        areaName: 'Forest',
        description: 'A dense forest',
        exits: ['Cave'],
        npcs: ['Merchant', 'Guard'],
        monsters: ['Wolf', 'Bear'],
        players: ['Player1', 'Player2']
      });
      expect(mockDb.selectFrom).toHaveBeenCalledWith('npcs');
      expect(mockDb.selectFrom).toHaveBeenCalledWith('monsters');
      expect(mockDb.selectFrom).toHaveBeenCalledWith('characters');
    });
  });
});