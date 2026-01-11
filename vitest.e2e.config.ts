import { defineConfig } from 'vitest/config';
import path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['agents/__tests__/evaluation/**/*.e2e.test.ts'],
    exclude: ['node_modules', '.next'],
    testTimeout: 180000,
    hookTimeout: 180000,
    pool: 'forks',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  } as any,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
