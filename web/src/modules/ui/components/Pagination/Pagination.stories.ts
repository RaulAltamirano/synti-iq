import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Pagination from './Pagination.vue';

const meta: Meta<typeof Pagination> = {
  title: 'UI/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'number' },
    totalPages: { control: 'number' },
    maxPagesToShow: { control: 'number' },
    showCompactOnMobile: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalPages: 10,
    maxPagesToShow: 5,
  },
  render: (args) => ({
    components: { Pagination },
    setup() {
      const currentPage = ref(1);
      return { args, currentPage };
    },
    template: `
      <div>
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">Current page: {{ currentPage }}</p>
        <Pagination
          v-model="currentPage"
          :total-pages="args.totalPages"
          :max-pages-to-show="args.maxPagesToShow"
          :show-compact-on-mobile="args.showCompactOnMobile"
          :disabled="args.disabled"
        />
      </div>
    `,
  }),
};

export const CompactMobile: Story = {
  args: {
    totalPages: 10,
    maxPagesToShow: 5,
    showCompactOnMobile: true,
  },
  render: (args) => ({
    components: { Pagination },
    setup() {
      const currentPage = ref(3);
      return { args, currentPage };
    },
    template: `
      <Pagination
        v-model="currentPage"
        :total-pages="args.totalPages"
        :max-pages-to-show="args.maxPagesToShow"
        :show-compact-on-mobile="args.showCompactOnMobile"
      />
    `,
  }),
};

export const FewPages: Story = {
  args: {
    totalPages: 3,
  },
  render: (args) => ({
    components: { Pagination },
    setup() {
      const currentPage = ref(1);
      return { args, currentPage };
    },
    template:
      '<Pagination v-model="currentPage" :total-pages="args.totalPages" :max-pages-to-show="args.maxPagesToShow" />',
  }),
};

export const ManyPages: Story = {
  args: {
    totalPages: 100,
    maxPagesToShow: 7,
  },
  render: (args) => ({
    components: { Pagination },
    setup() {
      const currentPage = ref(50);
      return { args, currentPage };
    },
    template:
      '<Pagination v-model="currentPage" :total-pages="args.totalPages" :max-pages-to-show="args.maxPagesToShow" />',
  }),
};

export const MobileCompact: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile' },
    docs: {
      description: {
        story:
          'Compact mode on a 320px mobile viewport — shows prev/next only with "page / total" counter.',
      },
    },
  },
  render: () => ({
    components: { Pagination },
    setup() {
      const currentPage = ref(3);
      return { currentPage };
    },
    template: `
      <div class="p-4">
        <p class="mb-3 text-sm text-gray-600">Page: {{ currentPage }}</p>
        <Pagination
          v-model="currentPage"
          :total-pages="10"
          :show-compact-on-mobile="true"
        />
      </div>
    `,
  }),
};
