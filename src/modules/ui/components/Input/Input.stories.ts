import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { userEvent, within } from 'storybook/test';
import Input from './Input.vue';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'HTML input type',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Input size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    readonly: {
      control: 'boolean',
      description: 'Read-only state',
    },
    error: {
      control: 'boolean',
      description: 'Error state',
    },
    required: {
      control: 'boolean',
      description: 'Required field',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width',
    },
    prefixIcon: {
      control: 'text',
      description: 'FontAwesome icon on the left',
    },
    suffixIcon: {
      control: 'text',
      description: 'FontAwesome icon on the right',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Reusable Input component with support for labels, icons, error states and validation.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    modelValue: '',
    placeholder: 'Placeholder text',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Input v-model="value" v-bind="args" />',
  }),
};

export const WithLabel: Story = {
  args: {
    modelValue: '',
    label: 'Email Address',
    placeholder: 'email@example.com',
    type: 'email',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Input v-model="value" v-bind="args" />',
  }),
};

export const WithHelperText: Story = {
  args: {
    modelValue: '',
    label: 'Username',
    helperText: 'Choose a unique username',
    placeholder: 'username',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Input v-model="value" v-bind="args" />',
  }),
};

export const WithError: Story = {
  args: {
    modelValue: 'invalid-email',
    label: 'Email',
    error: true,
    errorMessage: 'Please enter a valid email address',
    type: 'email',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Input v-model="value" v-bind="args" />',
  }),
};

export const WithIcon: Story = {
  args: {
    modelValue: '',
    label: 'Search',
    prefixIcon: 'search',
    placeholder: 'Search...',
    type: 'search',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Input v-model="value" v-bind="args" />',
  }),
};

export const Password: Story = {
  args: {
    modelValue: '',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Input v-model="value" v-bind="args" />',
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const values = {
        xs: ref(''),
        sm: ref(''),
        md: ref(''),
        lg: ref(''),
        xl: ref(''),
      };
      return { values };
    },
    template: `
      <div class="space-y-4 w-64">
        <Input v-model="values.xs" size="xs" placeholder="Extra Small" />
        <Input v-model="values.sm" size="sm" placeholder="Small" />
        <Input v-model="values.md" size="md" placeholder="Medium" />
        <Input v-model="values.lg" size="lg" placeholder="Large" />
        <Input v-model="values.xl" size="xl" placeholder="Extra Large" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    modelValue: 'Disabled input',
    disabled: true,
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Input v-model="value" v-bind="args" />',
  }),
};

export const Required: Story = {
  args: {
    modelValue: '',
    label: 'Required Field',
    required: true,
    placeholder: 'This field is required',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Input v-model="value" v-bind="args" />',
  }),
};

export const AllTypes: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const values = {
        text: ref(''),
        email: ref(''),
        password: ref(''),
        number: ref(''),
        tel: ref(''),
        url: ref(''),
        search: ref(''),
      };
      return { values };
    },
    template: `
      <div class="space-y-4 w-64">
        <Input v-model="values.text" type="text" label="Text" placeholder="Text input" />
        <Input v-model="values.email" type="email" label="Email" placeholder="email@example.com" />
        <Input v-model="values.password" type="password" label="Password" placeholder="Password" />
        <Input v-model="values.number" type="number" label="Number" placeholder="123" />
        <Input v-model="values.tel" type="tel" label="Phone" placeholder="+1 234 567 8900" />
        <Input v-model="values.url" type="url" label="URL" placeholder="https://example.com" />
        <Input v-model="values.search" type="search" label="Search" placeholder="Search..." prefix-icon="search" />
      </div>
    `,
  }),
};

export const Readonly: Story = {
  args: {
    modelValue: 'Read-only value',
    readonly: true,
    label: 'Read-only field',
    helperText: 'This field cannot be edited.',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Input v-model="value" v-bind="args" />',
  }),
};

export const FocusState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the focus ring on a standard input field.',
      },
    },
  },
  args: {
    modelValue: '',
    label: 'Email Address',
    placeholder: 'email@example.com',
    type: 'email',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<div class="w-72"><Input v-model="value" v-bind="args" /></div>',
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
  },
};

export const FocusError: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Focus ring in error state — red ring instead of primary blue.',
      },
    },
  },
  args: {
    modelValue: 'not-an-email',
    label: 'Email',
    type: 'email',
    error: true,
    errorMessage: 'Please enter a valid email address',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<div class="w-72"><Input v-model="value" v-bind="args" /></div>',
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
  },
};
