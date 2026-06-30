<template>
  <Transition :css="false" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
    <div
      v-if="showAnimation"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref="modalContent"
        class="relative overflow-hidden rounded-2xl shadow-2xl max-w-md w-full mx-4 bg-white dark:bg-gray-800"
        :class="{
          'success-pulse': status === 'success' && showSuccessPulse,
          'error-shake': status === 'error',
          'warning-pulse': status === 'warning',
        }"
      >
        <!-- Header con efecto de gradiente animado -->
        <div
          class="h-16 relative overflow-hidden"
          :class="[
            status === 'success'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : status === 'error'
                ? 'bg-gradient-to-r from-red-500 to-rose-500'
                : status === 'warning'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500',
          ]"
        >
          <div class="absolute inset-0 shimmer-effect"></div>
        </div>

        <!-- Contenido de la confirmación -->
        <div class="p-6 pb-8 text-center">
          <!-- Círculo con ícono animado -->
          <div
            class="mx-auto -mt-12 h-24 w-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg relative"
          >
            <div
              class="h-20 w-20 rounded-full flex items-center justify-center status-circle"
              :class="[
                status === 'success'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : status === 'error'
                    ? 'bg-gradient-to-r from-red-500 to-rose-500'
                    : status === 'warning'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500',
              ]"
            >
              <!-- Success icon -->
              <svg
                v-if="status === 'success'"
                class="h-10 w-10 text-white checkmark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>

              <!-- Error icon -->
              <svg
                v-else-if="status === 'error'"
                class="h-10 w-10 text-white crossmark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>

              <!-- Warning icon -->
              <svg
                v-else-if="status === 'warning'"
                class="h-10 w-10 text-white warningmark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>

              <!-- Info icon -->
              <svg
                v-else
                class="h-10 w-10 text-white infomark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <!-- Contenedor para partículas -->
            <div class="particles-container">
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
            id="modal-title"
            class="text-3xl font-bold text-gray-800 dark:text-white mt-6 mb-1 fade-in-up"
            style="--delay: 100ms"
          >
            <span v-if="status === 'success'">¡Pago Confirmado!</span>
            <span v-else-if="status === 'error'">Error en la Transacción</span>
            <span v-else-if="status === 'warning'">Pago en Revisión</span>
            <span v-else>Información de Pago</span>
          </h2>
          <p class="text-gray-600 dark:text-gray-300 text-lg fade-in-up" style="--delay: 200ms">
            <span v-if="status === 'success'">Tu transacción ha sido procesada con éxito.</span>
            <span v-else-if="status === 'error'">No se pudo completar tu transacción.</span>
            <span v-else-if="status === 'warning'">Tu pago está siendo verificado.</span>
            <span v-else>Detalles de tu transacción a continuación.</span>
          </p>

          <!-- Detalles de la transacción -->
          <div
            class="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-left fade-in-up"
            style="--delay: 300ms"
          >
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-500 dark:text-gray-400">ID Transacción:</span>
              <span class="text-gray-700 dark:text-gray-300">#TRX-25489</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Hora:</span>
              <span class="text-gray-700 dark:text-gray-300">{{ getCurrentTime() }}</span>
            </div>
            <div
              v-if="status === 'error'"
              class="mt-2 pt-2 border-t border-red-200 dark:border-red-900/30"
            >
              <p class="text-red-600 dark:text-red-400 text-sm">
                <span class="font-medium">Error:</span> Fondos insuficientes
              </p>
            </div>
            <div
              v-if="status === 'warning'"
              class="mt-2 pt-2 border-t border-amber-200 dark:border-amber-900/30"
            >
              <p class="text-amber-600 dark:text-amber-400 text-sm">
                <span class="font-medium">Estimado:</span> 24 horas de revisión
              </p>
            </div>
          </div>

          <!-- Botón de acción -->
          <button
            class="mt-6 px-8 py-3 text-white font-semibold rounded-lg hover-scale focus:outline-none focus:ring-4 fade-in-up"
            style="--delay: 400ms"
            :class="[
              status === 'success'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 focus:ring-green-300'
                : status === 'error'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 focus:ring-red-300'
                  : status === 'warning'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 focus:ring-amber-300'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 focus:ring-blue-300',
            ]"
            aria-label="Continuar después de la confirmación"
            @click="closeAnimation"
          >
            <span v-if="status === 'success'">Continuar</span>
            <span v-else-if="status === 'error'">Reintentar</span>
            <span v-else-if="status === 'warning'">Entendido</span>
            <span v-else>Aceptar</span>
          </button>
        </div>

        <!-- Confeti (solo para éxito) -->
        <div
          v-if="status === 'success' && showConfetti && !prefersReducedMotion"
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

