<template>
  <div>
    <!-- Trigger Button -->
    <button
      class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      aria-haspopup="dialog"
      aria-expanded="false"
      aria-controls="payment-modal"
      @click="isOpen = true"
    >
      <div class="flex items-center justify-center space-x-2">
        <FontAwesomeIcon :icon="['fas', 'credit-card']" class="h-4 w-4" />
        <span>Procesar Pago</span>
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
          id="payment-modal"
          v-motion="{
            initial: { opacity: 0, y: 20, scale: 0.98 },
            enter: {
              opacity: 1,
              y: Fdash0,
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
          aria-labelledby="payment-modal-title"
          @click.stop
        >
          <!-- Modal Header -->
          <div
            class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <FontAwesomeIcon :icon="['fas', 'receipt']" class="h-5 w-5 text-blue-500" />
              <h2 id="payment-modal-title" class="text-xl font-bold text-gray-800 dark:text-white">
                Procesar Pago
              </h2>
            </div>
            <button
              class="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              aria-label="Cerrar modal"
              @click="isOpen = false"
            >
              <FontAwesomeIcon :icon="['fas', 'xmark']" class="h-5 w-5" />
            </button>
          </div>

          <!-- Modal Content -->
          <div class="overflow-y-auto max-h-[calc(100vh-12rem)]">
            <!-- Order Summary -->
            <div class="p-6">
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
                    :icon="['fas', 'clipboard-list']"
                    class="h-4 w-4 mr-2 text-blue-500"
                  />
                  Resumen de Compra
                </h3>
                <div
                  class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <!-- Items List -->
                  <div class="max-h-48 overflow-y-auto mb-4">
                    <table class="w-full text-sm">
                      <thead
                        class="text-xs text-gray-500 dark:text-gray-400 uppercase border-b dark:border-gray-700"
                      >
                        <tr>
                          <th class="px-3 py-2 text-left font-medium">Producto</th>
                          <th class="px-3 py-2 text-center font-medium">Cant.</th>
                          <th class="px-3 py-2 text-right font-medium">Precio</th>
                          <th class="px-3 py-2 text-right font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr v-for="(item, index) in cartItems" :key="index">
                          <td class="px-3 py-3 text-left text-gray-800 dark:text-gray-200">
                            {{ item.name }}
                          </td>
                          <td class="px-3 py-3 text-center text-gray-600 dark:text-gray-400">
                            {{ item.quantity }}
                          </td>
                          <td class="px-3 py-3 text-right text-gray-600 dark:text-gray-400">
                            ${{ item.price.toFixed(2) }}
                          </td>
                          <td
                            class="px-3 py-3 text-right font-medium text-gray-900 dark:text-white"
                          >
                            ${{ (item.quantity * item.price).toFixed(2) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Totals -->
                  <div class="space-y-2 pt-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span class="font-medium">${{ subtotal.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400"
                        >Impuestos ({{ taxRate }}%):</span
                      >
                      <span class="font-medium">${{ taxAmount.toFixed(2) }}</span>
                    </div>
                    <div
                      class="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-gray-700"
                    >
                      <span class="text-gray-800 dark:text-white">Total:</span>
                      <span class="text-blue-600 dark:text-blue-400"
                        >${{ totalAmount.toFixed(2) }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Methods -->
              <div
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 100 } },
                }"
                class="mb-6"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon
                    :icon="['fas', 'credit-card']"
                    class="h-4 w-4 mr-2 text-blue-500"
                  />
                  Método de Pago
                </h3>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="method in paymentMethods"
                    :key="method.id"
                    :class="[
                      'p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center',
                      selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-inner'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                    ]"
                    :aria-pressed="selectedPaymentMethod === method.id"
                    @click="selectedPaymentMethod = method.id"
                  >
                    <FontAwesomeIcon
                      :icon="method.icon"
                      class="h-6 w-6 mb-2"
                      :class="
                        selectedPaymentMethod === method.id
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400'
                      "
                    />
                    <span class="font-medium text-sm">{{ method.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Payment Details -->
              <div
                v-if="selectedPaymentMethod"
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 150 } },
                }"
                class="mb-6"
              >
                <!-- Cash Payment -->
                <div v-if="selectedPaymentMethod === 'cash'" class="space-y-4">
                  <div>
                    <label
                      for="cash-amount"
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Cantidad Recibida
                    </label>
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span class="text-gray-500 dark:text-gray-400">$</span>
                      </div>
                      <input
                        id="cash-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        class="pl-8 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div
                    v-if="cashAmount > 0"
                    class="p-4 rounded-lg"
                    :class="{
                      'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200':
                        cashAmount >= totalAmount,
                      'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200':
                        cashAmount < totalAmount,
                    }"
                  >
                    <div class="flex items-center">
                      <FontAwesomeIcon
                        :icon="
                          cashAmount >= totalAmount
                            ? ['fas', 'circle-check']
                            : ['fas', 'triangle-exclamation']
                        "
                        class="h-5 w-5 mr-2"
                      />
                      <span v-if="cashAmount >= totalAmount">
                        Cambio:
                        <span class="font-bold">${{ (cashAmount - totalAmount).toFixed(2) }}</span>
                      </span>
                      <span v-else>
                        Faltante:
                        <span class="font-bold">${{ (totalAmount - cashAmount).toFixed(2) }}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    class="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 transition-colors font-medium"
                    @click="cashAmount = totalAmount"
                  >
                    Usar monto exacto
                  </button>
                </div>

                <!-- Card Payment -->
                <div v-if="selectedPaymentMethod === 'card'" class="space-y-4">
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Seleccione el dispositivo de pago y procese la transacción.
                  </p>

                  <button
                    class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                    @click="showTerminalOptions = !showTerminalOptions"
                  >
                    <FontAwesomeIcon :icon="['fas', 'terminal']" class="h-4 w-4 mr-2" />
                    Seleccionar Terminal
                  </button>

                  <div
                    v-if="showTerminalOptions"
                    class="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div class="space-y-2">
                      <div
                        v-for="terminal in terminals"
                        :key="terminal.id"
                        class="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                      >
                        <input
                          type="radio"
                          :checked="selectedTerminal === terminal.id"
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <label
                          class="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          {{ terminal.name }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Transfer Payment -->
                <div v-if="selectedPaymentMethod === 'transfer'" class="space-y-4">
                  <div
                    class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                      <FontAwesomeIcon :icon="['fas', 'building-columns']" class="h-4 w-4 mr-2" />
                      Datos Bancarios
                    </h4>
                    <div class="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                      <p><span class="font-medium">Banco:</span> Banco Nacional</p>
                      <p><span class="font-medium">Cuenta:</span> 0123 4567 8910 2345</p>
                      <p><span class="font-medium">CLABE:</span> 0123 4567 8910 2345 67</p>
                      <p><span class="font-medium">Referencia:</span> INV-{{ randomReference }}</p>
                    </div>
                  </div>

                  <div>
                    <label
                      for="transfer-code"
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Código de Confirmación
                    </label>
                    <input
                      id="transfer-code"
                      type="text"
                      class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingrese el código de confirmación"
                    />
                  </div>
                </div>

                <!-- Credit Payment -->
                <div v-if="selectedPaymentMethod === 'credit'" class="space-y-4">
                  <div>
                    <label
                      for="customer-search"
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Buscar Cliente
                    </label>
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <FontAwesomeIcon :icon="['fas', 'user']" class="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="customer-search"
                        type="text"
                        class="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nombre o ID del cliente"
                      />
                    </div>
                  </div>

                  <div
                    v-if="customerSearch.length > 2"
                    class="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto"
                  >
                    <div class="space-y-2">
                      <div
                        v-for="customer in filteredCustomers"
                        :key="customer.id"
                        class="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer border border-gray-200 dark:border-gray-700"
                      >
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="font-medium text-gray-800 dark:text-gray-200">
                              {{ customer.name }}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                              ID: {{ customer.id }}
                            </p>
                          </div>
                          <span
                            :class="[
                              'px-2.5 py-1 text-xs rounded-full font-medium',
                              customer.creditLimit >= totalAmount
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
                            ]"
                          >
                            ${{ customer.creditLimit.toFixed(2) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="selectedCustomer"
                    class="p-4 rounded-lg border"
                    :class="{
                      'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20':
                        selectedCustomer.creditLimit >= totalAmount,
                      'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20':
                        selectedCustomer.creditLimit < totalAmount,
                    }"
                  >
                    <div class="flex items-start">
                      <FontAwesomeIcon
                        :icon="
                          selectedCustomer.creditLimit >= totalAmount
                            ? ['fas', 'circle-check']
                            : ['fas', 'circle-exclamation']
                        "
                        class="h-5 w-5 mt-0.5 mr-2"
                        :class="{
                          'text-green-500 dark:text-green-400':
                            selectedCustomer.creditLimit >= totalAmount,
                          'text-red-500 dark:text-red-400':
                            selectedCustomer.creditLimit < totalAmount,
                        }"
                      />
                      <div>
                        <p class="font-medium">
                          {{ selectedCustomer.name }}
                        </p>
                        <p>
                          Límite de crédito:
                          <span
                            :class="{
                              'font-bold text-green-700 dark:text-green-300':
                                selectedCustomer.creditLimit >= totalAmount,
                              'font-bold text-red-700 dark:text-red-300':
                                selectedCustomer.creditLimit < totalAmount,
                            }"
                          >
                            ${{ selectedCustomer.creditLimit.toFixed(2) }}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Additional Options -->
              <div
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 200 } },
                }"
                class="mb-6"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon :icon="['fas', 'gear']" class="h-4 w-4 mr-2 text-blue-500" />
                  Opciones Adicionales
                </h3>
                <div class="space-y-3">
                  <div class="flex items-center">
                    <input
                      id="print-receipt"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                    />
                    <label
                      for="print-receipt"
                      class="ml-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      Imprimir recibo
                    </label>
                  </div>

                  <div class="flex items-center">
                    <input
                      id="email-receipt"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                    />
                    <label
                      for="email-receipt"
                      class="ml-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      Enviar recibo por email
                    </label>
                  </div>

                  <div v-if="emailReceipt" class="pl-7 pt-1">
                    <label
                      for="email-address"
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Correo electrónico
                    </label>
                    <input
                      id="email-address"
                      type="email"
                      class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="cliente@ejemplo.com"
                    />
                  </div>

                  <div class="flex items-center">
                    <input
                      id="generate-invoice"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                    />
                    <label
                      for="generate-invoice"
                      class="ml-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      Generar factura
                    </label>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 250 } },
                }"
                class="mb-2"
              >
                <label
                  for="notes"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <FontAwesomeIcon
                    :icon="['fas', 'pen-to-square']"
                    class="h-4 w-4 mr-1 text-blue-500"
                  />
                  Notas (opcional)
                </label>
                <textarea
                  id="notes"
                  rows="3"
                  class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Información adicional sobre el pago..."
                ></textarea>
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
              :disabled="!isPaymentValid"
              :class="[
                'px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center',
                isPaymentValid
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed',
              ]"
            >
              <FontAwesomeIcon
                v-if="isProcessing"
                :icon="['fas', 'spinner']"
                class="h-4 w-4 mr-2 animate-spin"
              />
              <span>Confirmar Pago</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Mock data for UI demonstration only
