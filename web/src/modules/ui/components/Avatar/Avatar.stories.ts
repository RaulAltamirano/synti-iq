import type { Meta, StoryObj } from '@storybook/vue3';
import Avatar from './Avatar.vue';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Avatar size',
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'away', 'busy'],
      description: 'User status',
    },
    statusPosition: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
      description: 'Status indicator position',
    },
    rounded: {
      control: 'boolean',
      description: 'Rounded avatar',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Avatar component for displaying profile images, initials or icons with status indicator support.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'User avatar',
  },
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args };
    },
    template: '<Avatar v-bind="args" />',
  }),
};

export const WithInitials: Story = {
  args: {
    name: 'John Doe',
  },
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args };
    },
    template: '<Avatar v-bind="args" />',
  }),
};

export const WithIcon: Story = {
  args: {
    icon: 'user',
  },
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args };
    },
    template: '<Avatar v-bind="args" />',
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Avatar },
    template: `
      <div class="flex items-center gap-4">
        <Avatar name="XS User" size="xs" />
        <Avatar name="SM User" size="sm" />
        <Avatar name="MD User" size="md" />
        <Avatar name="LG User" size="lg" />
        <Avatar name="XL User" size="xl" />
      </div>
    `,
  }),
};

export const WithStatus: Story = {
  render: () => ({
    components: { Avatar },
    template: `
      <div class="flex items-center gap-4">
        <Avatar name="Online User" status="online" />
        <Avatar name="Offline User" status="offline" />
        <Avatar name="Away User" status="away" />
        <Avatar name="Busy User" status="busy" />
      </div>
    `,
  }),
};

export const StatusPositions: Story = {
  render: () => ({
    components: { Avatar },
    template: `
      <div class="flex items-center gap-4">
        <Avatar name="Top Right" status="online" status-position="top-right" />
        <Avatar name="Top Left" status="online" status-position="top-left" />
        <Avatar name="Bottom Right" status="online" status-position="bottom-right" />
        <Avatar name="Bottom Left" status="online" status-position="bottom-left" />
      </div>
    `,
  }),
};

export const Square: Story = {
  args: {
    name: 'Square Avatar',
    rounded: false,
  },
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args };
    },
    template: '<Avatar v-bind="args" />',
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { Avatar },
    template: `
      <div class="flex flex-wrap items-center gap-6">
        <div class="flex flex-col items-center gap-2">
          <Avatar src="https://i.pravatar.cc/150?img=1" />
          <span class="text-xs">Image</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Avatar name="John Doe" />
          <span class="text-xs">Initials</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Avatar icon="user" />
          <span class="text-xs">Icon</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Avatar name="Jane Smith" status="online" />
          <span class="text-xs">With Status</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Avatar name="Square" :rounded="false" />
          <span class="text-xs">Square</span>
        </div>
      </div>
    `,
  }),
};

export const Group: Story = {
  render: () => ({
    components: { Avatar },
    template: `
      <div class="flex -space-x-2">
        <Avatar name="User 1" size="md" />
        <Avatar name="User 2" size="md" />
        <Avatar name="User 3" size="md" />
        <Avatar name="User 4" size="md" />
        <Avatar name="+5" size="md" />
      </div>
    `,
  }),
};
