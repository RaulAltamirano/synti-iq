<script lang="ts" src="./SocialAuth.ts" />

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
    <div class="relative">
      <button
        type="button"
        class="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm font-medium px-3 py-2.5 min-h-11 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800"
        :class="{ 'opacity-60 cursor-not-allowed': disabled }"
        :disabled="disabled"
        :title="disabled ? 'Coming soon' : 'Sign in with Google'"
        @click="handleGoogleAuth"
      >
        <img src="../../../../assets/google-logo.svg" alt="Google Icon" class="h-5 w-5 shrink-0" />
        Google
      </button>
      <span
        v-if="showComingSoonTooltip === 'google'"
        class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
      >
        Coming soon
      </span>
    </div>
    <div class="relative">
      <button
        type="button"
        class="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm font-medium px-3 py-2.5 min-h-11 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800"
        :class="{ 'opacity-60 cursor-not-allowed': disabled }"
        :disabled="disabled"
        :title="disabled ? 'Coming soon' : 'Sign in with GitHub'"
        @click="handleGithubAuth"
      >
        <img
          src="../../../../assets/github-logo.svg"
          alt="GitHub Icon"
          class="h-5 w-5 shrink-0 dark:invert"
        />
        GitHub
      </button>
      <span
        v-if="showComingSoonTooltip === 'github'"
        class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
      >
        Coming soon
      </span>
    </div>
  </div>
</template>
