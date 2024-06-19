export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/src/generated/',
    '/src/tests/',
    '/src/lib/LoggingInterceptor.ts',
    'jest.config.js',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  testTimeout: 20000,
  reporters: ['default', 'jest-junit'],
};
