// ESM Module Mocking Setup
// This file is kept for backward compatibility
// For new tests, please use the __mocks__ directory structure
// Example:
// import { jest } from '@jest/globals';
// jest.mock('../../config/env');
// jest.mock('../../database/kysely');

import { jest } from '@jest/globals';

// Automatically mock these modules
jest.mock('../../config/env');
jest.mock('../../database/kysely');