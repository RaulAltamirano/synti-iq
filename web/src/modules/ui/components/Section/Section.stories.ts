import type { Meta, StoryObj } from '@storybook/vue3';
import Section from './Section.vue';

const meta: Meta<typeof Section> = {
  title: 'UI/Section',
  component: Section,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Section title',
    },
    subtitle: {
      control: 'text',
      description: 'Optional section subtitle',
    },
    iconColor: {
      control: 'select',
      options: ['blue', 'purple', 'green', 'yellow', 'red', 'gray'],
      description: 'Icon background and text color',
    },
    collapsible: {
      control: 'boolean',
      description: 'Allow expand/collapse',
    },
    defaultExpanded: {
      control: 'boolean',
      description: 'Initial expanded state',
    },
    'onUpdate:expanded': {
      action: 'expanded changed',
      description: 'Emitted when expand state changes',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Generic collapsible section with header (icon, title, subtitle). Content loads only when expanded.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Collapsed: Story = {
  args: {
    title: 'Personal Information',
    subtitle: 'Basic account information',
    icon: ['fas', 'user'],
    iconColor: 'blue',
    collapsible: true,
    defaultExpanded: false,
  },
  render: (args) => ({
    components: { Section },
    setup() {
      return { args };
    },
    template: `
      <Section v-bind="args" @update:expanded="args['onUpdate:expanded']">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          This content is hidden when collapsed. Click the header to expand.
        </p>
      </Section>
    `,
  }),
};

export const Expanded: Story = {
  args: {
    title: 'Security',
    subtitle: 'Account security settings',
    icon: ['fas', 'shield-alt'],
    iconColor: 'purple',
    collapsible: true,
    defaultExpanded: true,
  },
  render: (args) => ({
    components: { Section },
    setup() {
      return { args };
    },
    template: `
      <Section v-bind="args" @update:expanded="args['onUpdate:expanded']">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          This section starts expanded. Content is visible by default.
        </p>
      </Section>
    `,
  }),
};

export const NotCollapsible: Story = {
  args: {
    title: 'Static Section',
    subtitle: 'Always visible',
    icon: ['fas', 'info-circle'],
    iconColor: 'green',
    collapsible: false,
  },
  render: (args) => ({
    components: { Section },
    setup() {
      return { args };
    },
    template: `
      <Section v-bind="args">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          This section cannot be collapsed.
        </p>
      </Section>
    `,
  }),
};
