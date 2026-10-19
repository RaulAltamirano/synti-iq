<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export interface StepperStep {
  id: number;
  title: string;
  shortTitle: string;
  icon: string;
}

export interface StepperProps {
  steps: StepperStep[];
  modelValue: number;
  animated?: boolean;
}

const props = withDefaults(defineProps<StepperProps>(), {
  animated: true,
});

defineEmits<{ 'update:modelValue': [page: number] }>();

const totalSteps = computed(() => props.steps.length);
const isEntered = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    isEntered.value = true;
  });
});

const currentTitle = computed(() => props.steps[props.modelValue - 1]?.title ?? '');
const ariaLabel = computed(
  () => `Step ${props.modelValue} of ${totalSteps.value}: ${currentTitle.value}`
);
</script>

<template>
  <div
    class="stepper-root border-b border-gray-200 py-5 transition-colors duration-300 dark:border-gray-600 sm:py-6"
    :class="{ 'stepper-enter-done': isEntered }"
    role="progressbar"
    :aria-valuenow="modelValue"
    aria-valuemin="1"
    :aria-valuemax="totalSteps"
    :aria-label="ariaLabel"
  >
    <div class="flex items-start gap-0 sm:gap-2">
      <template v-for="(step, idx) in steps" :key="step.id">
        <!-- Connector line -->
        <div
          v-if="idx > 0"
          class="stepper-connector flex-1 min-w-0 h-1 mx-1 sm:mx-1.5 rounded-full transition-colors duration-300 origin-left mt-4 sm:mt-5"
          :class="idx < modelValue ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'"
          aria-hidden="true"
        />
        <!-- Step circle + label -->
        <div class="flex flex-col items-center shrink-0 min-w-16 sm:min-w-20">
          <div class="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
            <!-- Fluid waves around active step (no pulse on circle) -->
            <template v-if="animated && idx + 1 === modelValue">
              <div
                class="stepper-wave stepper-wave--1 absolute inset-0 rounded-full pointer-events-none"
                aria-hidden="true"
              />
              <div
                class="stepper-wave stepper-wave--2 absolute inset-0 rounded-full pointer-events-none"
                aria-hidden="true"
              />
              <div
                class="stepper-wave stepper-wave--3 absolute inset-0 rounded-full pointer-events-none"
                aria-hidden="true"
              />
            </template>
            <div
              class="stepper-circle relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors duration-300 shrink-0 border-2"
              :class="[
                idx + 1 < modelValue
                  ? 'bg-success-600 border-success-700 text-white shadow-sm'
                  : idx + 1 === modelValue
                    ? 'stepper-circle--active bg-primary border-primary-800 text-white ring-4 shadow-md ring-primary/30'
                    : 'bg-white border-gray-300 text-gray-600 shadow-sm dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300',
              ]"
              aria-hidden="true"
            >
              <FontAwesomeIcon
                v-if="idx + 1 < modelValue"
                :icon="['fas', 'check']"
                class="w-4 h-4 sm:w-5 sm:h-5 text-white"
              />
              <FontAwesomeIcon
                v-else
                :icon="['fas', step.icon]"
                class="w-4 h-4 sm:w-5 sm:h-5"
                :class="idx + 1 === modelValue ? 'text-white' : ''"
              />
            </div>
          </div>
          <span
            class="mt-2 text-xs font-semibold text-center max-w-[80px] sm:max-w-[88px] leading-tight tracking-tight"
            :class="
              idx + 1 === modelValue
                ? 'text-gray-900 dark:text-primary'
                : idx + 1 < modelValue
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-500'
            "
          >
            {{ step.shortTitle }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Entrance: pure CSS, no VueUse dependency */
.stepper-root {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1),
    transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.stepper-root.stepper-enter-done {
  opacity: 1;
  transform: translateY(0);
}

/* Active step: soft halo glow (opacity only, no scale/pulse) */
@keyframes stepper-active-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 0 rgb(59 130 246 / 0.15));
  }
  50% {
    filter: drop-shadow(0 0 8px rgb(59 130 246 / 0.4)) drop-shadow(0 0 16px rgb(59 130 246 / 0.2));
  }
}

.stepper-circle--active {
  animation: stepper-active-glow 2.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Waves: fluid concentric rings */
@keyframes stepper-wave {
  0% {
    opacity: 0.55;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.8);
  }
}

.stepper-wave {
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.45) 0%,
    rgba(59, 130, 246, 0.2) 45%,
    rgba(59, 130, 246, 0.06) 70%,
    transparent 100%
  );
  animation: stepper-wave 2.6s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
  will-change: transform, opacity;
}

.stepper-wave--1 {
  animation-duration: 2.2s;
  animation-delay: 0s;
}

.stepper-wave--2 {
  animation-duration: 2.8s;
  animation-delay: 0.65s;
}

.stepper-wave--3 {
  animation-duration: 3.2s;
  animation-delay: 1.3s;
}

@media (prefers-reduced-motion: reduce) {
  .stepper-root {
    opacity: 1;
    transform: none;
  }
  .stepper-circle--active {
    animation: none;
  }
  .stepper-wave {
    animation: none;
    opacity: 0;
  }
}
</style>
