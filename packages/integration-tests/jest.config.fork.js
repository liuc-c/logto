import config from './jest.config.js';

export default {
  ...config,
  // Production-container checks authenticate normally, with no development-user-id bypass.
  setupFilesAfterEnv: ['./jest.setup.js', './jest.setup.fork.js'],
  testMatch: ['**/tests/fork/*.test.js'],
};
