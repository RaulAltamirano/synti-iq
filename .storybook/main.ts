import type { StorybookConfig } from '@storybook/vue3-vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    '../src/modules/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/modules/auth/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/modules/profile/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/modules/home/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/modules/store/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/modules/shared/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/modules/checkoutBox/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
      };
    }
    return config;
  },
};
export default config;
