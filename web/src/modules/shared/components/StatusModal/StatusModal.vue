<script>
import { shallowRef, computed, onMounted, nextTick } from 'vue';
import { useTheme } from '@/modules/shared/composables/useTheme';
import SuccessIcon from '../SuccessIcon/SuccessIcon.vue';
import ErrorIcon from '../ErrorIcon/ErrorIcon.vue';
import WarningIcon from '../WarningIcon/WarningIcon.vue';
import InfoIcon from '../InfoIcon/InfoIcon.vue';
import { styleConfettiElements } from '@/modules/shared/utils/styleConfetti';

export default {
  name: 'StatusModal',

  components: {
    SuccessIcon,
    ErrorIcon,
    WarningIcon,
    InfoIcon,
  },

  props: {
    // Propiedades base
    id: {
      type: String,
      default: () => `modal-${Date.now()}`,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'success',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value),
    },

    // Contenido
    title: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      default: null,
    },
    details: {
      type: Object,
      default: () => ({}),
    },
    additionalInfo: {
      type: String,
      default: null,
    },

    // Acción
    actionText: {
      type: String,
      default: null,
    },
    actionAriaLabel: {
      type: String,
      default: 'Continue',
    },

    // Visuales
    showEffects: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['action', 'close'],

  setup(props, { emit }) {
    const { isDark } = useTheme();
    const prefersReducedMotion = shallowRef(false);

    // Valores predeterminados basados en el tipo
    const defaultTitles = {
      success: 'Operation Successful!',
      error: 'Operation Error',
      warning: 'Attention Required',
      info: 'Information',
    };

    const defaultMessages = {
      success: 'The operation has been completed successfully.',
      error: 'The requested operation could not be completed.',
      warning: 'The operation requires additional verification.',
      info: 'Information about the requested operation.',
    };

    const defaultActions = {
      success: 'Continue',
      error: 'Retry',
      warning: 'Understood',
      info: 'Accept',
    };

    // Textos dinámicos basados en el tipo
    const defaultTitle = computed(() => defaultTitles[props.type]);
    const defaultMessage = computed(() => defaultMessages[props.type]);
    const defaultActionText = computed(() => defaultActions[props.type]);

    // Clases de colores dinámicas
    const headerColorClasses = computed(() => {
      return {
        success: 'bg-gradient-to-r from-green-500 to-emerald-500',
        error: 'bg-gradient-to-r from-red-500 to-rose-500',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
        info: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      }[props.type];
    });

    const circleColorClasses = computed(() => {
      return {
        success: 'bg-gradient-to-r from-green-500 to-emerald-500',
        error: 'bg-gradient-to-r from-red-500 to-rose-500',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
        info: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      }[props.type];
    });

    const buttonColorClasses = computed(() => {
      const baseClasses = 'bg-gradient-to-r';
      const typeClasses = {
        success: 'from-green-500 to-emerald-500 focus:ring-green-300',
        error: 'from-red-500 to-rose-500 focus:ring-red-300',
        warning: 'from-amber-500 to-orange-500 focus:ring-amber-300',
        info: 'from-blue-500 to-indigo-500 focus:ring-blue-300',
      };

      return `${baseClasses} ${typeClasses[props.type]}`;
    });

    // Información adicional basada en el tipo
    const additionalInfoBorderClass = computed(() => {
      const borders = {
        error: isDark.value ? 'border-red-900/30' : 'border-red-200',
        warning: isDark.value ? 'border-amber-900/30' : 'border-amber-200',
        success: isDark.value ? 'border-green-900/30' : 'border-green-200',
        info: isDark.value ? 'border-blue-900/30' : 'border-blue-200',
      };
      return `border-t ${borders[props.type]}`;
    });

    const additionalInfoTextClass = computed(() => {
      const texts = {
        error: isDark.value ? 'text-red-400' : 'text-red-600',
        warning: isDark.value ? 'text-amber-400' : 'text-amber-600',
        success: isDark.value ? 'text-green-400' : 'text-green-600',
        info: isDark.value ? 'text-blue-400' : 'text-blue-600',
      };
      return `${texts[props.type]} text-sm`;
    });

    const modalBgClasses = computed(() => (isDark.value ? 'bg-gray-800' : 'bg-white'));
    const modalTextClasses = computed(() => (isDark.value ? 'text-white' : 'text-gray-800'));
    const modalSubtextClasses = computed(() => (isDark.value ? 'text-gray-300' : 'text-gray-600'));
    const detailsBgClasses = computed(() => (isDark.value ? 'bg-gray-700/30' : 'bg-gray-50'));
    const detailsLabelClasses = computed(() => (isDark.value ? 'text-gray-400' : 'text-gray-500'));
    const detailsValueClasses = computed(() => (isDark.value ? 'text-gray-300' : 'text-gray-700'));

    const additionalInfoLabel = computed(() => {
      return {
        error: 'Error',
        warning: 'Notice',
        success: 'Note',
        info: 'Information',
      }[props.type];
    });

    // Ícono dinámico basado en el tipo
    const iconComponent = computed(() => {
      return {
        success: SuccessIcon,
        error: ErrorIcon,
        warning: WarningIcon,
        info: InfoIcon,
      }[props.type];
    });

    // Formatear etiquetas de detalles (camelCase a palabras)
    const formatLabel = (key) => {
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    // Manejador de acción del botón
    const onAction = () => {
      emit('action');
      emit('close');
    };

    // Animaciones
    const onBeforeEnter = (el) => {
      el.style.opacity = '0';
    };

    const onEnter = (el, done) => {
      const duration = prefersReducedMotion.value ? 0.15 : 0.35;

      nextTick(() => {
        el.style.opacity = '1';
        el.style.transition = `opacity ${duration}s ease-out`;

        const modalContent = el.querySelector('[ref="modalContent"]');
        if (modalContent) {
          modalContent.style.transform = 'scale(0.95)';

          setTimeout(() => {
            modalContent.style.transform = 'scale(1)';
            modalContent.style.transition = `transform ${duration}s cubic-bezier(0.175, 0.885, 0.32, 1.275)`;

            if (props.type === 'success' && props.showEffects && !prefersReducedMotion.value) {
              setupConfetti();
            }

            setTimeout(done, duration * 1000);
          }, 100);
        } else {
          setTimeout(done, duration * 1000);
        }
      });
    };

    const onLeave = (el, done) => {
      const duration = prefersReducedMotion.value ? 0.15 : 0.25;

      el.style.opacity = '0';
      el.style.transition = `opacity ${duration}s ease-in`;

      const modalContent = el.querySelector('[ref="modalContent"]');
      if (modalContent) {
        modalContent.style.transform = 'scale(0.95)';
        modalContent.style.transition = `transform ${duration}s ease-in`;
      }

      setTimeout(done, duration * 1000);
    };

    // Configuración de confeti
    const setupConfetti = () => {
      if (prefersReducedMotion.value) return;

      nextTick(() => {
        styleConfettiElements();
      });
    };

    onMounted(() => {
      prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    return {
      prefersReducedMotion,
      defaultTitle,
      defaultMessage,
      defaultActionText,
      headerColorClasses,
      circleColorClasses,
      buttonColorClasses,
      additionalInfoBorderClass,
      additionalInfoTextClass,
      additionalInfoLabel,
      modalBgClasses,
      modalTextClasses,
      modalSubtextClasses,
      detailsBgClasses,
      detailsLabelClasses,
      detailsValueClasses,
      iconComponent,
      formatLabel,
      onAction,
      onBeforeEnter,
      onEnter,
      onLeave,
    };
  },
};
</script>

<template>
  <Transition :css="false" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`${id}-title`"
    >
      <div
        ref="modalContent"
        class="relative overflow-hidden rounded-2xl shadow-2xl max-w-md w-full mx-4"
        :class="[
          modalBgClasses,
          {
            'success-pulse': type === 'success' && showEffects,
            'error-shake': type === 'error',
            'warning-pulse': type === 'warning',
          },
        ]"
      >
        <!-- Header con efecto de gradiente animado -->
        <div class="h-16 relative overflow-hidden" :class="headerColorClasses">
          <div class="absolute inset-0 shimmer-effect"></div>
        </div>

        <!-- Contenido de la confirmación -->
        <div class="p-6 pb-8 text-center">
          <!-- Círculo con ícono animado -->
          <div
            class="mx-auto -mt-12 h-24 w-24 rounded-full flex items-center justify-center shadow-lg relative"
            :class="modalBgClasses"
          >
            <div
              class="h-20 w-20 rounded-full flex items-center justify-center status-circle"
              :class="circleColorClasses"
            >
              <!-- Ícono dinámico basado en el tipo -->
              <component :is="iconComponent" />
            </div>
            <!-- Contenedor para partículas -->
            <div v-if="showEffects && !prefersReducedMotion" class="particles-container">
              <div
                v-for="n in 12"
                :key="`particle-${n}`"
                class="particle"
                :class="`particle-${n}`"
              ></div>
            </div>
          </div>

          <!-- Textos animados -->
          <h2
            :id="`${id}-title`"
            class="text-3xl font-bold mt-6 mb-1 fade-in-up"
            :class="modalTextClasses"
            style="--delay: 100ms"
          >
            {{ title || defaultTitle }}
          </h2>
          <p class="text-lg fade-in-up" :class="modalSubtextClasses" style="--delay: 200ms">
            {{ message || defaultMessage }}
          </p>

          <!-- Detalles de la transacción -->
          <div
            v-if="details && Object.keys(details).length"
            class="mt-6 p-4 rounded-lg text-left fade-in-up"
            :class="detailsBgClasses"
            style="--delay: 300ms"
          >
            <div
              v-for="(value, key) in details"
              :key="key"
              class="flex justify-between text-sm mb-1"
            >
              <span :class="detailsLabelClasses">{{ formatLabel(key) }}:</span>
              <span :class="detailsValueClasses">{{ value }}</span>
            </div>

            <!-- Información adicional específica del tipo -->
            <div v-if="additionalInfo" class="mt-2 pt-2" :class="additionalInfoBorderClass">
              <p :class="additionalInfoTextClass">
                <span class="font-medium">{{ additionalInfoLabel }}:</span> {{ additionalInfo }}
              </p>
            </div>
          </div>

          <!-- Botón de acción -->
          <button
            v-if="actionText"
            class="mt-6 px-8 py-3 text-white font-semibold rounded-lg hover-scale focus:outline-none focus:ring-4 fade-in-up"
            style="--delay: 400ms"
            :class="buttonColorClasses"
            :aria-label="actionAriaLabel"
            @click="onAction"
          >
            {{ actionText }}
          </button>
        </div>

        <!-- Confeti (solo para éxito) -->
        <div
          v-if="type === 'success' && showEffects && !prefersReducedMotion"
          class="confetti-container"
        >
          <div
            v-for="n in 30"
            :key="`confetti-${n}`"
            class="confetti"
            :class="`confetti-${n}`"
          ></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
:root {
  --success-color: rgb(16, 185, 129);
  --error-color: rgb(239, 68, 68);
  --warning-color: rgb(245, 158, 11);
  --info-color: rgb(59, 130, 246);
}

.shimmer-effect {
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -100% 0;
  }
  50% {
    background-position: 100% 0;
  }
  100% {
    background-position: 300% 0;
  }
}

