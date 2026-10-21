<script lang="ts" src="./RegisterBusiness.ts" />

<template>
  <div
    v-motion="{
      initial: { opacity: 0, y: 20 },
      enter: { opacity: 1, y: 0, transition: { delay: 100, duration: 500, ease: 'easeOut' } },
    }"
    class="w-full"
  >
    <Card variant="elevated" class="max-w-[400px] w-full">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="flex justify-center mb-3">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center"
            :class="isDark ? 'bg-blue-900/30' : 'bg-blue-100'"
          >
            <FontAwesomeIcon
              :icon="['fas', 'building']"
              class="text-xl"
              :class="isDark ? 'text-blue-400' : 'text-primary'"
            />
          </div>
        </div>
        <h2 class="text-2xl font-semibold" :class="isDark ? 'text-white' : 'text-gray-800'">
          Create your business
        </h2>
        <p class="text-sm mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
          Start managing your business with SyntiIQ
        </p>
      </div>

      <!-- Referrer Banner (shown when valid referral) -->
      <InfoBanner
        v-if="hasValidReferral"
        variant="success"
        :title="`Referred by ${referrerDisplayName}`"
        :description="benefitsDescription"
        dismissable
        dismiss-title="Remove referral"
        class="mb-5"
        @remove="removeReferral"
      />

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
      <form class="space-y-4" @submit.prevent="submitForm">
        <Field v-slot="{ componentField, errorMessage }" name="firstName" :validate-on-blur="true">
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
        </Field>

        <Field v-slot="{ componentField, errorMessage }" name="lastName" :validate-on-blur="true">
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
        </Field>

        <Field
          v-slot="{ componentField, errorMessage }"
          name="businessName"
          :validate-on-blur="true"
        >
          <AppInput
            v-bind="componentField"
            type="text"
            name="businessName"
            placeholder="Business name"
            :prefix-icon="['fas', 'store']"
            full-width
            :error="!!errorMessage"
            :error-message="errorMessage ?? ''"
          />
        </Field>

        <Field v-slot="{ componentField, errorMessage }" name="email" :validate-on-blur="true">
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

        <!-- Referral Code Section -->
        <div>
          <!-- Toggle button when no referral is active -->
          <button
            v-if="!showReferralField && !hasValidReferral"
            type="button"
            class="text-sm font-medium transition-colors flex items-center gap-1.5"
            :class="
              isDark ? 'text-primary hover:text-blue-400' : 'text-primary hover:text-blue-700'
            "
            @click="toggleReferralField"
          >
            <FontAwesomeIcon :icon="['fas', 'plus']" class="text-xs" />
            Have a referral code?
          </button>

          <!-- Referral code input field -->
          <div v-if="showReferralField && !hasValidReferral" class="space-y-3">
            <div class="flex gap-2">
              <AppInput
                v-model="localReferralCode"
                type="text"
                name="referralCode"
                placeholder="Enter referral code"
                :prefix-icon="['fas', 'ticket']"
                :error="hasAttemptedValidation && !!codeValidationError"
                :error-message="hasAttemptedValidation ? codeValidationError : ''"
                full-width
                @keyup.enter="handleValidateCode"
              />
              <AppButton
                type="button"
                variant="secondary"
                size="md"
                :loading="isValidatingCode"
                :disabled="!localReferralCode.trim()"
                @click="handleValidateCode"
              >
                Validate
              </AppButton>
            </div>

            <!-- Cancel button -->
            <button
              type="button"
              class="text-xs transition-colors"
              :class="
                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              "
              @click="toggleReferralField"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <AppButton
          type="submit"
          variant="primary"
          size="md"
          :loading="isLoading"
          :disabled="!canSubmit"
          full-width
        >
          Create business account
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
          Not a business?
          <RouterLink to="/auth/register" class="text-primary font-medium hover:underline ml-1">
            Register as customer
          </RouterLink>
        </p>
      </div>
    </Card>
  </div>
</template>
