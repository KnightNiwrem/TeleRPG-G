// Jest configuration for Docker testing environment using ESM
export default {
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true,
    }],
  },
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.docker.mjs'],
  extensionsToTreatAsEsm: ['.ts'],  // Only treat .ts as ESM (.js is inferred from package.json type)
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  globalSetup: '<rootDir>/src/__tests__/utils/globalSetup.ts',
  globalTeardown: '<rootDir>/src/__tests__/utils/globalTeardown.ts',
};