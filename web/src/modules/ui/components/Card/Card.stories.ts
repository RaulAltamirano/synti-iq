import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Card from './Card.vue';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
      description: 'Visual variant of the card',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Internal padding of the card',
    },
    hover: {
      control: 'boolean',
      description: 'Hover effect',
    },
    clickable: {
      control: 'boolean',
      description: 'Clickable card',
    },
    collapsible: {
      control: 'boolean',
      description: 'Allows collapsing/expanding card content',
    },
    defaultExpanded: {
      control: 'boolean',
      description: 'Initial expanded state (only applies when collapsible=true)',
    },
    onClick: {
      action: 'clicked',
      description: 'Click event',
    },
    'onUpdate:expanded': {
      action: 'expanded changed',
      description: 'Event when expansion state changes',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Reusable Card component with support for header, body and footer via slots.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    variant: 'default',
  },
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
      <Card v-bind="args">
        <h3 class="text-lg font-semibold mb-2">Card Title</h3>
        <p class="text-gray-600 dark:text-gray-400">
          This is a default card with some content. It has a border and standard padding.
        </p>
      </Card>
    `,
  }),
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
  },
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
      <Card v-bind="args">
        <h3 class="text-lg font-semibold mb-2">Elevated Card</h3>
        <p class="text-gray-600 dark:text-gray-400">
          This card has a shadow effect for depth.
        </p>
      </Card>
    `,
  }),
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
  },
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
      <Card v-bind="args">
        <h3 class="text-lg font-semibold mb-2">Outlined Card</h3>
        <p class="text-gray-600 dark:text-gray-400">
          This card has a prominent border.
        </p>
      </Card>
    `,
  }),
};

export const WithHeader: Story = {
  render: () => ({
    components: { Card },
    template: `
      <Card>
        <template #header>
          <h3 class="text-lg font-semibold">Card Header</h3>
        </template>
        <p class="text-gray-600 dark:text-gray-400">
          This card has a header section separated by a border.
        </p>
      </Card>
    `,
  }),
};

export const WithFooter: Story = {
  render: () => ({
    components: { Card },
    template: `
      <Card>
        <p class="text-gray-600 dark:text-gray-400">
          This card has a footer section separated by a border.
        </p>
        <template #footer>
          <button class="text-primary hover:underline">Action</button>
        </template>
      </Card>
    `,
  }),
};

export const WithHeaderAndFooter: Story = {
  render: () => ({
    components: { Card },
    template: `
      <Card>
        <template #header>
          <h3 class="text-lg font-semibold">Card Title</h3>
        </template>
        <p class="text-gray-600 dark:text-gray-400">
          This card has both header and footer sections.
        </p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <button class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
            <button class="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </template>
      </Card>
    `,
  }),
};

export const PaddingSizes: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div class="space-y-4">
        <Card padding="none">
          <p class="p-4 bg-gray-100 dark:bg-gray-700 rounded">No padding (content has its own)</p>
        </Card>
        <Card padding="sm">
          <p>Small padding</p>
        </Card>
        <Card padding="md">
          <p>Medium padding (default)</p>
        </Card>
        <Card padding="lg">
          <p>Large padding</p>
        </Card>
        <Card padding="xl">
          <p>Extra large padding</p>
        </Card>
      </div>
    `,
  }),
};

export const Hoverable: Story = {
  args: {
    hover: true,
  },
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
      <Card v-bind="args">
        <h3 class="text-lg font-semibold mb-2">Hoverable Card</h3>
        <p class="text-gray-600 dark:text-gray-400">
          Hover over this card to see the effect.
        </p>
      </Card>
    `,
  }),
};

export const Clickable: Story = {
  args: {
    clickable: true,
  },
  render: (args) => ({
    components: { Card },
    setup() {
      const handleClick = () => {
        alert('Card clicked!');
      };
      return { args, handleClick };
    },
    template: `
      <Card v-bind="args" @click="handleClick">
        <h3 class="text-lg font-semibold mb-2">Clickable Card</h3>
        <p class="text-gray-600 dark:text-gray-400">
          Click this card to trigger an action.
        </p>
      </Card>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="default">
          <h3 class="text-lg font-semibold mb-2">Default</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">Standard card with border</p>
        </Card>
        <Card variant="elevated">
          <h3 class="text-lg font-semibold mb-2">Elevated</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">Card with shadow</p>
        </Card>
        <Card variant="outlined">
          <h3 class="text-lg font-semibold mb-2">Outlined</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">Card with prominent border</p>
        </Card>
      </div>
    `,
  }),
};

export const Collapsible: Story = {
  args: {
    collapsible: true,
    defaultExpanded: false,
  },
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
      <Card v-bind="args" variant="elevated">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Basic account details</p>
            </div>
          </div>
        </template>
        <div class="space-y-4">
          <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p class="text-gray-900 dark:text-gray-100">user@example.com</p>
            </div>
          </div>
        </div>
      </Card>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Card with collapsible functionality. Click the header to expand/collapse content. Starts collapsed by default.',
      },
    },
  },
};

export const CollapsibleExpanded: Story = {
  args: {
    collapsible: true,
    defaultExpanded: true,
  },
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
      <Card v-bind="args" variant="elevated">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Security</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Security settings</p>
            </div>
          </div>
        </template>
        <div class="space-y-4">
          <button class="w-full py-3 px-4 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-colors flex items-center justify-between">
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Change Password
            </span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </Card>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Collapsible card that starts expanded by default using the defaultExpanded=true prop.',
      },
    },
  },
};

export const MultipleCollapsible: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div class="space-y-4">
        <Card collapsible variant="elevated" padding="lg">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Section 1 - Collapsed</h3>
          </template>
          <p class="text-gray-600 dark:text-gray-400">First section content. Each section can be expanded/collapsed independently.</p>
        </Card>
        
        <Card collapsible :default-expanded="true" variant="elevated" padding="lg">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Section 2 - Expanded</h3>
          </template>
          <p class="text-gray-600 dark:text-gray-400">This section starts expanded. Content is visible when the page loads.</p>
        </Card>
        
        <Card collapsible variant="elevated" padding="lg">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Section 3 - Collapsed</h3>
          </template>
          <p class="text-gray-600 dark:text-gray-400">Another collapsed section. Useful for organizing extensive content into sections.</p>
        </Card>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Multiple collapsible cards working independently, similar to an accordion.',
      },
    },
  },
};
