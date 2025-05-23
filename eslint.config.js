// eslint.config.js
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Basic formatting and style rules
      'indent': ['warn', 2],
      'linebreak-style': ['warn', 'unix'],
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      
      // TypeScript specific rules - making them warnings not errors
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'src/database/seed.ts', 'src/services/CharacterService.ts'],
  },
];