const isOpen = ref(false);
const selectedPaymentMethod = ref(null);
const cashAmount = ref(0);
const showTerminalOptions = ref(false);
const selectedTerminal = ref(null);
const transferCode = ref('');
const customerSearch = ref('');
const selectedCustomer = ref(null);
const printReceipt = ref(true);
const emailReceipt = ref(false);
const emailAddress = ref('');
const generateInvoice = ref(false);
const notes = ref('');
const isProcessing = ref(false);
const isPaymentValid = computed(() => true); // Simplified for UI

const cartItems = [
  { name: 'Producto 1', quantity: 2, price: 19.99 },
  { name: 'Producto 2', quantity: 1, price: 29.99 },
  { name: 'Producto 3', quantity: 3, price: 9.99 },
];

const subtotal = computed(() =>
  cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
const taxRate = 16;
const taxAmount = computed(() => subtotal.value * (taxRate / 100));
const totalAmount = computed(() => subtotal.value + taxAmount.value);
const cashChange = computed(() => cashAmount.value - totalAmount.value);

const paymentMethods = [
  { id: 'cash', name: 'Efectivo', icon: ['fas', 'money-bill-wave'] },
  { id: 'card', name: 'Tarjeta', icon: ['fas', 'credit-card'] },
  { id: 'transfer', name: 'Transferencia', icon: ['fas', 'building-columns'] },
  { id: 'credit', name: 'Crédito', icon: ['fas', 'hand-holding-dollar'] },
];

const terminals = [
  { id: 'terminal-1', name: 'Terminal Principal' },
  { id: 'terminal-2', name: 'Terminal Móvil' },
  { id: 'terminal-3', name: 'Terminal de Reserva' },
];

const filteredCustomers = [
  { id: 'C001', name: 'Cliente Ejemplo 1', creditLimit: 500 },
  { id: 'C002', name: 'Cliente Ejemplo 2', creditLimit: 1000 },
  { id: 'C003', name: 'Cliente Ejemplo 3', creditLimit: 200 },
];

const randomReference = computed(() => Math.floor(100000 + Math.random() * 900000));
</script>
