<script lang="ts" src="./Register.ts" />

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
        <h2 class="text-2xl font-semibold" :class="isDark ? 'text-white' : 'text-gray-800'">
          Create account
        </h2>
        <p class="text-sm mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
          Get started for free
        </p>
      </div>

      <!-- Social Auth -->
      <SocialAuth />

      <!-- Divider -->
      <div
        class="flex items-center my-5 text-sm"
        :class="isDark ? 'text-gray-400' : 'text-gray-500'"
      >
        <span class="grow border-t" :class="isDark ? 'border-gray-600' : 'border-gray-300'"></span>
        <span class="mx-3">or</span>
        <span class="grow border-t" :class="isDark ? 'border-gray-600' : 'border-gray-300'"></span>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleSignup">
        <Field v-slot="{ componentField, errorMessage }" name="firstName" :validate-on-blur="true">
          <div class="space-y-1">
            <AppInput
              v-bind="componentField"
              type="text"
              name="firstName"
              placeholder="First name"
              :prefix-icon="['fas', 'user']"
              full-width
              autocomplete="given-name"
              :error="!!errorMessage"
              :error-message="errorMessage ?? ''"
            />
          </div>
        </Field>

        <Field v-slot="{ componentField, errorMessage }" name="lastName" :validate-on-blur="true">
          <div class="space-y-1">
            <AppInput
              v-bind="componentField"
              type="text"
              name="lastName"
              placeholder="Last name"
              :prefix-icon="['fas', 'user']"
              full-width
              autocomplete="family-name"
              :error="!!errorMessage"
              :error-message="errorMessage ?? ''"
            />
          </div>
        </Field>

        <Field v-slot="{ componentField, errorMessage }" name="email" :validate-on-blur="true">
          <div class="space-y-1">
            <AppInput
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
              :show-strength="true"
              autocomplete="new-password"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
            <p v-if="errorMessage" class="text-red-500 text-xs mt-1">
              {{ errorMessage }}
            </p>
          </div>
        </Field>

        <!-- Submit Button -->
        <AppButton
          type="submit"
          variant="primary"
          size="md"
          :loading="isLoading"
          :disabled="isLoading"
          full-width
        >
          Sign up
        </AppButton>
      </form>

      <!-- Footer Links -->
      <div class="mt-6 space-y-2 text-center">
        <p class="text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
          Already have an account?
          <RouterLink to="/auth/login" class="text-primary font-medium hover:underline ml-1">
            Sign in
          </RouterLink>
        </p>
        <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
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
