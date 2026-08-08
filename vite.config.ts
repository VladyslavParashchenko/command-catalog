import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

const projectRoot = new URL('.', import.meta.url).pathname;

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: /^src\//, replacement: `${projectRoot}src/` },
      { find: /^tests\//, replacement: `${projectRoot}tests/` },
    ],
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
