<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { SubscriptionPlan } from '../../composables/useSubscriptionWizard';

interface Props {
  selectedPlan: SubscriptionPlan | null;
}

interface Emits {
  (e: 'update:selectedPlan', value: SubscriptionPlan | null): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

// Mock data para los planes
const plans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 29.99,
    period: 'monthly',
    features: [
      'Hasta 100 productos',
      '1 tienda',
      'Soporte por email',
      'Reportes básicos',
      'Actualizaciones mensuales',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79.99,
    period: 'monthly',
    popular: true,
    features: [
      'Productos ilimitados',
      'Hasta 5 tiendas',
      'Soporte prioritario',
      'Reportes avanzados',
      'Actualizaciones semanales',
      'API access',
      'Integraciones premium',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199.99,
    period: 'monthly',
    features: [
      'Productos ilimitados',
      'Tiendas ilimitadas',
      'Soporte 24/7',
      'Reportes personalizados',
      'Actualizaciones diarias',
      'API access completo',
      'Todas las integraciones',
      'Cuenta manager dedicado',
      'Onboarding personalizado',
    ],
  },
];

const selectPlan = (plan: SubscriptionPlan) => {
  emit('update:selectedPlan', plan);
};
</script>

<template>
  <div
    v-motion="{
      initial: { opacity: 0, y: 10 },
      enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    }"
  >
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
      <FontAwesomeIcon :icon="['fas', 'boxes']" class="h-5 w-5 mr-2 text-purple-500" />
      Selecciona tu Plan de Suscripción
    </h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Plan Básico -->
      <div
        :class="[
          'relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105',
          selectedPlan?.id === plans[0].id
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800',
        ]"
        @click="selectPlan(plans[0])"
      >
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-xl font-bold text-gray-800 dark:text-white">
              {{ plans[0].name }}
            </h4>
            <div
              v-if="selectedPlan?.id === plans[0].id"
              class="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
            >
              <FontAwesomeIcon :icon="['fas', 'check']" class="h-3 w-3 text-white" />
            </div>
          </div>

          <div class="mb-4">
            <span class="text-3xl font-bold text-gray-800 dark:text-white">
              ${{ plans[0].price }}
            </span>
            <span class="text-gray-600 dark:text-gray-400 ml-1">
              /{{ plans[0].period === 'monthly' ? 'mes' : 'año' }}
            </span>
          </div>

          <ul class="space-y-3 flex-1 mb-6">
            <li v-for="(feature, index) in plans[0].features" :key="index" class="flex items-start">
              <FontAwesomeIcon
                :icon="['fas', 'check-circle']"
                class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                :class="selectedPlan?.id === plans[0].id ? 'text-purple-500' : 'text-green-500'"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ feature }}</span>
            </li>
          </ul>

          <button
            :class="[
              'w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-300',
              selectedPlan?.id === plans[0].id
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
            ]"
          >
            {{ selectedPlan?.id === plans[0].id ? 'Seleccionado' : 'Seleccionar' }}
          </button>
        </div>
      </div>

      <!-- Plan Pro (Popular) -->
      <div
        :class="[
          'relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105',
          selectedPlan?.id === plans[1].id
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg ring-2 ring-purple-200 dark:ring-purple-800'
            : 'border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600 bg-white dark:bg-gray-800',
        ]"
        @click="selectPlan(plans[1])"
      >
        <!-- Badge Popular -->
        <div
          class="absolute -top-3 left-1/2 transform -translate-x-1/2 px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap"
        >
          MÁS POPULAR
        </div>

        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between mb-4 mt-2">
            <h4 class="text-xl font-bold text-gray-800 dark:text-white">
              {{ plans[1].name }}
            </h4>
            <div
              v-if="selectedPlan?.id === plans[1].id"
              class="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
            >
              <FontAwesomeIcon :icon="['fas', 'check']" class="h-3 w-3 text-white" />
            </div>
          </div>

          <div class="mb-4">
            <span class="text-3xl font-bold text-gray-800 dark:text-white">
              ${{ plans[1].price }}
            </span>
            <span class="text-gray-600 dark:text-gray-400 ml-1">
              /{{ plans[1].period === 'monthly' ? 'mes' : 'año' }}
            </span>
          </div>

          <ul class="space-y-3 flex-1 mb-6">
            <li v-for="(feature, index) in plans[1].features" :key="index" class="flex items-start">
              <FontAwesomeIcon
                :icon="['fas', 'check-circle']"
                class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                :class="selectedPlan?.id === plans[1].id ? 'text-purple-500' : 'text-green-500'"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ feature }}</span>
            </li>
          </ul>

          <button
            :class="[
              'w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-300',
              selectedPlan?.id === plans[1].id
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-purple-500 text-white hover:bg-purple-600',
            ]"
          >
            {{ selectedPlan?.id === plans[1].id ? 'Seleccionado' : 'Seleccionar' }}
          </button>
        </div>
      </div>

      <!-- Plan Enterprise -->
      <div
        :class="[
          'relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105',
          selectedPlan?.id === plans[2].id
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800',
        ]"
        @click="selectPlan(plans[2])"
      >
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-xl font-bold text-gray-800 dark:text-white">
              {{ plans[2].name }}
            </h4>
            <div
              v-if="selectedPlan?.id === plans[2].id"
              class="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
            >
              <FontAwesomeIcon :icon="['fas', 'check']" class="h-3 w-3 text-white" />
            </div>
          </div>

          <div class="mb-4">
            <span class="text-3xl font-bold text-gray-800 dark:text-white">
              ${{ plans[2].price }}
            </span>
            <span class="text-gray-600 dark:text-gray-400 ml-1">
              /{{ plans[2].period === 'monthly' ? 'mes' : 'año' }}
            </span>
          </div>

          <ul class="space-y-3 flex-1 mb-6">
            <li v-for="(feature, index) in plans[2].features" :key="index" class="flex items-start">
              <FontAwesomeIcon
                :icon="['fas', 'check-circle']"
                class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                :class="selectedPlan?.id === plans[2].id ? 'text-purple-500' : 'text-green-500'"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ feature }}</span>
            </li>
          </ul>

          <button
            :class="[
              'w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-300',
              selectedPlan?.id === plans[2].id
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
            ]"
          >
            {{ selectedPlan?.id === plans[2].id ? 'Seleccionado' : 'Seleccionar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
