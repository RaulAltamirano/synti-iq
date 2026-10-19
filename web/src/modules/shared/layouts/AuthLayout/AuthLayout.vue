<script src="./AuthLayout.ts" lang="ts" />

<template>
  <AnimatedBackground />

  <div :class="layoutClasses">
    <div ref="contentRef" class="relative z-10 w-full max-w-md mt-4 sm:mt-12">
      <RouterView v-slot="{ Component }">
        <template v-if="Component">
          <Transition
            name="fade"
            mode="out-in"
            appear
            @before-enter="handleBeforeEnter"
            @before-leave="handleBeforeLeave"
          >
            <Suspense>
              <div class="transition-wrapper">
                <component :is="Component" />
              </div>
              <template #fallback>
                <div class="flex items-center justify-center p-8">
                  <div class="loader"></div>
                </div>
              </template>
            </Suspense>
          </Transition>
        </template>
      </RouterView>
    </div>
    <ToggleThemeButton />
  </div>
</template>

<style scoped>
@reference "../../../../assets/tailwind.css";

.transition-wrapper {
  @apply w-full transition-all duration-300;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.loader {
  @apply w-8 h-8 border-4 border-gray-200 dark:border-gray-600 rounded-full;
  border-top-color: #1d4ed8;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
