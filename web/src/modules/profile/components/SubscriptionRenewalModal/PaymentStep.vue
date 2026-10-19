<template>
  <div
    v-motion="{
      initial: { opacity: 0, y: 10 },
      enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    }"
  >
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
      <FontAwesomeIcon :icon="['fas', 'credit-card']" class="h-5 w-5 mr-2 text-purple-500" />
      Información de Pago
    </h3>

    <div class="space-y-6">
      <!-- Resumen del Pedido -->
      <div
        class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      >
        <h4 class="font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <FontAwesomeIcon :icon="['fas', 'receipt']" class="h-4 w-4 mr-2 text-purple-500" />
          Resumen del Pedido
        </h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Plan seleccionado:</span>
            <span class="font-medium text-gray-800 dark:text-white">
              {{ selectedPlan?.name || 'N/A' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Precio:</span>
            <span class="font-medium text-gray-800 dark:text-white">
              ${{ selectedPlan?.price.toFixed(2) || '0.00' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Periodo:</span>
            <span class="font-medium text-gray-800 dark:text-white">
              {{ selectedPlan?.period === 'monthly' ? 'Mensual' : 'Anual' }}
            </span>
          </div>
          <div class="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <span class="font-semibold text-gray-800 dark:text-white">Total:</span>
            <span class="font-bold text-lg text-purple-600 dark:text-purple-400">
              ${{ selectedPlan?.price.toFixed(2) || '0.00' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Dirección de Facturación (Resumen) -->
      <div
        class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      >
        <h4 class="font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <FontAwesomeIcon :icon="['fas', 'map-marker-alt']" class="h-4 w-4 mr-2 text-purple-500" />
          Dirección de Facturación
        </h4>
        <div class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <p>{{ addressData.street }} {{ addressData.number }}</p>
          <p>{{ addressData.neighborhood }}, {{ addressData.city }}</p>
          <p>{{ addressData.state }}, {{ addressData.postalCode }}</p>
          <p>
            {{ addressData.country }}
          </p>
        </div>
      </div>

      <!-- Información de Tarjeta (Placeholder para Stripe) -->
      <div class="space-y-4">
        <h4 class="font-semibold text-gray-800 dark:text-white flex items-center">
          <FontAwesomeIcon :icon="['fas', 'lock']" class="h-4 w-4 mr-2 text-purple-500" />
          Información de Tarjeta
        </h4>

        <!-- Nota sobre integración futura -->
        <div
          class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <div class="flex items-start">
            <FontAwesomeIcon
              :icon="['fas', 'info-circle']"
              class="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0"
            />
            <div class="text-sm text-blue-800 dark:text-blue-200">
              <p class="font-medium mb-1">Integración con Stripe pendiente</p>
              <p>
                La integración con Stripe se implementará posteriormente. Aquí se mostrarán los
                elementos de Stripe como CardElement y PaymentElement.
              </p>
            </div>
          </div>
        </div>

        <!-- Simulación de campos de tarjeta -->
        <div
          class="space-y-4 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <!-- Número de Tarjeta -->
          <div class="relative group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de Tarjeta
            </label>
            <div class="relative">
              <FontAwesomeIcon
                :icon="['fas', 'credit-card']"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size="sm"
              />
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                disabled
                class="w-full py-2.5 pl-10 pr-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <!-- Fecha de Expiración y CVV -->
          <div class="grid grid-cols-2 gap-4">
            <div class="relative group">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Expiración
              </label>
              <div class="relative">
                <FontAwesomeIcon
                  :icon="['fas', 'calendar-alt']"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size="sm"
                />
                <input
                  type="text"
                  placeholder="MM/AA"
                  disabled
                  class="w-full py-2.5 pl-10 pr-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div class="relative group">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CVV
              </label>
              <div class="relative">
                <FontAwesomeIcon
                  :icon="['fas', 'lock']"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size="sm"
                />
                <input
                  type="text"
                  placeholder="123"
                  disabled
                  class="w-full py-2.5 pl-10 pr-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <!-- Nombre en la Tarjeta -->
          <div class="relative group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre en la Tarjeta
            </label>
            <div class="relative">
              <FontAwesomeIcon
                :icon="['fas', 'user']"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size="sm"
              />
              <input
                type="text"
                placeholder="Juan Pérez"
                disabled
                class="w-full py-2.5 pl-10 pr-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <!-- Checkbox para guardar tarjeta -->
          <div class="flex items-center">
            <input
              id="save-card"
              type="checkbox"
              disabled
              class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-not-allowed"
            />
            <label
              for="save-card"
              class="ml-2 text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed"
            >
              Guardar tarjeta para futuros pagos
            </label>
          </div>
        </div>

        <!-- Seguridad -->
        <div
          class="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <FontAwesomeIcon :icon="['fas', 'shield-alt']" class="h-4 w-4" />
          <span>Pago seguro procesado por Stripe</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { SubscriptionPlan, AddressData } from '../../composables/useSubscriptionWizard';

interface Props {
  selectedPlan: SubscriptionPlan | null;
  addressData: AddressData;
  isRenewal?: boolean;
}

defineProps<Props>();
</script>
