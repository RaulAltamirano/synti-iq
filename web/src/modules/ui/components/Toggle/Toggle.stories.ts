import type { Meta, StoryObj } from '@storybook/vue3';
import Toggle from './Toggle.vue';
import { ref } from 'vue';
import { userEvent, within } from 'storybook/test';

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: 'Toggle state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the toggle',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Toggle size',
    },
    label: {
      control: 'text',
      description: 'Toggle label',
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Label position',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Toggle/Switch component for enabling or disabling options.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: () => ({
    components: { Toggle },
    setup() {
      const isOn = ref(false);
      return { isOn };
    },
    template: `
      <Toggle v-model="isOn" />
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">State: {{ isOn ? 'On' : 'Off' }}</p>
    `,
  }),
};

export const WithLabel: Story = {
  render: () => ({
    components: { Toggle },
    setup() {
      const isOn = ref(true);
      return { isOn };
    },
    template: `
      <Toggle v-model="isOn" label="Email notifications" />
    `,
  }),
};

export const LabelLeft: Story = {
  render: () => ({
    components: { Toggle },
    setup() {
      const isOn = ref(true);
      return { isOn };
    },
    template: `
      <Toggle v-model="isOn" label="Dark mode" labelPosition="left" />
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { Toggle },
    setup() {
      const isOn = ref(true);
      const isOff = ref(false);
      return { isOn, isOff };
    },
    template: `
      <div class="space-y-4">
        <Toggle v-model="isOn" disabled label="On (disabled)" />
        <Toggle v-model="isOff" disabled label="Off (disabled)" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Toggle },
    setup() {
      const values = ref({
        xs: true,
        sm: true,
        md: true,
        lg: true,
        xl: true,
      });
      return { values };
    },
    template: `
      <div class="space-y-4">
        <Toggle v-model="values.xs" size="xs" label="Extra small" />
        <Toggle v-model="values.sm" size="sm" label="Small" />
        <Toggle v-model="values.md" size="md" label="Medium (default)" />
        <Toggle v-model="values.lg" size="lg" label="Large" />
        <Toggle v-model="values.xl" size="xl" label="Extra large" />
      </div>
    `,
  }),
};

export const NotificationPreferencesExample: Story = {
  render: () => ({
    components: { Toggle },
    setup() {
      const prefs = ref({
        email: true,
        push: false,
        sms: false,
      });
      return { prefs };
    },
    template: `
      <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notification preferences</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300">Email</span>
            <Toggle v-model="prefs.email" size="sm" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300">Push</span>
            <Toggle v-model="prefs.push" size="sm" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300">SMS</span>
            <Toggle v-model="prefs.sms" size="sm" />
          </div>
        </div>
      </div>
    `,
  }),
};

export const AnimatedToggle: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows the thumb transition animation — play() clicks the toggle to demonstrate.',
      },
    },
  },
  render: () => ({
    components: { Toggle },
    setup() {
      const isOn = ref(false);
      return { isOn };
    },
    template: `
      <div class="flex flex-col items-start gap-3 p-4">
        <Toggle v-model="isOn" label="Animated toggle" />
        <p class="text-sm text-gray-500">State: {{ isOn ? 'On' : 'Off' }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await userEvent.click(toggle);
  },
};
