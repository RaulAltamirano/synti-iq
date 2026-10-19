<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AxiosError, type AxiosRequestConfig } from 'axios';
import { useForm, Field } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import PasswordInput from '@/modules/auth/components/PasswordInput/PasswordInput.vue';
import { Button, Card } from '@/modules/ui/components';
import { setPasswordFormSchema } from '@/modules/auth/schemas/auth-forms.schema';
import { ApiService } from '@/modules/services/api-service';
import { ENDPOINTS } from '@/modules/services/constants/constants-endpoints';

const route = useRoute();
const router = useRouter();

const setPasswordSchema = toTypedSchema(setPasswordFormSchema);

const { values, validate } = useForm({
  validationSchema: setPasswordSchema,
  initialValues: {
    password: '',
    confirmPassword: '',
  },
});

const token = ref('');
const errorMessage = ref<string | null>(null);
const success = ref(false);
const submitting = ref(false);

const missingToken = computed(
  () => token.value.length < 32 // matches API MinLength(32) for opaque tokens
);

onMounted(() => {
  const q = route.query.token;
  let raw = '';
  if (typeof q === 'string') {
    raw = q;
  } else if (Array.isArray(q) && q.length > 0 && typeof q[0] === 'string') {
    raw = q[0];
  }
  token.value = raw;
});

function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    const m = data?.message;
    if (typeof m === 'string' && m.length > 0) return m;
    if (Array.isArray(m) && m.length > 0) return m.join(', ');
    const status = err.response?.status;
    if (status === 404) return 'This invitation link is invalid or has already been used.';
    if (status === 422) return 'This link has expired or is no longer valid.';
  }
  return 'Could not set your password. Please try again or request a new invitation.';
}

async function handleSubmit(): Promise<void> {
  errorMessage.value = null;

  if (missingToken.value) {
    errorMessage.value = 'Invalid invitation link. Open the link from your email.';
    return;
  }

  const { valid } = await validate();
  if (!valid) return;

  submitting.value = true;
  try {
    const requestConfig: AxiosRequestConfig & { skipAuthRefresh?: boolean } = {
      skipAuthRefresh: true,
    };
    await ApiService.getInstance().api.post(
      ENDPOINTS.PASSWORD_SETUP,
      {
        token: token.value,
        password: values.password,
      },
      requestConfig
    );
    success.value = true;
    setTimeout(() => {
      router.push({ name: 'Login' }).catch(() => undefined);
    }, 2000);
  } catch (err) {
    errorMessage.value = extractErrorMessage(err);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div
    v-motion="{
      initial: { opacity: 0, y: 20 },
      enter: { opacity: 1, y: 0, transition: { delay: 100, duration: 500, ease: 'easeOut' } },
    }"
    class="w-full"
  >
    <Card variant="elevated" class="max-w-sm w-full">
      <div class="text-center mb-6">
        <h2 class="text-gray-800 dark:text-white text-2xl font-semibold">Set your password</h2>
        <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Choose a password to finish activating your cashier account.
        </p>
      </div>

      <div
        v-if="success"
        class="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-sm p-4 text-center"
        role="status"
      >
        Password saved. Redirecting to sign in…
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <Field
          v-slot="{ value, handleChange, handleBlur, errorMessage: fieldError }"
          name="password"
          :validate-on-blur="true"
        >
          <div class="space-y-1">
            <span class="block text-sm text-gray-700 dark:text-gray-300">New password</span>
            <PasswordInput
              :model-value="value"
              :show-strength="true"
              autocomplete="new-password"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
            <p v-if="fieldError" class="text-red-500 text-xs mt-1" role="alert">
              {{ fieldError }}
            </p>
          </div>
        </Field>

        <Field
          v-slot="{ value, handleChange, handleBlur, errorMessage: fieldError }"
          name="confirmPassword"
          :validate-on-blur="true"
        >
          <div class="space-y-1">
            <span class="block text-sm text-gray-700 dark:text-gray-300">Confirm password</span>
            <PasswordInput
              :model-value="value"
              :show-strength="false"
              autocomplete="new-password"
              name="confirmPassword"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
            <p v-if="fieldError" class="text-red-500 text-xs mt-1" role="alert">
              {{ fieldError }}
            </p>
          </div>
        </Field>

        <p v-if="errorMessage" class="text-red-600 dark:text-red-400 text-sm" role="alert">
          {{ errorMessage }}
        </p>

        <Button
          type="submit"
          variant="primary"
          size="md"
          :loading="submitting"
          :disabled="submitting || missingToken"
          full-width
        >
          Save password
        </Button>

        <p v-if="missingToken" class="text-amber-700 dark:text-amber-300 text-xs text-center">
          Open this page using the link from your invitation email (it includes a secure token).
        </p>
      </form>
    </Card>
  </div>
</template>
