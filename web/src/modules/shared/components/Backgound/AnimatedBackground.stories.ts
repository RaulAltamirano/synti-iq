import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AnimatedBackground from './AnimatedBackground.vue';

/**
 * Visual / regression only. Logic is environment-dependent (canvas, `prefers-reduced-motion`, width).
 *
 * @see docs/FRONTEND_CONVENTIONS.md — Storybook Standards; `MEDIA_BELOW_MD` in viewport-media.ts
 */
const meta: Meta<typeof AnimatedBackground> = {
  title: 'Shared/AnimatedBackground',
  component: AnimatedBackground,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Fixed full-viewport background (light/dark layers, optional beams). Toggle light/dark in the Storybook toolbar.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedBackground>;

export const Default: Story = {
  render: () => ({
    components: { AnimatedBackground },
    template:
      '<div class="relative min-h-screen text-gray-900 dark:text-gray-100"><AnimatedBackground /><p class="relative z-10 p-6 text-sm">Foreground content (use toolbar for dark mode).</p></div>',
  }),
};
