import type { Meta, StoryObj } from '@storybook/vue3-vite';

import HeroSection from './HeroSection.vue';
import { useAuthStore } from '@/modules/auth/stores/authStore';

const meta: Meta<typeof HeroSection> = {
  title: 'Home/HeroSection',
  component: HeroSection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Marketing hero with time-based greeting and optional first name (no subheading).

### Typography

| Role | Font | Tailwind |
|------|------|----------|
| Salutation (\`Good morning,\`, etc.) | **Instrument Serif** | \`font-greeting\` |
| First name (when present) | **Plus Jakarta Sans** | \`font-hero\` |
| Fallback line (no name) | Instrument Serif | \`font-greeting\` |

Google Fonts are linked in \`index.html\`; tokens in \`tailwind.config.js\` → \`fontFamily.greeting\` / \`fontFamily.hero\`.

Background carousel: cross-fade in \`BackgroundImage.vue\`; \`prefers-reduced-motion\` shortens motion.
`,
      },
    },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithUserName: Story = {
  render: () => ({
    components: { HeroSection },
    setup() {
      const authStore = useAuthStore();
      authStore.setUser({
        id: '1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
      });
      return {};
    },
    template: '<HeroSection />',
  }),
  parameters: {
    docs: {
      description: {
        story: 'Greeting includes the user first name when it is a real display name.',
      },
    },
  },
};

export const WithoutUserName: Story = {
  render: () => ({
    components: { HeroSection },
    setup() {
      const authStore = useAuthStore();
      authStore.setUser({
        id: '2',
        email: 'user@example.com',
        role: 'user',
      });
      return {};
    },
    template: '<HeroSection />',
  }),
  parameters: {
    docs: {
      description: {
        story: 'Generic greeting when the profile has no usable first name.',
      },
    },
  },
};

export const PlaceholderFirstName: Story = {
  render: () => ({
    components: { HeroSection },
    setup() {
      const authStore = useAuthStore();
      authStore.setUser({
        id: '3',
        email: 'oauth@example.com',
        firstName: 'System',
        lastName: 'User',
        role: 'user',
      });
      return {};
    },
    template: '<HeroSection />',
  }),
  parameters: {
    docs: {
      description: {
        story:
          'OAuth/seed placeholders (e.g. **System**, **User**, **Admin**) are omitted from the personalized line — same copy as “without first name”.',
      },
    },
  },
};
