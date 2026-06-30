import type { Meta, StoryObj } from '@storybook/vue3';
import RoleIcon from './RoleIcon.vue';
import { SYSTEM_ROLES } from '@/modules/shared/constants';

const meta: Meta<typeof RoleIcon> = {
  title: 'UI/RoleIcon',
  component: RoleIcon,
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: 'select',
      options: [...SYSTEM_ROLES, 'unknown_role', ''],
      description: 'System role to display',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Icon size',
    },
    showLabel: {
      control: 'boolean',
      description: 'Show role label next to icon',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Minimal, business-grade role medals. Two variants: bordered squircle emblem (icon only) and bordered pill chip (icon + label). Soft tinted surface, defined edge, semantic-toned FontAwesome glyph per role — no glows or gradients.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RoleIcon>;

export const AllRoles: Story = {
  render: () => ({
    components: { RoleIcon },
    setup() {
      return { roles: SYSTEM_ROLES };
    },
    template: `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6">
        <div
          v-for="role in roles"
          :key="role"
          class="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          <RoleIcon :role="role" size="lg" />
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ role }}</span>
        </div>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { RoleIcon },
    template: `
      <div class="flex items-end gap-8 p-6">
        <div class="flex flex-col items-center gap-2">
          <RoleIcon role="admin" size="sm" />
          <span class="text-xs text-gray-500">sm</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <RoleIcon role="admin" size="md" />
          <span class="text-xs text-gray-500">md</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <RoleIcon role="admin" size="lg" />
          <span class="text-xs text-gray-500">lg</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <RoleIcon role="admin" size="xl" />
          <span class="text-xs text-gray-500">xl</span>
        </div>
      </div>
    `,
  }),
};

export const WithLabel: Story = {
  render: () => ({
    components: { RoleIcon },
    setup() {
      return { roles: SYSTEM_ROLES.slice(0, 4) };
    },
    template: `
      <div class="flex flex-wrap gap-4 p-6">
        <RoleIcon
          v-for="role in roles"
          :key="role"
          :role="role"
          size="md"
          :show-label="true"
        />
      </div>
    `,
  }),
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Use the Theme toggle in the toolbar to switch between light and dark mode.',
      },
    },
  },
  render: () => ({
    components: { RoleIcon },
    setup() {
      return { roles: SYSTEM_ROLES };
    },
    template: `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-gray-900 min-h-[200px]">
        <div
          v-for="role in roles"
          :key="role"
          class="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-800"
        >
          <RoleIcon :role="role" size="lg" />
          <span class="text-sm font-medium text-gray-300">{{ role }}</span>
        </div>
      </div>
    `,
  }),
};

export const UnknownRole: Story = {
  args: {
    role: 'invalid_role',
    size: 'md',
    showLabel: true,
  },
  render: (args) => ({
    components: { RoleIcon },
    setup() {
      return { args };
    },
    template: '<RoleIcon v-bind="args" />',
  }),
};

export const EmptyRole: Story = {
  args: {
    role: '',
    size: 'md',
    showLabel: true,
  },
  render: (args) => ({
    components: { RoleIcon },
    setup() {
      return { args };
    },
    template: '<RoleIcon v-bind="args" />',
  }),
};

export const Default: Story = {
  args: {
    role: 'admin',
    size: 'md',
    showLabel: false,
  },
  render: (args) => ({
    components: { RoleIcon },
    setup() {
      return { args };
    },
    template: '<RoleIcon v-bind="args" />',
  }),
};
