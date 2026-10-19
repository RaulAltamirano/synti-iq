import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import TotpInput from './TotpInput.vue';

const meta: Meta<typeof TotpInput> = {
  title: 'Auth/TotpInput',
  component: TotpInput,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'TOTP or backup code value',
    },
    placeholder: {
      control: 'text',
      description: 'Input placeholder',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    acceptBackupCode: {
      control: 'boolean',
      description: 'Allow backup code format (XXXX-XXXX-XXXX)',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Input for TOTP 6-digit codes or backup codes (XXXX-XXXX-XXXX). Used during 2FA login and when disabling 2FA.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TotpInput>;

export const Default: Story = {
  args: {
    modelValue: '',
    placeholder: '000000',
  },
  render: (args) => ({
    components: { TotpInput },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: '<TotpInput v-model="modelValue" v-bind="args" />',
  }),
};

export const WithBackupCode: Story = {
  args: {
    modelValue: '',
    placeholder: '000000 or XXXX-XXXX-XXXX',
    acceptBackupCode: true,
  },
  render: (args) => ({
    components: { TotpInput },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: '<TotpInput v-model="modelValue" v-bind="args" />',
  }),
};

export const Disabled: Story = {
  args: {
    modelValue: '123456',
    placeholder: '000000',
    disabled: true,
  },
  render: (args) => ({
    components: { TotpInput },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: '<TotpInput v-model="modelValue" v-bind="args" />',
  }),
};

export const Error: Story = {
  args: {
    modelValue: '123',
    placeholder: '000000',
    error: 'Invalid code. Please try again.',
  },
  render: (args) => ({
    components: { TotpInput },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: '<TotpInput v-model="modelValue" v-bind="args" />',
  }),
};
