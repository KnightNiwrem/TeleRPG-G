import { jest } from '@jest/globals';
import '../mocks';
import { StateService } from '../../services/StateService.js';
import { createMockDb } from '../utils/mockUtils.js';

// Mock the db instance from kysely
jest.mock('../../database/kysely.js', () => {
  const mockDb = createMockDb();
  return { db: mockDb };
});

describe('StateService', () => {
  let stateService: StateService;
  let mockDb: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Get the mock db from the mocked module
    mockDb = require('../../database/kysely.js').db;
    
    // Create a new instance of StateService for each test
    stateService = new StateService();
  });

  describe('setUserState', () => {
    test('should set user state in the database', async () => {
      // Mock data
      const userId = 123;
      const state = {
        action: 'exploring',
        step: 'initial',
        data: { foo: 'bar' },
        timestamp: Date.now(),
      };

      // Mock upsert operation (postgres doesn't have true upsert, we use transaction)
      mockDb.updateTable.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.execute.mockResolvedValueOnce([]);
      mockDb.executeTakeFirst.mockResolvedValueOnce(null); // No affected rows from update
      mockDb.insertInto.mockReturnThis();
      mockDb.values.mockReturnThis();
      mockDb.execute.mockResolvedValueOnce([{ player_id: userId }]);

      // Call the method
      await stateService.setUserState(userId, state);

      // Assert interactions
      expect(mockDb.updateTable).toHaveBeenCalledWith('player_interaction_states');
      expect(mockDb.insertInto).toHaveBeenCalledWith('player_interaction_states');
      // Check that values contains appropriate data
      expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
        player_id: userId,
        current_action: 'exploring',
        action_context: expect.objectContaining({
          step: 'initial',
          data: { foo: 'bar' }
        })
      }));
    });
  });

  describe('getUserState', () => {
    test('should get user state from the database', async () => {
      // Mock data
      const userId = 123;
      const dbResult = {
        player_id: userId,
        current_action: 'exploring',
        action_context: {
          step: 'initial',
          data: { foo: 'bar' },
          timestamp: Date.now(),
        },
        expires_at: new Date(Date.now() + 3600000),
      };

      // Setup mocks
      mockDb.selectFrom.mockReturnThis();
      mockDb.selectAll.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.executeTakeFirst.mockResolvedValueOnce(dbResult);

      // Call the method
      const result = await stateService.getUserState(userId);

      // Assert
      expect(mockDb.selectFrom).toHaveBeenCalledWith('player_interaction_states');
      expect(mockDb.where).toHaveBeenCalledWith('player_id', '=', userId);
      expect(result).toEqual({
        action: 'exploring',
        step: 'initial',
        data: { foo: 'bar' },
        timestamp: expect.any(Number),
      });
    });

    test('should return null if no state is found', async () => {
      // Mock no result found
      mockDb.selectFrom.mockReturnThis();
      mockDb.selectAll.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.executeTakeFirst.mockResolvedValueOnce(null);

      // Call the method
      const result = await stateService.getUserState(123);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('clearUserState', () => {
    test('should delete user state from the database', async () => {
      // Mock data
      const userId = 123;

      // Setup mocks
      mockDb.deleteFrom.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.execute.mockResolvedValueOnce([]);

      // Call the method
      await stateService.clearUserState(userId);

      // Assert
      expect(mockDb.deleteFrom).toHaveBeenCalledWith('player_interaction_states');
      expect(mockDb.where).toHaveBeenCalledWith('player_id', '=', userId);
    });
  });

  describe('updateUserState', () => {
    test('should update existing state in the database', async () => {
      // Mock data
      const userId = 123;
      const updates = {
        action: 'in_combat',
        enemyId: 456,
      };

      // Mock existing state
      const existingState = {
        action: 'exploring',
        step: 'initial',
        data: { foo: 'bar' },
        timestamp: Date.now() - 1000, // Earlier timestamp
      };

      // Setup mocks for getUserState and setUserState
      mockDb.selectFrom.mockReturnThis();
      mockDb.selectAll.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.executeTakeFirst.mockResolvedValueOnce({
        player_id: userId,
        current_action: existingState.action,
        action_context: {
          step: existingState.step,
          data: existingState.data,
          timestamp: existingState.timestamp,
        },
      });

      // Mock for update
      mockDb.updateTable.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.execute.mockResolvedValueOnce([{ updated: true }]);

      // Call the method
      await stateService.updateUserState(userId, updates);

      // Assert
      expect(mockDb.selectFrom).toHaveBeenCalledWith('player_interaction_states');
      expect(mockDb.updateTable).toHaveBeenCalledWith('player_interaction_states');
      // Check that the updated state has merged properties
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
        current_action: 'in_combat',
        action_context: expect.objectContaining({
          step: 'initial',
          data: { foo: 'bar' },
          enemyId: 456,
          timestamp: expect.any(Number),
        })
      }));
    });

    test('should create new state if none exists', async () => {
      // Mock data
      const userId = 123;
      const updates = {
        action: 'in_combat',
        enemyId: 456,
      };

      // Setup mock for getUserState (not found)
      mockDb.selectFrom.mockReturnThis();
      mockDb.selectAll.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.executeTakeFirst.mockResolvedValueOnce(null);

      // Mock for insert
      mockDb.insertInto.mockReturnThis();
      mockDb.values.mockReturnThis();
      mockDb.execute.mockResolvedValueOnce([{ player_id: userId }]);

      // Call the method
      await stateService.updateUserState(userId, updates);

      // Assert
      expect(mockDb.insertInto).toHaveBeenCalledWith('player_interaction_states');
      expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
        player_id: userId,
        current_action: 'in_combat',
        action_context: expect.objectContaining({
          step: 'initial',
          enemyId: 456,
          timestamp: expect.any(Number),
        })
      }));
    });
  });

  describe('getState', () => {
    test('should return formatted state with expiration data', async () => {
      // Mock data
      const userId = 123;
      const now = Date.now();
      const expiresAt = new Date(now + 3600 * 1000); // 1 hour in the future

      // Setup mock for getUserState
      mockDb.selectFrom.mockReturnThis();
      mockDb.selectAll.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.executeTakeFirst.mockResolvedValueOnce({
        player_id: userId,
        current_action: 'exploring',
        action_context: {
          step: 'initial',
          data: { foo: 'bar' },
        },
        expires_at: expiresAt,
      });

      // Call the method
      const result = await stateService.getState(userId);

      // Assert
      expect(mockDb.selectFrom).toHaveBeenCalledWith('player_interaction_states');
      expect(result).toEqual({
        currentAction: 'exploring',
        actionContext: { foo: 'bar' },
        expiresAt: expiresAt.getTime(),
      });
    });

    test('should return null values if no state is found', async () => {
      // Setup mock for getUserState (not found)
      mockDb.selectFrom.mockReturnThis();
      mockDb.selectAll.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.executeTakeFirst.mockResolvedValueOnce(null);

      // Call the method
      const result = await stateService.getState(123);

      // Assert
      expect(result).toEqual({
        currentAction: null,
        actionContext: null,
        expiresAt: null,
      });
    });
  });

  describe('setState', () => {
    test('should set state with action and context', async () => {
      // Mock data
      const userId = 123;
      const action = 'AWAITING_TARGET';
      const context = { targetId: 456 };

      // Mock for setUserState
      mockDb.updateTable.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.execute.mockResolvedValueOnce([]);
      mockDb.executeTakeFirst.mockResolvedValueOnce(null);
      mockDb.insertInto.mockReturnThis();
      mockDb.values.mockReturnThis();
      mockDb.execute.mockResolvedValueOnce([{ player_id: userId }]);

      // Call the method
      await stateService.setState(userId, action, context);

      // Assert
      expect(mockDb.insertInto).toHaveBeenCalledWith('player_interaction_states');
      expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
        player_id: userId,
        current_action: action,
        action_context: expect.objectContaining({
          step: 'initial',
          data: context,
        })
      }));
    });
  });

  describe('close', () => {
    test('should not throw errors when closing', async () => {
      await expect(stateService.close()).resolves.toBeUndefined();
    });
  });
});