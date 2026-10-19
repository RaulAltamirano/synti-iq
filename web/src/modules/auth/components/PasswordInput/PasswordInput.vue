<script lang="ts" src="./PasswordInput.ts" />

<template>
  <div class="relative space-y-3">
    <div class="relative group rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <FontAwesomeIcon
        icon="lock"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-300 group-focus-within:text-blue-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
        size="sm"
      />
      <input
        :type="showPassword ? 'text' : 'password'"
        :name="name"
        :autocomplete="autocomplete"
        :value="localValue"
        placeholder="Password"
        class="w-full py-2.5 pl-12 px-3 border border-[#e5e7eb] dark:border-[#4b5563] rounded-lg text-sm transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-[#374151] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-opacity-10"
        :class="{
          'border-red-400 focus:border-red-500 focus:ring-red-500/20':
            strengthScore < 2 && localValue,
          'border-gray-200 dark:border-gray-700': !localValue || strengthScore >= 2,
        }"
        @input="handleInput"
        @blur="handleInputBlur"
      />
      <button
        type="button"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-300"
        @click="showPassword = !showPassword"
      >
        <FontAwesomeIcon :icon="showPassword ? 'eye' : 'eye-slash'" size="sm" />
      </button>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <div v-if="showStrength && localValue" class="space-y-2">
        <div class="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-500 ease-out bg-gradient-to-r"
            :class="strengthConfig.gradient"
            :style="{ width: `${strengthPercentage}%` }"
          />
        </div>
        <div class="flex items-center space-x-2">
          <FontAwesomeIcon
            :icon="strengthConfig.icon"
            size="sm"
            :class="{
              'text-red-500 dark:text-red-400': strengthConfig.level === 'weak',
              'text-yellow-500 dark:text-yellow-400': strengthConfig.level === 'fair',
              'text-green-500 dark:text-green-400': strengthConfig.level === 'good',
              'text-emerald-600 dark:text-emerald-400': strengthConfig.level === 'strong',
            }"
          />
          <span
            class="text-sm font-medium"
            :class="{
              'text-red-500 dark:text-red-400': strengthConfig.level === 'weak',
              'text-yellow-500 dark:text-yellow-400': strengthConfig.level === 'fair',
              'text-green-500 dark:text-green-400': strengthConfig.level === 'good',
              'text-emerald-600 dark:text-emerald-400': strengthConfig.level === 'strong',
            }"
          >
            {{ strengthConfig.text }}
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>
