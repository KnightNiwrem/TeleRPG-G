import { jest } from '@jest/globals';

// Mock CharacterService
export const CharacterService = jest.fn().mockImplementation(() => ({
  getCharacter: jest.fn(),
  createCharacter: jest.fn(),
  addExperience: jest.fn(),
  updateHealth: jest.fn(),
  updateMana: jest.fn(),
  updateEnergy: jest.fn(),
  restoreResources: jest.fn(),
  handleBattleRewards: jest.fn(),
}));