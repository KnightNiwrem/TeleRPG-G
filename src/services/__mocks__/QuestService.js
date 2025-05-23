import { jest } from '@jest/globals';

// Mock QuestService
export const QuestService = jest.fn().mockImplementation(() => ({
  getAllQuests: jest.fn(),
  getQuest: jest.fn(),
  acceptQuest: jest.fn(),
  getCharacterQuests: jest.fn(),
  checkQuestCompletion: jest.fn(),
  completeQuest: jest.fn(),
}));