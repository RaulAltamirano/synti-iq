import type { Meta, StoryObj } from '@storybook/vue3';
import { within } from 'storybook/test';
import Button from './Button.vue';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
        'info',
        'outline',
        'ghost',
        'danger',
      ],
      description: 'Visual variant of the button',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width',
    },
    icon: {
      control: 'text',
      description: 'FontAwesome icon (e.g. "user" or ["fas", "user"])',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Icon position',
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type',
    },
    onClick: {
      action: 'clicked',
      description: 'Click event',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Reusable Button component with multiple variants, sizes and states.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.children || "Button" }}</Button>',
  }),
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.children || "Button" }}</Button>',
  }),
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Button',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.children || "Button" }}</Button>',
  }),
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning Button',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.children || "Button" }}</Button>',
  }),
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Error Button',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.children || "Button" }}</Button>',
  }),
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.children || "Button" }}</Button>',
  }),
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.children || "Button" }}</Button>',
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex items-center gap-4">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Extra Large</Button>
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex items-center gap-4">
        <Button icon="user" icon-position="left">With Icon Left</Button>
        <Button icon="arrow-right" icon-position="right">With Icon Right</Button>
        <Button icon="download">Icon Only</Button>
      </div>
    `,
  }),
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading Button',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.children || "Button" }}</Button>',
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.children || "Button" }}</Button>',
  }),
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template:
      '<div class="w-64"><Button v-bind="args">{{ args.children || "Button" }}</Button></div>',
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex flex-wrap gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="error">Error</Button>
        <Button variant="info">Info</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
    `,
  }),
};

export const FocusState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the keyboard focus ring. Tab through buttons to see focus styles.',
      },
    },
  },
  render: () => ({
    components: { Button },
    template: `
      <div class="flex flex-wrap gap-4 p-4">
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
    `,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const [first] = canvas.getAllByRole('button');
    first.focus();
  },
};

export const LoadingDisabledMatrix: Story = {
  parameters: {
    docs: {
      description: {
        story: 'All interactive states — loading and disabled — across key variants.',
      },
    },
  },
  render: () => ({
    components: { Button },
    template: `
      <div class="space-y-4">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Loading</p>
        <div class="flex flex-wrap gap-4">
          <Button variant="primary" :loading="true">Primary</Button>
          <Button variant="success" :loading="true">Success</Button>
          <Button variant="danger" :loading="true">Danger</Button>
          <Button variant="outline" :loading="true">Outline</Button>
        </div>
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Disabled</p>
        <div class="flex flex-wrap gap-4">
          <Button variant="primary" :disabled="true">Primary</Button>
          <Button variant="success" :disabled="true">Success</Button>
          <Button variant="danger" :disabled="true">Danger</Button>
          <Button variant="outline" :disabled="true">Outline</Button>
        </div>
      </div>
    `,
  }),
};

export const DarkModeAllVariants: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'All variants rendered on dark background to verify contrast and dark-mode styles.',
      },
    },
  },
  render: () => ({
    components: { Button },
    template: `
      <div class="dark flex flex-wrap gap-4 p-6 rounded-lg bg-gray-900">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="error">Error</Button>
        <Button variant="info">Info</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
    `,
  }),
};

export const IconOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Icon-only buttons must use the ariaLabel prop to provide an accessible name.',
      },
    },
  },
  render: () => ({
    components: { Button },
    template: `
      <div class="flex items-center gap-4">
        <Button icon="trash" aria-label="Delete item" variant="danger" />
        <Button icon="pencil" aria-label="Edit item" variant="outline" />
        <Button icon="download" aria-label="Download file" />
      </div>
    `,
  }),
};