.status-circle {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.status-circle:before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  opacity: 0;
  z-index: -1;
}

.checkmark {
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: draw-check 0.5s ease-out 0.3s forwards;
}

.crossmark {
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: draw-check 0.5s ease-out 0.3s forwards;
}

.warningmark {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: draw-check 0.5s ease-out 0.3s forwards;
}

.infomark {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: draw-check 0.5s ease-out 0.3s forwards;
}

@keyframes draw-check {
  from {
    stroke-dashoffset: 80;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
  animation-delay: var(--delay, 0ms);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hover-scale {
  transition:
    transform 0.3s ease-out,
    box-shadow 0.3s ease-out;
}

.hover-scale:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
  top: 50%;
  left: 50%;
  pointer-events: none;
}

.success-pulse .status-circle {
  animation: success-pulse 1.5s ease-out;
}

.error-shake {
  animation: error-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.warning-pulse .status-circle {
  animation: warning-pulse 1.5s ease-in-out infinite;
}

@keyframes success-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

@keyframes error-shake {
  10%,
  90% {
    transform: translateX(-1px);
  }
  20%,
  80% {
    transform: translateX(2px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }
  40%,
  60% {
    transform: translateX(4px);
  }
}

@keyframes warning-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes particle-animation {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(var(--scale));
    opacity: 0;
  }
}

.particle-1 {
  --tx: -30px;
  --ty: -40px;
  --scale: 1.2;
  background-color: var(--success-color);
  animation: particle-animation 1s ease-out 0.1s forwards;
}
.particle-2 {
  --tx: 35px;
  --ty: -35px;
  --scale: 0.9;
  background-color: var(--success-color);
  animation: particle-animation 1.2s ease-out 0.15s forwards;
}
.particle-3 {
  --tx: 40px;
  --ty: 10px;
  --scale: 1.1;
  background-color: var(--success-color);
  animation: particle-animation 1.3s ease-out 0.2s forwards;
}
.particle-4 {
  --tx: 20px;
  --ty: 40px;
  --scale: 0.8;
  background-color: var(--success-color);
  animation: particle-animation 1.4s ease-out 0.25s forwards;
}
.particle-5 {
  --tx: -25px;
  --ty: 30px;
  --scale: 1;
  background-color: var(--success-color);
  animation: particle-animation 1.5s ease-out 0.3s forwards;
}
.particle-6 {
  --tx: -40px;
  --ty: -5px;
  --scale: 0.7;
  background-color: var(--success-color);
  animation: particle-animation 1.6s ease-out 0.35s forwards;
}
.particle-7 {
  --tx: -15px;
  --ty: -45px;
  --scale: 1.3;
  background-color: var(--success-color);
  animation: particle-animation 1.7s ease-out 0.4s forwards;
}
.particle-8 {
  --tx: 45px;
  --ty: -15px;
  --scale: 0.9;
  background-color: var(--success-color);
  animation: particle-animation 1.8s ease-out 0.45s forwards;
}
.particle-9 {
  --tx: 30px;
  --ty: 25px;
  --scale: 1.2;
  background-color: var(--success-color);
  animation: particle-animation 1.9s ease-out 0.5s forwards;
}
.particle-10 {
  --tx: -5px;
  --ty: 45px;
  --scale: 0.8;
  background-color: var(--success-color);
  animation: particle-animation 2s ease-out 0.55s forwards;
}
.particle-11 {
  --tx: -35px;
  --ty: 20px;
  --scale: 1;
  background-color: var(--success-color);
  animation: particle-animation 2.1s ease-out 0.6s forwards;
}
.particle-12 {
  --tx: 10px;
  --ty: -30px;
  --scale: 1.1;
  background-color: var(--success-color);
  animation: particle-animation 2.2s ease-out 0.65s forwards;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 10;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  opacity: 0;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(calc(100vh + 100px)) rotate(720deg);
    opacity: 0;
  }
}

@keyframes confetti-sway {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(var(--sway-amount));
  }
  100% {
    transform: translateX(0);
  }
}

.confetti {
  position: absolute;
  top: -20px;
  animation:
    confetti-fall var(--fall-duration, 5s) var(--fall-delay, 0s) linear forwards,
    confetti-sway var(--sway-duration, 3s) var(--sway-delay, 0s) ease-in-out infinite;
  transform-origin: center;
}

@media (prefers-reduced-motion: reduce) {
  .shimmer-effect {
    animation: none;
  }

  .fade-in-up {
    animation: none;
    opacity: 1;
    transform: translateY(0);
  }

  .checkmark,
  .crossmark,
  .warningmark,
  .infomark {
    animation: none;
    stroke-dashoffset: 0;
  }

  .success-pulse .status-circle,
  .error-shake,
  .warning-pulse .status-circle {
    animation: none;
  }

  .particle {
    display: none;
  }

  .hover-scale:hover {
    transform: none;
    box-shadow: none;
  }
}
</style>
