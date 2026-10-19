import type { Meta, StoryObj } from '@storybook/vue3';
import MockAdapter from 'axios-mock-adapter';
import { ApiService } from '@/modules/services/api-service';
import TwoFactorAuth from './TwoFactorAuth.vue';
import { AUTH_2FA_ENDPOINTS } from '@/modules/services/constants/constants-endpoints';

const api = ApiService.getInstance().api;
const mock = new MockAdapter(api);

function setupMockStatus(enabled: boolean) {
  mock.onGet(new RegExp(AUTH_2FA_ENDPOINTS.STATUS)).reply(200, {
    enabled,
    method: enabled ? 'authenticator' : null,
    backupCodesRemaining: enabled ? 10 : 0,
  });
}

function setupMockSetup() {
  mock.onPost(new RegExp(AUTH_2FA_ENDPOINTS.SETUP)).reply(200, {
    secret: 'JBSWY3DPEHPK3PXP',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  });
}

function setupMockVerify() {
  mock.onPost(new RegExp(AUTH_2FA_ENDPOINTS.VERIFY)).reply(200, {
    backupCodes: ['ABCD-1234-EFGH', 'WXYZ-5678-IJKL', 'MNOP-9012-QRST'],
  });
}

function setupMockRegenerate() {
  mock.onPost(new RegExp(AUTH_2FA_ENDPOINTS.REGENERATE_BACKUP_CODES)).reply(200, {
    backupCodes: ['NEW1-2222-AAAA', 'NEW2-3333-BBBB', 'NEW3-4444-CCCC'],
  });
}

function setupMockDisable() {
  mock.onPost(new RegExp(AUTH_2FA_ENDPOINTS.DISABLE)).reply(200, {
    message: '2FA disabled',
  });
}

const meta: Meta<typeof TwoFactorAuth> = {
  title: 'Profile/TwoFactorAuth',
  component: TwoFactorAuth,
  tags: ['autodocs'],
  decorators: [
    (story) => ({
      components: { Story: story },
      template: `
        <div class="max-w-xl p-4">
          <Story />
        </div>
      `,
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Autenticación de dos pasos (2FA) TOTP. Muestra estado, permite activar/desactivar mediante modales guiados con Stepper.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TwoFactorAuth>;

export const Default: Story = {
  decorators: [
    (story) => ({
      components: { Story: story },
      setup() {
        mock.reset();
        setupMockStatus(false);
        return {};
      },
      template: '<Story />',
    }),
  ],
  render: () => ({
    components: { TwoFactorAuth },
    template: '<TwoFactorAuth />',
  }),
};

export const Activado: Story = {
  decorators: [
    (story) => ({
      components: { Story: story },
      setup() {
        mock.reset();
        setupMockStatus(true);
        return {};
      },
      template: '<Story />',
    }),
  ],
  render: () => ({
    components: { TwoFactorAuth },
    template: '<TwoFactorAuth />',
  }),
  parameters: {
    docs: {
      description: {
        story: 'Estado cuando 2FA está activado. Muestra códigos restantes y botón Regenerar.',
      },
    },
  },
};

export const Setup: Story = {
  decorators: [
    (story) => ({
      components: { Story: story },
      setup() {
        mock.reset();
        setupMockStatus(false);
        setupMockSetup();
        setupMockVerify();
        return {};
      },
      template: '<Story />',
    }),
  ],
  render: () => ({
    components: { TwoFactorAuth },
    template: '<TwoFactorAuth />',
  }),
  parameters: {
    docs: {
      description: {
        story: 'Toggle ON para abrir el modal de setup con QR, secret y verificación.',
      },
    },
  },
};

export const Disable: Story = {
  decorators: [
    (story) => ({
      components: { Story: story },
      setup() {
        mock.reset();
        setupMockStatus(true);
        setupMockDisable();
        return {};
      },
      template: '<Story />',
    }),
  ],
  render: () => ({
    components: { TwoFactorAuth },
    template: '<TwoFactorAuth />',
  }),
  parameters: {
    docs: {
      description: {
        story: 'Toggle OFF para abrir el modal de desactivar (requiere código TOTP o respaldo).',
      },
    },
  },
};

export const BackupCodes: Story = {
  decorators: [
    (story) => ({
      components: { Story: story },
      setup() {
        mock.reset();
        setupMockStatus(true);
        setupMockRegenerate();
        return {};
      },
      template: '<Story />',
    }),
  ],
  render: () => ({
    components: { TwoFactorAuth },
    template: '<TwoFactorAuth />',
  }),
  parameters: {
    docs: {
      description: {
        story: 'Click Regenerar para abrir el modal con nuevos códigos de respaldo.',
      },
    },
  },
};
