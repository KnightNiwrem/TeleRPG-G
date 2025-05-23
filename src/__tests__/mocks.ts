// ESM Module Mocking Setup
// This file is kept for backward compatibility
// For new tests, please use the __mocks__ directory structure
// Example:
// import { jest } from '@jest/globals';
// jest.mock('../../config/env.js');
// jest.mock('../../database/kysely.js');

import { jest } from '@jest/globals';

// Automatically mock these modules
jest.mock('../../config/env.js');
jest.mock('../../database/kysely.js');
jest.mock('../../services/CharacterService.js');
jest.mock('../../services/AreaService.js');
jest.mock('../../services/QuestService.js');