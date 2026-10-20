<script setup>
import { ref, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Estados del modal
const isOpen = ref(false);
const isVerifying = ref(false);
const isProcessing = ref(false);

// Referencias a los datos seleccionados
const selectedProvider = ref(null);
const selectedServiceCategory = ref(null);
const accountNumber = ref('');
const accountDetails = ref(null);
const selectedBill = ref(null);
const selectedPaymentMethod = ref(null);

// Datos de ejemplo (en una aplicación real, estos vendrían de una API)
const serviceProviders = [
  { id: 'cfe', name: 'CFE', logo: '/assets/logos/cfe.png' },
  { id: 'telmex', name: 'Telmex', logo: '/assets/logos/telmex.png' },
  { id: 'sky', name: 'Sky', logo: '/assets/logos/sky.png' },
  { id: 'izzi', name: 'Izzi', logo: '/assets/logos/izzi.png' },
  { id: 'totalplay', name: 'Totalplay', logo: '/assets/logos/totalplay.png' },
  { id: 'dish', name: 'Dish', logo: '/assets/logos/dish.png' },
  { id: 'gas', name: 'Gas Natural', logo: '/assets/logos/gas.png' },
  { id: 'agua', name: 'Agua', logo: '/assets/logos/agua.png' },
];

// Función para obtener categorías de servicio según el proveedor seleccionado
const serviceCategories = computed(() => {
  if (!selectedProvider.value) return [];

  const categories = {
    cfe: [
      { id: 'hogar', name: 'Hogar', icon: ['fas', 'home'] },
      { id: 'negocio', name: 'Negocio', icon: ['fas', 'store'] },
    ],
    telmex: [
      { id: 'telefonia', name: 'Telefonía', icon: ['fas', 'phone'] },
      { id: 'internet', name: 'Internet', icon: ['fas', 'wifi'] },
      { id: 'combo', name: 'Combo', icon: ['fas', 'box'] },
    ],
    sky: [
      { id: 'tv', name: 'Televisión', icon: ['fas', 'tv'] },
      { id: 'internet', name: 'Internet', icon: ['fas', 'wifi'] },
      { id: 'combo', name: 'Combo', icon: ['fas', 'box'] },
    ],
    izzi: [
      { id: 'tv', name: 'Televisión', icon: ['fas', 'tv'] },
      { id: 'internet', name: 'Internet', icon: ['fas', 'wifi'] },
      { id: 'telefonia', name: 'Telefonía', icon: ['fas', 'phone'] },
      { id: 'combo', name: 'Combo', icon: ['fas', 'box'] },
    ],
    totalplay: [
      { id: 'tv', name: 'Televisión', icon: ['fas', 'tv'] },
      { id: 'internet', name: 'Internet', icon: ['fas', 'wifi'] },
      { id: 'telefonia', name: 'Telefonía', icon: ['fas', 'phone'] },
      { id: 'combo', name: 'Combo', icon: ['fas', 'box'] },
    ],
    dish: [
      { id: 'tv', name: 'Televisión', icon: ['fas', 'tv'] },
      { id: 'combo', name: 'Combo', icon: ['fas', 'box'] },
    ],
    gas: [
      { id: 'residencial', name: 'Residencial', icon: ['fas', 'home'] },
      { id: 'comercial', name: 'Comercial', icon: ['fas', 'store'] },
    ],
    agua: [
      { id: 'residencial', name: 'Residencial', icon: ['fas', 'home'] },
      { id: 'comercial', name: 'Comercial', icon: ['fas', 'store'] },
    ],
  };

  return categories[selectedProvider.value.id] || [];
});

// Cuentas recientes (simuladas)
const recentAccounts = ref([
  { number: '123456789012', provider: 'cfe', category: 'hogar' },
  { number: '987654321098', provider: 'telmex', category: 'internet' },
  { number: '456789123456', provider: 'sky', category: 'tv' },
]);

// Métodos de pago disponibles
const paymentMethods = [
  { id: 'balance', name: 'Saldo', icon: ['fas', 'wallet'] },
  { id: 'card', name: 'Tarjeta', icon: ['fas', 'credit-card'] },
  { id: 'transfer', name: 'Transferencia', icon: ['fas', 'money-bill-transfer'] },
];

// Calcular comisión de servicio (simulado)
const serviceFee = computed(() => {
  if (!selectedBill.value || !selectedProvider.value) return 0;

  // Simular diferentes comisiones según el proveedor
  const feeRates = {
    cfe: 12.5,
    telmex: 10,
    sky: 15,
    izzi: 14,
    totalplay: 13,
    dish: 15,
    gas: 10,
    agua: 8,
  };

  return feeRates[selectedProvider.value.id] || 10;
});

// Calculamos el total a pagar
const totalAmount = computed(() => {
  if (!selectedBill.value) return 0;
  return selectedBill.value.amount + serviceFee.value;
});

// Determinar si se puede agregar al carrito
const canAddToCart = computed(() => {
  return (
    selectedProvider.value &&
    selectedServiceCategory.value &&
    accountNumber.value.length > 0 &&
    accountDetails.value &&
    selectedBill.value &&
    selectedPaymentMethod.value
  );
});

// Etiqueta para el número de cuenta según el proveedor
const accountNumberLabel = computed(() => {
  if (!selectedProvider.value) return 'Número de Cuenta';

  const labels = {
    cfe: 'Número de Servicio',
    telmex: 'Número de Teléfono',
    sky: 'Número de Cuenta',
    izzi: 'Número de Cliente',
    totalplay: 'Número de Cliente',
    dish: 'Número de Cuenta',
    gas: 'Número de Servicio',
    agua: 'Número de Cuenta',
  };

  return labels[selectedProvider.value.id] || 'Número de Cuenta';
});

// Placeholder para el campo de entrada según el proveedor
const accountNumberPlaceholder = computed(() => {
  if (!selectedProvider.value) return 'Ingrese su número de cuenta';

  const placeholders = {
    cfe: 'Ej. 123456789012',
    telmex: 'Ej. 5512345678',
    sky: 'Ej. SKY123456',
    izzi: 'Ej. IZZI987654',
    totalplay: 'Ej. TP123456789',
    dish: 'Ej. DISH654321',
    gas: 'Ej. GN12345678',
    agua: 'Ej. AG98765432',
  };

  return placeholders[selectedProvider.value.id] || 'Ingrese su número de cuenta';
});

// Función para seleccionar proveedor de servicio
function selectProvider(provider) {
  selectedProvider.value = provider;
  selectedServiceCategory.value = null;
  accountNumber.value = '';
  accountDetails.value = null;
  selectedBill.value = null;
}

// Función para seleccionar categoría de servicio
function selectServiceCategory(category) {
  selectedServiceCategory.value = category;
  accountDetails.value = null;
  selectedBill.value = null;
}

// Función para seleccionar cuenta reciente
function selectRecentAccount(account) {
  // Buscar y seleccionar el proveedor correspondiente
  const provider = serviceProviders.find((p) => p.id === account.provider);
  if (provider) {
    selectedProvider.value = provider;

    // Buscar y seleccionar la categoría correspondiente
    const category = serviceCategories.value.find((c) => c.id === account.category);
    if (category) {
      selectedServiceCategory.value = category;
    }

    // Establecer el número de cuenta
    accountNumber.value = account.number;

    // Verificar la cuenta automáticamente
    verifyAccount();
  }
}

// Simular verificación de cuenta
function verifyAccount() {
  if (
    !selectedProvider.value ||
    !selectedServiceCategory.value ||
    accountNumber.value.length === 0
  ) {
    return;
  }

  isVerifying.value = true;

  // Simulamos la llamada a la API con un retardo
  setTimeout(() => {
    // Simulamos datos de respuesta
    accountDetails.value = {
      name: 'Juan Pérez Rodríguez',
      address: 'Calle Principal 123, Col. Centro, Ciudad de México',
      bills: [
        {
          id: 'bill1',
          description: 'Factura Marzo 2025',
          amount: 568.75,
          dueDate: '30/04/2025',
        },
        {
          id: 'bill2',
          description: 'Factura Febrero 2025',
          amount: 493.2,
          dueDate: '15/03/2025',
          status: 'vencido',
        },
      ],
    };

    isVerifying.value = false;
  }, 1500);
}

// Seleccionar una factura
function selectBill(bill) {
  selectedBill.value = bill;
}

// Seleccionar un método de pago
function selectPaymentMethod(method) {
  selectedPaymentMethod.value = method;
}

// Función para agregar al carrito
function addToCart() {
  if (!canAddToCart.value) return;

  isProcessing.value = true;

  // Simulamos el proceso de agregar al carrito
  setTimeout(() => {
    // Reiniciar el formulario o cerrar el modal
    isProcessing.value = false;
    isOpen.value = false;

    // Opcionalmente: mostrar notificación de éxito
    // showNotification('Servicio agregado al carrito correctamente');
  }, 1200);
}

// Proporcionar valores para la plantilla
defineExpose({
  isOpen,
  openModal: () => {
    isOpen.value = true;
  },
});
</script>

<template>
  <div>
    <!-- Trigger Button -->
    <button
      class="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
      aria-haspopup="dialog"
      aria-expanded="false"
      aria-controls="service-payment-modal"
      @click="isOpen = true"
    >
      <div class="flex items-center justify-center space-x-2">
        <FontAwesomeIcon :icon="['fas', 'file-invoice']" class="h-4 w-4" />
        <span>Pagar Servicio</span>
      </div>
    </button>

    <!-- Modal Overlay -->
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Overlay Background -->
      <div
        v-motion="{
          initial: { opacity: 0 },
          enter: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
          leave: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
        }"
        class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        @click="isOpen = false"
      ></div>

      <!-- Modal Container -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div
          id="service-payment-modal"
          v-motion="{
            initial: { opacity: 0, y: 20, scale: 0.98 },
            enter: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
            },
            leave: {
              opacity: 0,
              y: 20,
              scale: 0.98,
              transition: { duration: 0.2, ease: [0.36, 0.66, 0.04, 1] },
            },
          }"
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-payment-modal-title"
          @click.stop
        >
          <!-- Modal Header -->
          <div
            class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <FontAwesomeIcon icon="file-invoice" class="h-5 w-5 text-purple-500" />
              <h2
                id="service-payment-modal-title"
                class="text-xl font-bold text-gray-800 dark:text-white"
              >
                Pago de Servicios
              </h2>
            </div>
            <button
              class="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              aria-label="Cerrar modal"
              @click="isOpen = false"
            >
              <FontAwesomeIcon :icon="xmark" class="h-5 w-5" />
            </button>
          </div>

          <!-- Modal Content -->
          <div class="overflow-y-auto max-h-[calc(100vh-12rem)]">
            <div class="p-6">
              <!-- Service Provider Selection -->
              <div
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 50 } },
                }"
                class="mb-6"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon
                    :icon="['fas', 'building']"
                    class="h-4 w-4 mr-2 text-purple-500"
                  />
                  Proveedor de Servicio
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    v-for="provider in serviceProviders"
                    :key="provider.id"
                    :class="[
                      'p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center',
                      selectedProvider?.id === provider.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-inner'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                    ]"
                    :aria-pressed="selectedProvider?.id === provider.id"
                    @click="selectProvider(provider)"
                  >
                    <div class="h-12 w-12 mb-2 flex items-center justify-center">
                      <img
                        :src="provider.logo"
                        :alt="provider.name"
                        class="max-h-full max-w-full"
                      />
                    </div>
                    <span class="font-medium text-xs sm:text-sm text-center">{{
                      provider.name
                    }}</span>
                  </button>
                </div>
              </div>

              <!-- Service Category Selection -->
              <div
                v-if="selectedProvider && serviceCategories.length > 0"
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 100 } },
                }"
                class="mb-6"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon :icon="['fas', 'list']" class="h-4 w-4 mr-2 text-purple-500" />
                  Tipo de Servicio
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    v-for="category in serviceCategories"
                    :key="category.id"
                    :class="[
                      'p-3 rounded-lg border-2 transition-all duration-200 flex items-center',
                      selectedServiceCategory?.id === category.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-inner'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                    ]"
                    @click="selectServiceCategory(category)"
                  >
                    <FontAwesomeIcon :icon="category.icon" class="h-4 w-4 mr-2 text-purple-500" />
                    <span class="font-medium text-sm">{{ category.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Account Number Input -->
              <div
                v-if="selectedProvider && selectedServiceCategory"
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 150 } },
                }"
                class="mb-6"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon
                    :icon="['fas', 'hashtag']"
                    class="h-4 w-4 mr-2 text-purple-500"
                  />
                  {{ accountNumberLabel }}
                </h3>
                <div class="relative">
                  <input
                    v-model="accountNumber"
                    type="text"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    :placeholder="accountNumberPlaceholder"
                    maxlength="30"
                  />
                </div>

                <!-- Recent Account Numbers -->
                <div v-if="recentAccounts.length > 0" class="mt-3">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Cuentas recientes:</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="(account, index) in recentAccounts"
                      :key="index"
                      class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full transition-colors flex items-center"
                      @click="selectRecentAccount(account)"
                    >
                      <FontAwesomeIcon
                        :icon="['fas', 'clock-rotate-left']"
                        class="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400"
                      />
                      {{ account.number }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Verification Button -->
              <div
                v-if="selectedProvider && selectedServiceCategory && accountNumber.length > 0"
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 200 } },
                }"
                class="mb-6"
              >
                <button
                  :class="[
                    'w-full px-5 py-3 rounded-lg font-medium transition-colors flex items-center justify-center',
                    !isVerifying
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed',
                  ]"
                  :disabled="isVerifying"
                  @click="verifyAccount"
                >
                  <FontAwesomeIcon
                    v-if="isVerifying"
                    :icon="['fas', 'spinner']"
                    class="h-4 w-4 mr-2 animate-spin"
                  />
                  <FontAwesomeIcon v-else :icon="['fas', 'search']" class="h-4 w-4 mr-2" />
                  <span>{{ isVerifying ? 'Verificando...' : 'Verificar Cuenta' }}</span>
                </button>
              </div>

              <!-- Account Details -->
              <div
                v-if="accountDetails"
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 250 } },
                }"
                class="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon :icon="['fas', 'user']" class="h-4 w-4 mr-2 text-purple-500" />
                  Información de la Cuenta
                </h3>

                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Nombre:</span>
                    <span class="font-medium">{{ accountDetails.name }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">{{ accountNumberLabel }}:</span>
                    <span class="font-medium">{{ accountNumber }}</span>
                  </div>

                  <div v-if="accountDetails.address" class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Dirección:</span>
                    <span class="font-medium text-right">{{ accountDetails.address }}</span>
                  </div>

                  <div class="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                    <div
                      v-for="(bill, index) in accountDetails.bills"
                      :key="index"
                      :class="[
                        'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 mb-2',
                        selectedBill?.id === bill.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-inner'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                      ]"
                      @click="selectBill(bill)"
                    >
                      <div class="flex justify-between items-start">
                        <div>
                          <div class="font-medium text-gray-800 dark:text-white">
                            {{ bill.description }}
                          </div>
                          <div class="text-sm text-gray-600 dark:text-gray-400">
                            Vencimiento: {{ bill.dueDate }}
                          </div>
                        </div>
                        <div class="font-bold text-lg text-purple-600 dark:text-purple-400">
                          ${{ bill.amount.toFixed(2) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Methods -->
              <div
                v-if="selectedBill"
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 300 } },
                }"
                class="mb-6"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon
                    :icon="['fas', 'credit-card']"
                    class="h-4 w-4 mr-2 text-purple-500"
                  />
                  Método de Pago
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    v-for="method in paymentMethods"
                    :key="method.id"
                    :class="[
                      'p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center',
                      selectedPaymentMethod?.id === method.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-inner'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                    ]"
                    @click="selectPaymentMethod(method)"
                  >
                    <FontAwesomeIcon
                      :icon="method.icon"
                      class="h-6 w-6 mb-2 text-gray-700 dark:text-gray-300"
                    />
                    <span class="font-medium text-sm text-center">{{ method.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Summary -->
              <div
                v-if="selectedProvider && selectedBill && selectedPaymentMethod"
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 350 } },
                }"
                class="mb-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon
                    :icon="['fas', 'receipt']"
                    class="h-4 w-4 mr-2 text-purple-500"
                  />
                  Resumen de Pago
                </h3>

                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Servicio:</span>
                    <span class="font-medium">{{ selectedProvider.name }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Cliente:</span>
                    <span class="font-medium">{{ accountDetails.name }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">{{ accountNumberLabel }}:</span>
                    <span class="font-medium">{{ accountNumber }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Concepto:</span>
                    <span class="font-medium">{{ selectedBill.description }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Método de Pago:</span>
                    <span class="font-medium">{{ selectedPaymentMethod.name }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Comisión:</span>
                    <span class="font-medium">${{ serviceFee.toFixed(2) }}</span>
                  </div>

                  <div
                    class="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between"
                  >
                    <span class="text-gray-800 dark:text-white font-semibold">Total a Pagar:</span>
                    <span class="text-purple-600 dark:text-purple-400 font-bold"
                      >${{ totalAmount.toFixed(2) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div
            class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-end"
          >
            <button
              class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              @click="isOpen = false"
            >
              Cancelar
            </button>
            <button
              :disabled="!canAddToCart"
              :class="[
                'px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center',
                canAddToCart
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed',
              ]"
              @click="addToCart"
            >
              <FontAwesomeIcon
                v-if="isProcessing"
                :icon="['fas', 'spinner']"
                class="h-4 w-4 mr-2 animate-spin"
              />
              <span>{{ canAddToCart ? 'Agregar al Carrito' : 'Completa los datos' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
