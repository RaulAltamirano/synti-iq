<template>
  <div class="relative w-full pb-3">
    <!-- Botón de alternancia accesible -->
    <button
      class="absolute -top-3 -right-3 p-2.5 rounded-full shadow-lg transition-transform duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 z-20"
      :class="
        isDark
          ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-400'
          : 'bg-white text-indigo-600 hover:bg-gray-50 focus-visible:ring-indigo-500'
      "
      :aria-expanded="showStats"
      aria-controls="stats-panel"
      :aria-label="showStats ? 'Ocultar estadísticas' : 'Mostrar estadísticas'"
      @click="toggleStats"
    >
      <span class="sr-only">{{ showStats ? 'Ocultar estadísticas' : 'Mostrar estadísticas' }}</span>
      <FontAwesomeIcon :icon="showStats ? 'eye-slash' : 'eye'" class="text-sm" aria-hidden="true" />
    </button>

    <!-- Contenedor principal -->
    <div
      id="stats-panel"
      class="relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300"
      :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'"
    >
      <!-- Grid de estadísticas -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4"
        :aria-hidden="!showStats"
      >
        <v-motion
          v-for="(stat, index) in stats"
          :key="stat.id"
          :initial="{ opacity: 0, y: 20 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: index * 0.1,
              duration: 0.5,
              ease: 'easeOut',
            },
          }"
          class="p-5 rounded-lg border relative transition-all group"
          :class="
            isDark
              ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-750'
              : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
          "
        >
          <div class="relative z-10">
            <p class="text-sm font-medium mb-1" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
              {{ stat.label }}
            </p>
            <p class="text-2xl font-bold tracking-tight transition-all group-hover:translate-x-1">
              {{ stat.value }}
            </p>

            <!-- Tendencia con mayor claridad visual -->
            <div
              v-if="stat.trend !== undefined"
              class="flex items-center mt-3 text-xs font-medium"
              :class="[
                stat.trend > 0
                  ? stat.isPositive
                    ? 'text-green-500'
                    : 'text-red-500'
                  : stat.isPositive
                    ? 'text-red-500'
                    : 'text-green-500',
              ]"
            >
              <span
                class="mr-1.5 flex items-center justify-center h-5 w-5 rounded-full transition-transform group-hover:scale-110"
                :class="[
                  stat.trend > 0
                    ? stat.isPositive
                      ? 'bg-green-100 dark:bg-green-900/70'
                      : 'bg-red-100 dark:bg-red-900/70'
                    : stat.isPositive
                      ? 'bg-red-100 dark:bg-red-900/70'
                      : 'bg-green-100 dark:bg-green-900/70',
                ]"
              >
                <FontAwesomeIcon
                  :icon="stat.trend > 0 ? 'arrow-up' : 'arrow-down'"
                  class="text-xs"
                  aria-hidden="true"
                />
              </span>
              <span>{{ Math.abs(stat.trend) }}% vs período anterior</span>
            </div>
          </div>

          <!-- Ícono decorativo con animación sutil -->
          <v-motion
            :initial="{ opacity: 0.4, scale: 0.9, x: 5 }"
            :enter="{
              opacity: 0.5,
              scale: 1,
              x: 0,
              transition: {
                duration: 0.3,
              },
            }"
            class="absolute top-4 right-4 transition-all duration-300 group-hover:opacity-70 group-hover:scale-110"
          >
            <FontAwesomeIcon
              :icon="stat.icon"
              class="text-xl"
              :style="{ color: stat.color }"
              aria-hidden="true"
            />
          </v-motion>

          <!-- Gráfico de fondo decorativo -->
          <v-motion
            :initial="{ opacity: 0, scaleY: 0 }"
            :enter="{
              opacity: 0.07,
              scaleY: 1,
              transition: {
                delay: 0.2 + index * 0.1,
                duration: 0.8,
              },
            }"
            class="absolute bottom-0 left-0 right-0 h-16 origin-bottom"
            aria-hidden="true"
          >
          </v-motion>
        </v-motion>
      </div>

      <!-- Capa animada cuando las estadísticas están ocultas -->
      <v-motion
        v-if="!showStats"
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 0.5 } }"
        :exit="{ opacity: 0, transition: { duration: 0.3 } }"
        class="absolute inset-0 z-10 backdrop-blur-md flex items-center justify-center rounded-xl overflow-hidden"
        :class="
          isDark
            ? 'bg-gradient-to-br from-gray-800/90 to-indigo-900/80'
            : 'bg-gradient-to-br from-white/90 to-indigo-100/80'
        "
        aria-live="polite"
      >
        <!-- Capas de círculos animados -->
        <div class="absolute inset-0 overflow-hidden">
          <v-motion
            :initial="{ scale: 0.8, opacity: 0, x: '5%', y: '5%' }"
            :enter="{
              scale: 1,
              opacity: 0.12,
              x: '0%',
              y: '0%',
              transition: {
                duration: 3,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              },
            }"
            class="absolute -top-10 -right-10 w-64 h-64 rounded-full"
            :class="isDark ? 'bg-indigo-500' : 'bg-indigo-300'"
            aria-hidden="true"
          />
          <v-motion
            :initial="{ scale: 1, opacity: 0, x: '0%', y: '3%' }"
            :enter="{
              scale: 1.2,
              opacity: 0.08,
              x: '2%',
              y: '0%',
              transition: {
                duration: 3.5,
                repeat: Infinity,
                repeatType: 'mirror',
                delay: 0.5,
                ease: 'easeInOut',
              },
            }"
            class="absolute bottom-0 left-1/4 w-48 h-48 rounded-full"
            :class="isDark ? 'bg-purple-500' : 'bg-purple-300'"
            aria-hidden="true"
          />
          <v-motion
            :initial="{ scale: 0.9, opacity: 0, x: '-3%', y: '2%' }"
            :enter="{
              scale: 1.1,
              opacity: 0.05,
              x: '0%',
              y: '0%',
              transition: {
                duration: 4,
                repeat: Infinity,
                repeatType: 'mirror',
                delay: 1,
                ease: 'easeInOut',
              },
            }"
            class="absolute top-1/4 left-0 w-56 h-56 rounded-full"
            :class="isDark ? 'bg-blue-500' : 'bg-blue-300'"
            aria-hidden="true"
          />
        </div>

        <!-- Patrón de puntos decorativo -->
        <div
          class="absolute inset-0 opacity-10"
          :class="isDark ? 'text-gray-400' : 'text-gray-600'"
          aria-hidden="true"
          style="
            background-image: radial-gradient(currentColor 1px, transparent 1px);
            background-size: 20px 20px;
          "
        ></div>
      </v-motion>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/modules/shared/composables/useTheme';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ref } from 'vue';

// Estado del componente
const showStats = ref(false);
const { isDark } = useTheme();
// Función para alternar visibilidad
const toggleStats = () => {
  showStats.value = !showStats.value;
};

// Datos de ejemplo
const stats = ref([
  {
    id: 'usuarios',
    label: 'Usuarios activos',
    value: '8,392',
    trend: 12.3,
    isPositive: true,
    icon: 'users',
    color: '#6366f1', // indigo-500
  },
  {
    id: 'ingresos',
    label: 'Ingresos mensuales',
    value: '$12,543',
    trend: 8.2,
    isPositive: true,
    icon: 'chart-line',
    color: '#10b981', // emerald-500
  },
  {
    id: 'conversiones',
    label: 'Tasa de conversión',
    value: '3.8%',
    trend: -2.1,
    isPositive: false,
    icon: 'exchange-alt',
    color: '#f59e0b', // amber-500
  },
  {
    id: 'tiempo',
    label: 'Tiempo promedio',
    value: '2.4 min',
    trend: -15.3,
    isPositive: true,
    icon: 'clock',
    color: '#ec4899', // pink-500
  },
]);
</script>
