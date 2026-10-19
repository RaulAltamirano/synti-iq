import type { Meta, StoryObj } from '@storybook/vue3';
import MockAdapter from 'axios-mock-adapter';
import { ApiService } from '@/modules/services/api-service';
import ReferralSection from './ReferralSection.vue';

const api = ApiService.getInstance().api;
const mock = new MockAdapter(api);

const mockReferralResponses = () => {
  mock.onGet(/\/referrals\/me\/code/).reply(200, {
    data: { code: 'REF12345' },
  });
  mock.onGet(/\/referrals\/me\/referrer/).reply(200, {
    data: { referrer: null },
  });
  mock.onGet(/\/referrals\/me\/stats/).reply(200, {
    data: {
      totalReferrals: 5,
      successfulReferrals: 3,
      pendingReferrals: 2,
      totalBenefitsEarned: { trialDays: 30 },
    },
  });
  mock.onGet(/\/referrals\/me/).reply(200, {
    data: {
      items: [
        {
          userId: 'u1',
          firstName: 'Jane',
          lastName: 'Doe',
          status: 'active',
          registeredAt: new Date().toISOString(),
        },
        {
          userId: 'u2',
          firstName: 'John',
          lastName: 'Smith',
          status: 'pending',
          registeredAt: new Date().toISOString(),
        },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
      limit: 20,
    },
  });
};

mockReferralResponses();

const meta: Meta<typeof ReferralSection> = {
  title: 'Profile/ReferralSection',
  component: ReferralSection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Referral program section. Data loads only when the section is expanded. Requires business_owner role in full Profile context.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReferralSection>;

export const Default: Story = {
  render: () => ({
    components: { ReferralSection },
    template: `
      <div class="max-w-2xl">
        <ReferralSection />
      </div>
    `,
  }),
};

export const Expanded: Story = {
  render: () => ({
    components: { ReferralSection },
    template: `
      <div class="max-w-2xl">
        <ReferralSection />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Click the header to expand and load referral data. Data fetches only on first expand.',
      },
    },
  },
};
