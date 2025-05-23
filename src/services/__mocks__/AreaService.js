import { jest } from '@jest/globals';

// Mock AreaService
export const AreaService = jest.fn().mockImplementation(() => ({
  getAllAreas: jest.fn(),
  getArea: jest.fn(),
  getConnectedAreas: jest.fn(),
  getNPCs: jest.fn(),
  getMonsters: jest.fn(),
}));