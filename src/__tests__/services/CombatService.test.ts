import { jest } from '@jest/globals';
import '../mocks';
import { CombatService } from '../../services/CombatService.js';
import { createMockDb, createMockRedis } from '../utils/mockUtils.js';
import { CharacterService } from '../../services/CharacterService.js';
import { AreaService } from '../../services/AreaService.js';
import { EntityType, ClassType } from '../../core/enums.js';

// Mock the CharacterService and AreaService
jest.mock('../../services/CharacterService.js');
jest.mock('../../services/AreaService.js');

describe('CombatService', () => {
  let combatService: CombatService;
  let mockDb: any;
  let mockRedis: any;
  let mockCharacterService: jest.Mocked<CharacterService>;
  let mockAreaService: jest.Mocked<AreaService>;

  beforeEach(() => {
    mockDb = createMockDb();
    mockRedis = createMockRedis();
    mockCharacterService = new CharacterService() as jest.Mocked<CharacterService>;
    mockAreaService = new AreaService() as jest.Mocked<AreaService>;
    
    combatService = new CombatService(
      mockDb,
      mockRedis as any,
      mockCharacterService,
      mockAreaService
    );
  });

  describe('isInCombat', () => {
    test('should return false if combat state does not exist', async () => {
      mockRedis.exists.mockResolvedValueOnce(0);
      
      const result = await combatService.isInCombat(123);
      
      expect(result).toBe(false);
      expect(mockRedis.exists).toHaveBeenCalled();
    });

    test('should return true if combat state exists', async () => {
      mockRedis.exists.mockResolvedValueOnce(1);
      
      const result = await combatService.isInCombat(123);
      
      expect(result).toBe(true);
      expect(mockRedis.exists).toHaveBeenCalled();
    });
  });

  describe('initiateCombat', () => {
    test('should return failure if already in combat', async () => {
      // Mock isInCombat to return true
      mockRedis.exists.mockResolvedValueOnce(1);
      
      const result = await combatService.initiateCombat(123, 'Goblin');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('already in combat');
    });

    test('should return failure if enemy not found', async () => {
      // Mock isInCombat to return false
      mockRedis.exists.mockResolvedValueOnce(0);
      
      // Mock findEnemyByName to return null
      jest.spyOn(combatService as any, 'findEnemyByName').mockResolvedValueOnce(null);
      
      const result = await combatService.initiateCombat(123, 'NonExistentEnemy');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Could not find');
    });

    test('should return failure if character not found', async () => {
      // Mock isInCombat to return false
      mockRedis.exists.mockResolvedValueOnce(0);
      
      // Mock findEnemyByName to return an enemy
      jest.spyOn(combatService as any, 'findEnemyByName').mockResolvedValueOnce({
        id: 1,
        name: 'Goblin',
        type: EntityType.MONSTER,
        level: 1,
        maxHp: 20,
        currentHp: 20
      });
      
      // Mock getCharacter to return null
      mockCharacterService.getCharacter = jest.fn().mockResolvedValueOnce(null);
      
      const result = await combatService.initiateCombat(123, 'Goblin');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Error retrieving character data');
    });

    test('should successfully initiate combat', async () => {
      // Mock isInCombat to return false
      mockRedis.exists.mockResolvedValueOnce(0);
      
      // Mock findEnemyByName to return an enemy
      jest.spyOn(combatService as any, 'findEnemyByName').mockResolvedValueOnce({
        id: 1,
        name: 'Goblin',
        type: EntityType.MONSTER,
        level: 1,
        maxHp: 20,
        currentHp: 20
      });
      
      // Mock getCharacter to return a character
      mockCharacterService.getCharacter = jest.fn().mockResolvedValueOnce({
        id: 1,
        userId: 123,
        name: 'Hero',
        type: EntityType.CHARACTER,
        class: ClassType.WARRIOR,
        level: 1,
        maxHp: 50,
        currentHp: 50,
        maxSp: 20,
        currentSp: 20,
        strength: 10,
        intelligence: 5,
        dexterity: 7,
        wisdom: 6,
        vitality: 8,
        experience: 0,
        areaId: 1
      });
      
      // Mock startCombat
      jest.spyOn(combatService as any, 'startCombat').mockResolvedValueOnce(undefined);
      
      const result = await combatService.initiateCombat(123, 'Goblin');
      
      expect(result.success).toBe(true);
      expect(result.character).toBeDefined();
      expect(result.enemy).toBeDefined();
      expect(result.keyboard).toBeDefined();
    });
  });

  describe('processPlayerAttack', () => {
    test('should throw error if not in combat', async () => {
      // Mock getCombatState to return null
      jest.spyOn(combatService as any, 'getCombatState').mockResolvedValueOnce(null);
      
      await expect(combatService.processPlayerAttack(123)).rejects.toThrow('Not in combat');
    });

    test('should throw error if not player turn', async () => {
      // Mock getCombatState to return a state with enemy turn
      jest.spyOn(combatService as any, 'getCombatState').mockResolvedValueOnce({
        character: { id: 1, strength: 10, dexterity: 5 },
        enemy: { id: 2, currentHp: 20 },
        turn: 'enemy',
        round: 1
      });
      
      await expect(combatService.processPlayerAttack(123)).rejects.toThrow('Not player\'s turn');
    });

    test('should successfully process player attack', async () => {
      // Mock random for deterministic testing
      const originalRandom = global.Math.random;
      global.Math.random = jest.fn(() => 0.3) as any;
      
      // Mock getCombatState to return valid combat state
      jest.spyOn(combatService as any, 'getCombatState').mockResolvedValueOnce({
        character: { 
          id: 1,
          strength: 10, 
          dexterity: 5 
        },
        enemy: { 
          id: 2,
          name: 'Goblin',
          currentHp: 20,
          maxHp: 20,
          expReward: 10
        },
        turn: 'player',
        round: 1
      });
      
      // Mock redis.set for state update
      mockRedis.set = jest.fn().mockResolvedValueOnce('OK');
      
      const result = await combatService.processPlayerAttack(123);
      
      // Restore random
      global.Math.random = originalRandom;
      
      expect(result.state.enemy.currentHp).toBeLessThan(20);
      expect(result.state.turn).toBe('enemy');
      expect(result.message).toContain('hit the Goblin for');
    });

    test('should handle defeating the enemy', async () => {
      // Mock random for deterministic testing
      const originalRandom = global.Math.random;
      global.Math.random = jest.fn(() => 0.3) as any;
      
      // Mock getCombatState to return a combat state where enemy will be defeated
      jest.spyOn(combatService as any, 'getCombatState').mockResolvedValueOnce({
        character: { 
          id: 1,
          strength: 50, // High strength to guarantee defeating the enemy
          dexterity: 5 
        },
        enemy: { 
          id: 2,
          name: 'Goblin',
          currentHp: 5, // Low HP to be defeated
          maxHp: 20,
          expReward: 10
        },
        turn: 'player',
        round: 1
      });
      
      // Mock endCombat
      jest.spyOn(combatService as any, 'endCombat').mockResolvedValueOnce(undefined);
      
      // Mock handleBattleRewards
      mockCharacterService.handleBattleRewards = jest.fn().mockResolvedValueOnce(undefined);
      
      const result = await combatService.processPlayerAttack(123);
      
      // Restore random
      global.Math.random = originalRandom;
      
      expect(result.state.enemy.currentHp).toBe(0);
      expect(result.message).toContain('defeated the Goblin');
      expect(mockCharacterService.addExperience).toHaveBeenCalledWith(1, 10);
    });
  });
});