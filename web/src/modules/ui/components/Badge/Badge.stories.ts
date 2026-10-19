import type { Meta, StoryObj } from '@storybook/vue3';
import Badge from './Badge.vue';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'Visual variant of the badge',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Badge size',
    },
    icon: {
      control: 'text',
      description: 'FontAwesome icon',
    },
    dot: {
      control: 'boolean',
      description: 'Show only a dot indicator',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Badge component for displaying labels, states or indicators.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
  render: (args) => ({
    components: { Badge },
    setup() {
      return { args };
    },
    template: '<Badge v-bind="args">{{ args.children || "Badge" }}</Badge>',
  }),
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
  render: (args) => ({
    components: { Badge },
    setup() {
      return { args };
    },
    template: '<Badge v-bind="args">{{ args.children || "Badge" }}</Badge>',
  }),
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning',
  },
  render: (args) => ({
    components: { Badge },
    setup() {
      return { args };
    },
    template: '<Badge v-bind="args">{{ args.children || "Badge" }}</Badge>',
  }),
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Error',
  },
  render: (args) => ({
    components: { Badge },
    setup() {
      return { args };
    },
    template: '<Badge v-bind="args">{{ args.children || "Badge" }}</Badge>',
  }),
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Info',
  },
  render: (args) => ({
    components: { Badge },
    setup() {
      return { args };
    },
    template: '<Badge v-bind="args">{{ args.children || "Badge" }}</Badge>',
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex items-center gap-4">
        <Badge size="xs">Extra Small</Badge>
        <Badge size="sm">Small</Badge>
        <Badge size="md">Medium</Badge>
        <Badge size="lg">Large</Badge>
        <Badge size="xl">Extra Large</Badge>
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex items-center gap-4">
        <Badge icon="check">Verified</Badge>
        <Badge variant="success" icon="star">Featured</Badge>
        <Badge variant="warning" icon="exclamation-triangle">Warning</Badge>
        <Badge variant="error" icon="times-circle">Error</Badge>
      </div>
    `,
  }),
};

export const Dot: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <Badge variant="success" dot />
          <span>Online</span>
        </div>
        <div class="flex items-center gap-2">
          <Badge variant="error" dot />
          <span>Offline</span>
        </div>
        <div class="flex items-center gap-2">
          <Badge variant="warning" dot />
          <span>Away</span>
        </div>
        <div class="flex items-center gap-2">
          <Badge variant="info" dot />
          <span>Busy</span>
        </div>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex flex-wrap gap-4">
        <Badge variant="default">Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="info">Info</Badge>
      </div>
    `,
  }),
};

export const UsageExamples: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <span>Notifications</span>
          <Badge variant="error">5</Badge>
        </div>
        <div class="flex items-center gap-2">
          <span>Status:</span>
          <Badge variant="success" icon="check-circle">Active</Badge>
        </div>
        <div class="flex items-center gap-2">
          <span>New</span>
          <Badge variant="info" size="sm">NEW</Badge>
        </div>
      </div>
    `,
  }),
};
