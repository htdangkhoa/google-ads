import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    testTimeout: 30000,
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'junit.xml',
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      include: ['src'],
      exclude: ['src/generated', 'src/LoggingInterceptor.ts'],
    },
  },
});
