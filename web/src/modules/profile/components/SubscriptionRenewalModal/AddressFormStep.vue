<template>
  <div
    v-motion="{
      initial: { opacity: 0, y: 10 },
      enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    }"
  >
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
      <FontAwesomeIcon :icon="['fas', 'map-marker-alt']" class="h-5 w-5 mr-2 text-purple-500" />
      Dirección de Facturación
    </h3>

    <form class="space-y-4" @submit.prevent>
      <!-- Calle y Número -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Calle -->
        <div class="relative group">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Calle <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <FontAwesomeIcon
              :icon="['fas', 'road']"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-300 group-focus-within:text-purple-500"
              size="sm"
            />
            <input
              v-model="localAddress.street"
              type="text"
              placeholder="Nombre de la calle"
              class="w-full py-2.5 pl-10 pr-3 border rounded-lg text-sm transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              :class="
                errors.street
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 dark:border-gray-600'
              "
              @blur="validateField('street')"
            />
          </div>
          <p v-if="errors.street" class="mt-1 text-xs text-red-500">
            {{ errors.street }}
          </p>
        </div>

        <!-- Número -->
        <div class="relative group">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <FontAwesomeIcon
              :icon="['fas', 'hashtag']"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-300 group-focus-within:text-purple-500"
              size="sm"
            />
            <input
              v-model="localAddress.number"
              type="text"
              placeholder="Número"
              class="w-full py-2.5 pl-10 pr-3 border rounded-lg text-sm transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              :class="
                errors.number
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 dark:border-gray-600'
              "
              @blur="validateField('number')"
            />
          </div>
          <p v-if="errors.number" class="mt-1 text-xs text-red-500">
            {{ errors.number }}
          </p>
        </div>
      </div>

      <!-- Colonia -->
      <div class="relative group">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Colonia <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <FontAwesomeIcon
            :icon="['fas', 'building']"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-300 group-focus-within:text-purple-500"
            size="sm"
          />
          <input
            v-model="localAddress.neighborhood"
            type="text"
            placeholder="Nombre de la colonia"
            class="w-full py-2.5 pl-10 pr-3 border rounded-lg text-sm transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            :class="
              errors.neighborhood
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 dark:border-gray-600'
            "
            @blur="validateField('neighborhood')"
          />
        </div>
        <p v-if="errors.neighborhood" class="mt-1 text-xs text-red-500">
          {{ errors.neighborhood }}
        </p>
      </div>

      <!-- Ciudad y Estado -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Ciudad -->
        <div class="relative group">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ciudad <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <FontAwesomeIcon
              :icon="['fas', 'city']"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-300 group-focus-within:text-purple-500"
              size="sm"
            />
            <input
              v-model="localAddress.city"
              type="text"
              placeholder="Ciudad"
              class="w-full py-2.5 pl-10 pr-3 border rounded-lg text-sm transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              :class="
                errors.city
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 dark:border-gray-600'
              "
              @blur="validateField('city')"
            />
          </div>
          <p v-if="errors.city" class="mt-1 text-xs text-red-500">
            {{ errors.city }}
          </p>
        </div>

        <!-- Estado -->
        <div class="relative group">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <FontAwesomeIcon
              :icon="['fas', 'map']"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-300 group-focus-within:text-purple-500 pointer-events-none z-10"
              size="sm"
            />
            <input
              v-model="localAddress.state"
              type="text"
              placeholder="Estado"
              class="w-full py-2.5 pl-10 pr-3 border rounded-lg text-sm transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              :class="
                errors.state
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 dark:border-gray-600'
              "
              @blur="validateField('state')"
            />
          </div>
          <p v-if="errors.state" class="mt-1 text-xs text-red-500">
            {{ errors.state }}
          </p>
        </div>
      </div>

      <!-- Código Postal y País -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Código Postal -->
        <div class="relative group">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Código Postal <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <FontAwesomeIcon
              :icon="['fas', 'mail-bulk']"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-300 group-focus-within:text-purple-500"
              size="sm"
            />
            <input
              v-model="localAddress.postalCode"
              type="text"
              placeholder="12345"
              maxlength="5"
              class="w-full py-2.5 pl-10 pr-3 border rounded-lg text-sm transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              :class="
                errors.postalCode
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 dark:border-gray-600'
              "
              @blur="validateField('postalCode')"
              @input="formatPostalCode"
            />
          </div>
          <p v-if="errors.postalCode" class="mt-1 text-xs text-red-500">
            {{ errors.postalCode }}
          </p>
        </div>

        <!-- País -->
        <div class="relative group">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            País <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <FontAwesomeIcon
              :icon="['fas', 'globe']"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-300 group-focus-within:text-purple-500 pointer-events-none z-10"
              size="sm"
            />
            <select
              v-model="localAddress.country"
              class="w-full py-2.5 pl-10 pr-3 border rounded-lg text-sm transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer"
              :class="
                errors.country
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 dark:border-gray-600'
              "
              @blur="validateField('country')"
            >
              <option value="México">México</option>
              <option value="Estados Unidos">Estados Unidos</option>
              <option value="Canadá">Canadá</option>
              <option value="España">España</option>
              <option value="Colombia">Colombia</option>
              <option value="Argentina">Argentina</option>
              <option value="Chile">Chile</option>
            </select>
            <FontAwesomeIcon
              :icon="['fas', 'chevron-down']"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
              size="sm"
            />
          </div>
          <p v-if="errors.country" class="mt-1 text-xs text-red-500">
            {{ errors.country }}
          </p>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { AddressData } from '../../composables/useSubscriptionWizard';

interface Props {
  addressData: AddressData;
}

interface Emits {
  (e: 'update:addressData', value: AddressData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localAddress = ref<AddressData>({ ...props.addressData });

const errors = ref<Partial<Record<keyof AddressData, string>>>({});

// Sincronizar cambios con el padre
watch(
  () => props.addressData,
  (newData) => {
    localAddress.value = { ...newData };
  },
  { deep: true }
);

watch(
  localAddress,
  (newAddress) => {
    emit('update:addressData', { ...newAddress });
  },
  { deep: true }
);

const validateField = (field: keyof AddressData) => {
  const value = localAddress.value[field].trim();

  switch (field) {
    case 'street':
      if (!value) {
        errors.value.street = 'La calle es requerida';
      } else {
        delete errors.value.street;
      }
      break;
    case 'number':
      if (!value) {
        errors.value.number = 'El número es requerido';
      } else {
        delete errors.value.number;
      }
      break;
    case 'neighborhood':
      if (!value) {
        errors.value.neighborhood = 'La colonia es requerida';
      } else {
        delete errors.value.neighborhood;
      }
      break;
    case 'city':
      if (!value) {
        errors.value.city = 'La ciudad es requerida';
      } else {
        delete errors.value.city;
      }
      break;
    case 'state':
      if (!value) {
        errors.value.state = 'El estado es requerido';
      } else {
        delete errors.value.state;
      }
      break;
    case 'postalCode':
      if (!value) {
        errors.value.postalCode = 'El código postal es requerido';
      } else if (!/^\d{5}$/.test(value)) {
        errors.value.postalCode = 'El código postal debe tener 5 dígitos';
      } else {
        delete errors.value.postalCode;
      }
      break;
    case 'country':
      if (!value) {
        errors.value.country = 'El país es requerido';
      } else {
        delete errors.value.country;
      }
      break;
  }
};

const formatPostalCode = (event: Event) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/\D/g, '').slice(0, 5);
  localAddress.value.postalCode = input.value;
};
</script>
