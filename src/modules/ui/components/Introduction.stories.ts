import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta = {
  title: 'Introduction',
  parameters: {
    docs: {
      page: null,
    },
  },
};

export default meta;
type Story = StoryObj;

export const Welcome: Story = {
  render: () => ({
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold mb-4">SyntiIQ UI Component System</h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Welcome to the SyntiIQ UI component system. This system provides reusable primitive components built with Vue 3, TypeScript and Tailwind CSS.
        </p>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Available Components</h2>
        <ul class="list-disc list-inside space-y-2 mb-8">
          <li><strong>Button</strong> - Buttons with multiple variants and sizes</li>
          <li><strong>Input</strong> - Input fields with validation and states</li>
          <li><strong>Card</strong> - Cards with slots for header, body and footer</li>
          <li><strong>Badge</strong> - Labels and status indicators</li>
          <li><strong>Select</strong> - Selectors with multiple selection and search support</li>
          <li><strong>Avatar</strong> - Avatars with images, initials or icons</li>
          <li><strong>Spinner</strong> - Loading indicators with multiple variants</li>
        </ul>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Features</h2>
        <ul class="list-disc list-inside space-y-2 mb-8">
          <li>Full dark mode support</li>
          <li>Integrated accessibility (a11y)</li>
          <li>TypeScript with complete types</li>
          <li>Structured design token system</li>
          <li>Interactive documentation in Storybook</li>
          <li>Fully customizable components</li>
        </ul>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Usage</h2>
        <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-8">
          <pre class="text-sm"><code>import { Button, Input, Card } from '@/modules/ui';

&lt;Button variant="primary" size="md"&gt;
  Click me
&lt;/Button&gt;</code></pre>
        </div>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Design Tokens</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          The system includes design tokens for colors, spacing, typography and shadows. These tokens are available in both TypeScript and CSS variables.
        </p>
        <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <pre class="text-sm"><code>import { colors, spacing, typography, shadows } from '@/modules/ui/tokens';</code></pre>
        </div>
      </div>
    `,
  }),
};
