import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname === 'undefined' ? path.dirname(fileURLToPath(import.meta.url)) : __dirname;

/** Absolute path — must match Storybook's Vitest filter `storybook:${configDir}`. */
const storybookConfigDir = path.resolve(dirname, '.storybook');

// Vitest projects: `unit` (jsdom) + `storybook:${configDir}` (browser) for @storybook/addon-vitest
// https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
export default defineConfig(async () => {
  const storybookPlugins = await storybookTest({
    configDir: storybookConfigDir,
    storybookScript: 'yarn storybook --no-open',
  });

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
      },
    },
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            include: ['tests/**/*.spec.ts', 'src/**/*.spec.ts'],
            globals: true,
            environment: 'jsdom',
            coverage: {
              provider: 'v8',
              reporter: ['text', 'html'],
            },
          },
        },
        {
          extends: true,
          plugins: storybookPlugins,
          test: {
            name: `storybook:${storybookConfigDir}`,
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: 'chromium' }],
            },
            setupFiles: ['./.storybook/vitest.setup.ts'],
          },
        },
      ],
    },
  };
});
