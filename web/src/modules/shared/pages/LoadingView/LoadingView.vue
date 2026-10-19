<script lang="ts" src="./LoadingView.ts" />

<template>
  <div
    class="min-h-screen flex items-center justify-center transition-colors duration-500"
    :class="[isDark ? 'bg-neutral-950' : 'bg-neutral-50']"
  >
    <div class="w-full max-w-md p-8">
      <!-- Spinner principal -->
      <div class="relative mx-auto w-24 h-24 mb-8">
        <div
          class="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
          :class="[
            isDark ? 'border-white/20 border-t-white' : 'border-neutral-200 border-t-neutral-950',
          ]"
        ></div>
      </div>

      <!-- Barra de progreso -->
      <div
        class="h-1 mb-6 overflow-hidden rounded-full"
        :class="[isDark ? 'bg-neutral-800' : 'bg-neutral-200']"
      >
        <div
          class="h-full w-full animate-progress origin-left rounded-full"
          :class="[isDark ? 'bg-white' : 'bg-neutral-950']"
        ></div>
      </div>

      <!-- Texto de carga -->
      <div class="text-center space-y-2" :class="[isDark ? 'text-white' : 'text-neutral-950']">
        <p class="text-sm font-medium tracking-wider uppercase">
          <span>Loading</span>
          <span
            v-for="(dot, i) in 3"
            :key="i"
            class="inline-block animate-bounce"
            :style="`animation-delay: ${i * 150}ms`"
            >.</span
          >
        </p>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes progress {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-progress {
  animation: progress 2s infinite;
}
</style>
