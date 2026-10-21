<script lang="ts" src="./TitleCard.ts" />

<template>
  <div
    ref="motionElement"
    class="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800"
  >
    <!-- Back Button -->
    <div v-if="showBackButton">
      <AppButton
        variant="ghost"
        size="sm"
        :icon="['fas', 'arrow-left']"
        title="Go back"
        @click="goBack"
      />
    </div>
    <div v-else class="w-9" />

    <!-- Title with Icon -->
    <div class="flex items-center gap-3">
      <FontAwesomeIcon :icon="['fas', icon]" class="text-xl text-blue-600 dark:text-blue-400" />
      <h1 class="text-xl font-semibold tracking-wide text-gray-800 dark:text-gray-100">
        {{ title }}
      </h1>
    </div>

    <!-- Dynamic Actions -->
    <div class="flex gap-2">
      <AppButton
        v-for="(action, index) in actions"
        :key="index"
        variant="ghost"
        size="sm"
        :icon="['fas', action.icon]"
        :title="action.label"
        @click="action.click"
      />
      <div v-if="actions.length === 0" class="w-9" />
    </div>
  </div>
</template>
