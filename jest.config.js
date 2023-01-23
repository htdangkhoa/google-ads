module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/src/generated/',
    '/src/tests/',
    'jest.config.js',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  testTimeout: 20000,
};
