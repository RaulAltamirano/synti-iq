<script lang="ts" src="./Login.ts" />

<template>
  <div
    v-motion="{
      initial: { opacity: 0, y: 20 },
      enter: { opacity: 1, y: 0, transition: { delay: 100, duration: 500, ease: 'easeOut' } },
    }"
    class="w-full"
  >
    <Card variant="elevated" class="max-w-sm w-full">
      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-gray-800 dark:text-white text-2xl font-semibold">Welcome back</h2>
        <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">Sign in to continue</p>
      </div>

      <!-- Social Auth -->
      <SocialAuth />

      <!-- Divider -->
      <div class="flex items-center my-5 text-gray-500 dark:text-gray-400 text-sm">
        <span class="grow border-t border-gray-300 dark:border-gray-600"></span>
        <span class="mx-3">or</span>
        <span class="grow border-t border-gray-300 dark:border-gray-600"></span>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Email + Password (when not in TOTP step) -->
        <template v-if="!showTotpInput">
          <Field
            v-slot="{ componentField, errorMessage }"
            name="email"
            :validate-on-blur="true"
          >
            <div class="space-y-1">
              <Input
                v-bind="componentField"
                type="email"
                name="email"
                placeholder="Email address"
                :prefix-icon="['fas', 'envelope']"
                full-width
                autocomplete="email"
                :error="!!errorMessage"
                :error-message="errorMessage ?? ''"
              />
            </div>
          </Field>

          <Field
            v-slot="{ value, handleChange, handleBlur, errorMessage }"
            name="password"
            :validate-on-blur="true"
          >
            <div class="space-y-1">
              <PasswordInput
                :model-value="value"
                :show-strength="false"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
              <p v-if="errorMessage" class="text-red-500 text-xs mt-1">
                {{ errorMessage }}
              </p>
            </div>
          </Field>

          <!-- Form Options -->
          <div class="flex justify-end items-center">
            <RouterLink
              to="/auth/forgot-password"
              class="text-sm text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </RouterLink>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="primary"
            size="md"
            :loading="isLoading"
            :disabled="isLoading"
            full-width
          >
            Sign in
          </Button>
        </template>

        <!-- TOTP Step (when 2FA required) -->
        <template v-else>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Enter the 6-digit code from your authenticator app or a backup code (XXXX-XXXX-XXXX):
          </p>
          <TotpInput
            v-model="totpCode"
            placeholder="000000 or XXXX-XXXX-XXXX"
            :accept-backup-code="true"
          />
          <div class="flex gap-3">
            <Button variant="ghost" type="button" class="flex-1" @click="handleBackFromTotp">
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              class="flex-1"
              :loading="isLoading"
              :disabled="!isTotpCodeValid || isLoading"
            >
              Verify
            </Button>
          </div>
        </template>
      </form>

      <!-- Footer Links -->
      <div class="mt-6 space-y-2 text-center">
        <p class="text-gray-700 dark:text-gray-300 text-sm">
          Don't have an account?
          <RouterLink to="/auth/register" class="text-primary font-medium hover:underline ml-1">
            Sign up
          </RouterLink>
        </p>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Want to register your business?
          <RouterLink
            to="/auth/register-business"
            class="text-primary font-medium hover:underline ml-1"
          >
            Create business account
          </RouterLink>
        </p>
      </div>
    </Card>
  </div>
</template>
