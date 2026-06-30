import type { Meta, StoryObj } from '@storybook/vue3';
import { colors, spacing, typography, shadows } from '../tokens';

const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: {
    docs: {
      page: null,
    },
  },
};

export default meta;
type Story = StoryObj;

export const Colors: Story = {
  render: () => ({
    setup() {
      return { colors };
    },
    template: `
      <div class="p-8 max-w-6xl mx-auto">
        <h2 class="text-2xl font-semibold mb-6">Color Palette</h2>
        <div class="space-y-8">
          <div v-for="(colorScale, name) in colors" :key="name">
            <h3 class="text-lg font-medium mb-4 capitalize">{{ name }}</h3>
            <div class="flex gap-2 flex-wrap">
              <div
                v-for="(value, shade) in colorScale"
                :key="shade"
                class="flex flex-col items-center"
              >
                <div
                  class="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700"
                  :style="{ backgroundColor: value }"
                />
                <span class="text-xs mt-1">{{ shade }}</span>
                <span class="text-xs text-gray-500">{{ value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const Spacing: Story = {
  render: () => ({
    setup() {
      return { spacing };
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h2 class="text-2xl font-semibold mb-6">Spacing Scale</h2>
        <div class="space-y-4">
          <div
            v-for="(value, key) in spacing"
            :key="key"
            class="flex items-center gap-4"
          >
            <div class="w-24 text-sm font-mono">{{ key }}</div>
            <div
              class="bg-primary"
              :style="{ width: value, height: '20px' }"
            />
            <div class="text-sm text-gray-600 dark:text-gray-400 font-mono">{{ value }}</div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const Typography: Story = {
  render: () => ({
    setup() {
      return { typography };
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h2 class="text-2xl font-semibold mb-6">Typography</h2>
        
        <div class="mb-8">
          <h3 class="text-lg font-medium mb-4">Font Sizes</h3>
          <div class="space-y-4">
            <div
              v-for="(size, name) in typography.fontSizes"
              :key="name"
              class="flex items-baseline gap-4"
            >
              <div class="w-24 text-sm font-mono">{{ name }}</div>
              <div :style="{ fontSize: size }" class="font-medium">
                The quick brown fox jumps over the lazy dog
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 font-mono">{{ size }}</div>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <h3 class="text-lg font-medium mb-4">Font Weights</h3>
          <div class="space-y-2">
            <div
              v-for="(weight, name) in typography.fontWeights"
              :key="name"
              class="flex items-center gap-4"
            >
              <div class="w-32 text-sm font-mono">{{ name }}</div>
              <div :style="{ fontWeight: weight }" class="text-lg">
                The quick brown fox
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 font-mono">{{ weight }}</div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const Shadows: Story = {
  render: () => ({
    setup() {
      return { shadows };
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h2 class="text-2xl font-semibold mb-6">Shadows</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            v-for="(shadow, name) in shadows"
            :key="name"
            class="flex flex-col items-center gap-2"
          >
            <div
              class="w-24 h-24 bg-white dark:bg-gray-800 rounded-lg"
              :style="{ boxShadow: shadow }"
            />
            <span class="text-xs font-mono">{{ name }}</span>
          </div>
        </div>
      </div>
    `,
  }),
};
