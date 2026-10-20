import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Stepper from './Stepper.vue';
import type { StepperStep } from './Stepper.ts';

const defaultSteps: StepperStep[] = [
  { id: 1, title: 'Basic information', shortTitle: 'Data', icon: 'info-circle' },
  { id: 2, title: 'Location', shortTitle: 'Location', icon: 'map-marker-alt' },
  { id: 3, title: 'Opening hours', shortTitle: 'Hours', icon: 'clock' },
];

const meta: Meta<typeof Stepper> = {
  title: 'UI/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: { type: 'number', min: 1, max: 3 },
      description: 'Current active step (1-based). Use v-model in your app.',
    },
    steps: {
      description: 'Array of step definitions: id, title, shortTitle, icon (FontAwesome name).',
    },
    animated: {
      control: 'boolean',
      description: 'Enable enter animations and active-step glow/waves.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A horizontal step indicator (stepper) for wizards and multi-step flows. Shows completed steps with a checkmark, the active step with a blue circle and optional pulse/ripple, and pending steps with an outline. Theme follows the document (html.dark / Tailwind dark:). Accessible (ARIA progressbar).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Default: Story = {
  args: {
    steps: defaultSteps,
    modelValue: 1,
    animated: true,
  },
  render: (args) => ({
    components: { Stepper },
    setup() {
      const currentStep = ref(args.modelValue as number);
      return { args, currentStep };
    },
    template: `
      <div class="max-w-2xl p-4 bg-white text-gray-900">
        <Stepper
          v-model="currentStep"
          :steps="args.steps"
          :animated="args.animated"
        />
        <p class="mt-4 text-sm opacity-70">Current step: {{ currentStep }}</p>
      </div>
    `,
  }),
};

export const StepTwoActive: Story = {
  args: {
    steps: defaultSteps,
    modelValue: 2,
    animated: true,
  },
  render: (args) => ({
    components: { Stepper },
    setup() {
      const currentStep = ref(args.modelValue as number);
      return { args, currentStep };
    },
    template: `
      <div class="max-w-2xl p-4 bg-white">
        <Stepper
          v-model="currentStep"
          :steps="args.steps"
          :animated="args.animated"
        />
      </div>
    `,
  }),
};

export const StepThreeActive: Story = {
  args: {
    steps: defaultSteps,
    modelValue: 3,
    animated: true,
  },
  render: (args) => ({
    components: { Stepper },
    setup() {
      const currentStep = ref(args.modelValue as number);
      return { args, currentStep };
    },
    template: `
      <div class="max-w-2xl p-4 bg-white">
        <Stepper
          v-model="currentStep"
          :steps="args.steps"
          :animated="true"
        />
      </div>
    `,
  }),
};

/** Wrapper has `class="dark"` so Tailwind `dark:` utilities apply (same as app with dark theme). */
export const DarkMode: Story = {
  args: {
    steps: defaultSteps,
    modelValue: 2,
    animated: true,
  },
  render: (args) => ({
    components: { Stepper },
    setup() {
      const currentStep = ref(args.modelValue as number);
      return { args, currentStep };
    },
    template: `
      <div class="dark max-w-2xl p-4 bg-gray-900 text-white">
        <Stepper
          v-model="currentStep"
          :steps="args.steps"
          :animated="true"
        />
      </div>
    `,
  }),
};

export const WithoutAnimations: Story = {
  args: {
    steps: defaultSteps,
    modelValue: 2,
    animated: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Use when you prefer no motion (e.g. prefers-reduced-motion or performance).',
      },
    },
  },
  render: (args) => ({
    components: { Stepper },
    setup() {
      const currentStep = ref(args.modelValue as number);
      return { args, currentStep };
    },
    template: `
      <div class="max-w-2xl p-4 bg-white">
        <Stepper
          v-model="currentStep"
          :steps="args.steps"
          :animated="false"
        />
      </div>
    `,
  }),
};

export const MobileViewport: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile' },
    docs: {
      description: {
        story:
          'Stepper on a 320px mobile viewport — circles shrink from sm:w-11 to w-10, labels truncate, connectors compress.',
      },
    },
  },
  render: () => ({
    components: { Stepper },
    setup() {
      const currentStep = ref(2);
      const steps = defaultSteps;
      return { currentStep, steps };
    },
    template: `
      <div class="p-2 bg-white">
        <Stepper v-model="currentStep" :steps="steps" :animated="true" />
      </div>
    `,
  }),
};

export const FourSteps: Story = {
  args: {
    steps: [
      { id: 1, title: 'Account', shortTitle: 'Account', icon: 'user' },
      { id: 2, title: 'Profile', shortTitle: 'Profile', icon: 'id-card' },
      { id: 3, title: 'Settings', shortTitle: 'Settings', icon: 'cog' },
      { id: 4, title: 'Review', shortTitle: 'Review', icon: 'check-double' },
    ],
    modelValue: 3,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stepper with four steps. Works with any number of steps.',
      },
    },
  },
  render: (args) => ({
    components: { Stepper },
    setup() {
      const currentStep = ref(args.modelValue as number);
      return { args, currentStep };
    },
    template: `
      <div class="max-w-3xl p-4 bg-white">
        <Stepper
          v-model="currentStep"
          :steps="args.steps"
          :animated="args.animated"
        />
      </div>
    `,
  }),
};
