export default {
  testEnvironment: 'node',
  transform: {},
  setupFilesAfterEnv: [],
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
}