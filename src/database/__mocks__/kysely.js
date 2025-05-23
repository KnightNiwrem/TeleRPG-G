// Mock for the database module
import { jest } from '@jest/globals';

export const db = {
  selectFrom: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  updateTable: jest.fn().mockReturnThis(),
  insertInto: jest.fn().mockReturnThis(),
  deleteFrom: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  selectAll: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  whereIn: jest.fn().mockReturnThis(),
  whereRef: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  having: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue([]),
  executeTakeFirst: jest.fn().mockResolvedValue(null),
  executeTakeFirstOrThrow: jest.fn().mockImplementation(() => {
    throw new Error('No record found');
  }),
};