<script>
// Esta parte del script es necesaria solo para las animaciones principales
export default {
  data() {
    return {
      showAnimation: true,
      showSuccessPulse: true,
      showConfetti: true,
      status: 'error', // 'success', 'error', 'warning', 'info'
      prefersReducedMotion: true,
    };
  },

  mounted() {
    // Detectar preferencias de reducción de movimiento
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Ejemplo de uso:
    // Para mostrar el modal: this.showModal('success')
    // Opciones disponibles: 'success', 'error', 'warning', 'info'
  },

  methods: {
    // Método para mostrar el modal con el estado específico
    showModal(status = 'success') {
      this.status = status;
      this.showAnimation = true;

      // Solo mostrar confeti para éxito
      if (status === 'success' && !this.prefersReducedMotion) {
        setTimeout(() => {
          this.showSuccessPulse = true;
          this.showConfetti = true;
          this.setupConfetti();
        }, 300);
      }
    },

    // Cerrar el modal
    closeAnimation() {
      this.showAnimation = false;
      this.showSuccessPulse = false;
      this.showConfetti = false;
    },

    // Animaciones de transición
    onBeforeEnter(el) {
      el.style.opacity = '0';
      if (el.querySelector('[ref="modalContent"]')) {
        el.querySelector('[ref="modalContent"]').style.transform = 'scale(0.95)';
      }
    },

    onEnter(el, done) {
      const duration = this.prefersReducedMotion ? 0.15 : 0.35;

      // Animación del backdrop
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transition = `opacity ${duration}s ease-out`;

        // Animación del contenido
        if (el.querySelector('[ref="modalContent"]')) {
          setTimeout(() => {
            el.querySelector('[ref="modalContent"]').style.transform = 'scale(1)';
            el.querySelector('[ref="modalContent"]').style.transition =
              `transform ${duration}s cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
            setTimeout(done, duration * 1000);
          }, 100);
        } else {
          setTimeout(done, duration * 1000);
        }
      }, 50);
    },

    onLeave(el, done) {
      const duration = this.prefersReducedMotion ? 0.15 : 0.25;

      el.style.opacity = '0';
      el.style.transition = `opacity ${duration}s ease-in`;

      if (el.querySelector('[ref="modalContent"]')) {
        el.querySelector('[ref="modalContent"]').style.transform = 'scale(0.95)';
        el.querySelector('[ref="modalContent"]').style.transition =
          `transform ${duration}s ease-in`;
      }

      setTimeout(done, duration * 1000);
    },

    // Configuración de los confeti
    setupConfetti() {
      if (this.prefersReducedMotion) return;

      const confettiElements = document.querySelectorAll('.confetti');
      const colors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];

      confettiElements.forEach((el, index) => {
        const left = `${Math.random() * 100}%`;
        const width = `${Math.random() * 8 + 5}px`;
        const height = width;
        const bgColor = colors[Math.floor(Math.random() * colors.length)];
        const fallDuration = `${Math.random() * 3 + 2}s`;
        const fallDelay = `${Math.random() * 1.5}s`;
        const swayAmount = `${Math.random() * 50 - 25}px`;
        const swayDuration = `${Math.random() * 2 + 2}s`;
        const swayDelay = `${Math.random() * 1}s`;

        el.style.width = width;
        el.style.height = height;
        el.style.left = left;
        el.style.backgroundColor = bgColor;
        el.style.opacity = '0';
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        el.style.setProperty('--fall-duration', fallDuration);
        el.style.setProperty('--fall-delay', fallDelay);
        el.style.setProperty('--sway-amount', swayAmount);
        el.style.setProperty('--sway-duration', swayDuration);
        el.style.setProperty('--sway-delay', swayDelay);
      });
    },

    // Obtener hora actual
    getCurrentTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
  },
};
</script>

<style scoped>
/* Estilos de base */
:root {
  --success-color: rgb(16, 185, 129);
  --error-color: rgb(239, 68, 68);
  --warning-color: rgb(245, 158, 11);
  --info-color: rgb(59, 130, 246);
}

/* Efecto Shimmer */
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

/* Animaciones del ícono de estado */
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

/* Animaciones de aparición de contenido */
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

/* Animación del botón */
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

/* Partículas */
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

/* Generación dinámica de partículas */
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

/* Partículas dinámicas */
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

/* Confeti */
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

/* Estilos dinámicos para confeti */
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

/* Generación dinámica de confeti */
.confetti {
  position: absolute;
  top: -20px;
  animation:
    confetti-fall var(--fall-duration, 5s) var(--fall-delay, 0s) linear forwards,
    confetti-sway var(--sway-duration, 3s) var(--sway-delay, 0s) ease-in-out infinite;
  transform-origin: center;
}

/* Estilos para prefers-reduced-motion */
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
