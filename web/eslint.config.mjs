import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginVue from 'eslint-plugin-vue';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/*.d.ts',
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.storybook-static/**',
      '**/storybook-static/**',
      '**/public/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      // Prefer consistency without over-constraining; style left to Prettier
      'vue/multi-word-component-names': 'warn',
      // Enforce no any; use concrete types or Record<string, unknown>
      '@typescript-eslint/no-explicit-any': 'error',
      // Prefer <script setup> for new components; warn for legacy Options API (migrate to error when Options API components are gone)
      'vue/component-api-style': ['warn', ['script-setup', 'composition']],
      // XSS prevention: discourage v-html unless explicitly justified
      'vue/no-v-html': 'warn',
      // Enforce consistent macro order in <script setup>
      'vue/define-macros-order': [
        'warn',
        { order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots', 'defineModel'] },
      ],
      // Enforce block order: script, template, style
      'vue/block-order': ['warn', { order: ['script', 'template', 'style'] }],
      // No unused variables; allow underscore-prefixed for intentionally unused params
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  ...storybook.configs['flat/recommended'],
  eslintConfigPrettier
);
