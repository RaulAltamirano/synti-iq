<script lang="ts" src="./CashClosingModal.ts" />

<template>
  <Teleport to="body">
    <!-- Modal Overlay -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Overlay Background -->
      <div
        v-motion="{
          initial: { opacity: 0 },
          enter: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
          leave: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
        }"
        class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        @click="closeModal"
      ></div>

      <!-- Modal Container -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div
          id="cash-closing-modal"
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
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cash-closing-modal-title"
          @click.stop
        >
          <!-- Modal Header -->
          <div
            class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <FontAwesomeIcon :icon="['fas', 'cash-register']" class="h-5 w-5 text-purple-500" />
              <h2
                id="cash-closing-modal-title"
                class="text-xl font-bold text-gray-800 dark:text-white"
              >
                Cierre de Caja - Turno {{ currentShift.id }}
              </h2>
            </div>
            <button
              class="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              aria-label="Cerrar modal"
              @click="closeModal"
            >
              <FontAwesomeIcon :icon="['fas', 'xmark']" class="h-5 w-5" />
            </button>
          </div>

          <!-- Modal Content -->
          <div class="overflow-y-auto max-h-[calc(100vh-12rem)]">
            <div class="p-6">
              <!-- Shift Information -->
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
                  <FontAwesomeIcon :icon="['fas', 'clock']" class="h-4 w-4 mr-2 text-purple-500" />
                  Información del Turno
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div
                    class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Cajero:</span>
                      <span class="font-medium">{{ currentUser.name }}</span>
                    </div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Apertura:</span>
                      <span class="font-medium">{{ formatDateTime(currentShift.openTime) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Cierre:</span>
                      <span class="font-medium">{{
                        formatDateTime(currentShift.closeTime) || 'En progreso'
                      }}</span>
                    </div>
                  </div>
                  <div
                    class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
                      <span
                        :class="[
                          'px-2 py-1 rounded-full text-xs font-medium',
                          currentShift.status === 'open'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
                        ]"
                      >
                        {{ currentShift.status === 'open' ? 'Abierto' : 'Cerrado' }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Duración:</span>
                      <span class="font-medium">{{ calculateShiftDuration() }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Transacciones:</span>
                      <span class="font-medium">{{ currentShift.transactions.length }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Financial Summary -->
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
                    :icon="['fas', 'chart-pie']"
                    class="h-4 w-4 mr-2 text-purple-500"
                  />
                  Resumen Financiero
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <!-- Ventas Totales -->
                  <div
                    class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Ventas Totales:</span>
                      <span class="font-medium text-purple-600 dark:text-purple-400"
                        >${{ formatCurrency(currentShift.totalSales) }}</span
                      >
                    </div>
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div class="h-full bg-purple-500" :style="{ width: '100%' }"></div>
                    </div>
                  </div>

                  <!-- Efectivo -->
                  <div
                    class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Efectivo:</span>
                      <span class="font-medium text-green-600 dark:text-green-400"
                        >${{ formatCurrency(currentShift.cashAmount) }}</span
                      >
                    </div>
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-green-500"
                        :style="{
                          width:
                            calculatePercentage(currentShift.cashAmount, currentShift.totalSales) +
                            '%',
                        }"
                      ></div>
                    </div>
                  </div>

                  <!-- Tarjetas -->
                  <div
                    class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Tarjetas:</span>
                      <span class="font-medium text-blue-600 dark:text-blue-400"
                        >${{ formatCurrency(currentShift.cardAmount) }}</span
                      >
                    </div>
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-blue-500"
                        :style="{
                          width:
                            calculatePercentage(currentShift.cardAmount, currentShift.totalSales) +
                            '%',
                        }"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- Detailed Breakdown -->
                <div
                  class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <h4 class="font-medium text-gray-800 dark:text-white mb-3">Desglose de Pagos</h4>
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead
                        class="text-xs text-gray-500 dark:text-gray-400 uppercase border-b dark:border-gray-700"
                      >
                        <tr>
                          <th class="px-3 py-2 text-left font-medium">Método</th>
                          <th class="px-3 py-2 text-right font-medium">Cantidad</th>
                          <th class="px-3 py-2 text-right font-medium">Transacciones</th>
                          <th class="px-3 py-2 text-right font-medium">Porcentaje</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr v-for="(method, index) in paymentMethodsSummary" :key="index">
                          <td
                            class="px-3 py-3 text-left text-gray-800 dark:text-gray-200 flex items-center"
                          >
                            <FontAwesomeIcon
                              :icon="method.icon"
                              class="h-4 w-4 mr-2"
                              :class="method.color"
                            />
                            {{ method.name }}
                          </td>
                          <td class="px-3 py-3 text-right font-medium">
                            ${{ formatCurrency(method.amount) }}
                          </td>
                          <td class="px-3 py-3 text-right text-gray-600 dark:text-gray-400">
                            {{ method.transactions }}
                          </td>
                          <td class="px-3 py-3 text-right text-gray-600 dark:text-gray-400">
                            {{ calculatePercentage(method.amount, currentShift.totalSales) }}%
                          </td>
                        </tr>
                      </tbody>
                      <tfoot class="border-t dark:border-gray-700 font-medium">
                        <tr>
                          <td class="px-3 py-3 text-left text-gray-800 dark:text-gray-200">
                            Total
                          </td>
                          <td class="px-3 py-3 text-right text-purple-600 dark:text-purple-400">
                            ${{ formatCurrency(currentShift.totalSales) }}
                          </td>
                          <td class="px-3 py-3 text-right">
                            {{ currentShift.transactions.length }}
                          </td>
                          <td class="px-3 py-3 text-right">100%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Cash Count -->
              <div
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
                    :icon="['fas', 'money-bill-wave']"
                    class="h-4 w-4 mr-2 text-purple-500"
                  />
                  Conteo de Efectivo
                </h3>

                <div
                  class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Expected Cash -->
                    <div>
                      <h4 class="font-medium text-gray-800 dark:text-white mb-3">
                        Efectivo Esperado
                      </h4>
                      <div class="space-y-2">
                        <div class="flex justify-between">
                          <span class="text-sm text-gray-600 dark:text-gray-400"
                            >Fondo Inicial:</span
                          >
                          <span class="font-medium"
                            >${{ formatCurrency(currentShift.initialCash) }}</span
                          >
                        </div>
                        <div class="flex justify-between">
                          <span class="text-sm text-gray-600 dark:text-gray-400"
                            >Ventas en Efectivo:</span
                          >
                          <span class="font-medium"
                            >${{ formatCurrency(currentShift.cashAmount) }}</span
                          >
                        </div>
                        <div
                          class="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2"
                        >
                          <span class="text-sm text-gray-800 dark:text-gray-200 font-medium"
                            >Total Esperado:</span
                          >
                          <span class="font-bold text-green-600 dark:text-green-400">
                            ${{
                              formatCurrency(currentShift.initialCash + currentShift.cashAmount)
                            }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Actual Cash -->
                    <div>
                      <h4 class="font-medium text-gray-800 dark:text-white mb-3">
                        Efectivo Contado
                      </h4>
                      <div class="space-y-2">
                        <div
                          v-for="denomination in cashDenominations"
                          :key="denomination.value"
                          class="flex items-center justify-between"
                        >
                          <span class="text-sm text-gray-600 dark:text-gray-400"
                            >${{ denomination.value }}:</span
                          >
                          <div class="flex items-center space-x-2">
                            <button
                              class="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                              :disabled="denomination.count <= 0"
                              @click="decrementDenomination(denomination.value)"
                            >
                              <FontAwesomeIcon :icon="['fas', 'minus']" class="h-3 w-3" />
                            </button>
                            <span class="w-8 text-center">{{ denomination.count }}</span>
                            <button
                              class="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                              @click="incrementDenomination(denomination.value)"
                            >
                              <FontAwesomeIcon :icon="['fas', 'plus']" class="h-3 w-3" />
                            </button>
                            <span class="w-16 text-right font-medium">
                              ${{ formatCurrency(denomination.value * denomination.count) }}
                            </span>
                          </div>
                        </div>
                        <div
                          class="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2"
                        >
                          <span class="text-sm text-gray-800 dark:text-gray-200 font-medium"
                            >Total Contado:</span
                          >
                          <span
                            :class="[
                              'font-bold',
                              totalCountedCash ===
                              currentShift.initialCash + currentShift.cashAmount
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400',
                            ]"
                          >
                            ${{ formatCurrency(totalCountedCash) }}
                          </span>
                        </div>
                        <div
                          v-if="
                            totalCountedCash !== currentShift.initialCash + currentShift.cashAmount
                          "
                          class="text-sm p-2 rounded-md"
                          :class="{
                            'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200':
                              cashDifference > 0,
                            'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200':
                              cashDifference < 0,
                          }"
                        >
                          <FontAwesomeIcon
                            :icon="cashDifference > 0 ? ['fas', 'arrow-up'] : ['fas', 'arrow-down']"
                            class="h-3 w-3 mr-1"
                          />
                          {{ cashDifference > 0 ? 'Sobrante:' : 'Faltante:' }}
                          ${{ formatCurrency(Math.abs(cashDifference)) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Additional Information -->
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
                  <FontAwesomeIcon
                    :icon="['fas', 'info-circle']"
                    class="h-4 w-4 mr-2 text-purple-500"
                  />
                  Información Adicional
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <!-- Expenses -->
                  <div
                    class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <h4
                      class="font-medium text-gray-800 dark:text-white mb-3 flex items-center justify-between"
                    >
                      <span>Gastos del Turno</span>
                      <button
                        class="text-xs p-1.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                        @click="showExpenseForm = !showExpenseForm"
                      >
                        <FontAwesomeIcon :icon="['fas', 'plus']" class="h-3 w-3 mr-1" />
                        Agregar
                      </button>
                    </h4>

                    <div
                      v-if="showExpenseForm"
                      class="mb-3 p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                    >
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div class="col-span-2">
                          <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1"
                            >Descripción</label
                          >
                          <input
                            v-model="newExpense.description"
                            type="text"
                            class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Concepto del gasto"
                          />
                        </div>
                        <div>
                          <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1"
                            >Monto</label
                          >
                          <div class="relative">
                            <div
                              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                            >
                              <span class="text-gray-500 dark:text-gray-400 text-sm">$</span>
                            </div>
                            <input
                              v-model="newExpense.amount"
                              type="number"
                              min="0"
                              step="0.01"
                              class="pl-8 w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                      <div class="flex justify-end mt-2 space-x-2">
                        <button
                          class="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          @click="showExpenseForm = false"
                        >
                          Cancelar
                        </button>
                        <button
                          class="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                          :disabled="!newExpense.description || !newExpense.amount"
                          @click="addExpense"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>

                    <div v-if="currentShift.expenses.length > 0" class="max-h-40 overflow-y-auto">
                      <table class="w-full text-sm">
                        <thead
                          class="text-xs text-gray-500 dark:text-gray-400 uppercase border-b dark:border-gray-700"
                        >
                          <tr>
                            <th class="px-2 py-1 text-left">Descripción</th>
                            <th class="px-2 py-1 text-right">Monto</th>
                            <th class="px-2 py-1 text-right"></th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                          <tr v-for="(expense, index) in currentShift.expenses" :key="index">
                            <td class="px-2 py-2 text-left text-gray-800 dark:text-gray-200">
                              {{ expense.description }}
                            </td>
                            <td class="px-2 py-2 text-right text-red-600 dark:text-red-400">
                              ${{ formatCurrency(expense.amount) }}
                            </td>
                            <td class="px-2 py-2 text-right">
                              <button
                                class="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                @click="removeExpense(index)"
                              >
                                <FontAwesomeIcon :icon="['fas', 'trash']" class="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        </tbody>
                        <tfoot class="border-t dark:border-gray-700">
                          <tr>
                            <td
                              class="px-2 py-2 text-left font-medium text-gray-800 dark:text-gray-200"
                            >
                              Total Gastos
                            </td>
                            <td
                              class="px-2 py-2 text-right font-medium text-red-600 dark:text-red-400"
                            >
                              ${{ formatCurrency(totalExpenses) }}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                      No se registraron gastos en este turno
                    </div>
                  </div>

                  <!-- Withdrawals -->
                  <div
                    class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <h4
                      class="font-medium text-gray-800 dark:text-white mb-3 flex items-center justify-between"
                    >
                      <span>Retiros del Turno</span>
                      <button
                        class="text-xs p-1.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                        @click="showWithdrawalForm = !showWithdrawalForm"
                      >
                        <FontAwesomeIcon :icon="['fas', 'plus']" class="h-3 w-3 mr-1" />
                        Agregar
                      </button>
                    </h4>

                    <div
                      v-if="showWithdrawalForm"
                      class="mb-3 p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                    >
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div class="col-span-2">
                          <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1"
                            >Descripción</label
                          >
                          <input
                            v-model="newWithdrawal.description"
                            type="text"
                            class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Motivo del retiro"
                          />
                        </div>
                        <div>
                          <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1"
                            >Monto</label
                          >
                          <div class="relative">
                            <div
                              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                            >
                              <span class="text-gray-500 dark:text-gray-400 text-sm">$</span>
                            </div>
                            <input
                              v-model="newWithdrawal.amount"
                              type="number"
                              min="0"
                              step="0.01"
                              class="pl-8 w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                      <div class="flex justify-end mt-2 space-x-2">
                        <button
                          class="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          @click="showWithdrawalForm = false"
                        >
                          Cancelar
                        </button>
                        <button
                          class="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                          :disabled="!newWithdrawal.description || !newWithdrawal.amount"
                          @click="addWithdrawal"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>

                    <div
                      v-if="currentShift.withdrawals.length > 0"
                      class="max-h-40 overflow-y-auto"
                    >
                      <table class="w-full text-sm">
                        <thead
                          class="text-xs text-gray-500 dark:text-gray-400 uppercase border-b dark:border-gray-700"
                        >
                          <tr>
                            <th class="px-2 py-1 text-left">Descripción</th>
                            <th class="px-2 py-1 text-right">Monto</th>
                            <th class="px-2 py-1 text-right"></th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                          <tr v-for="(withdrawal, index) in currentShift.withdrawals" :key="index">
                            <td class="px-2 py-2 text-left text-gray-800 dark:text-gray-200">
                              {{ withdrawal.description }}
                            </td>
                            <td class="px-2 py-2 text-right text-orange-600 dark:text-orange-400">
                              ${{ formatCurrency(withdrawal.amount) }}
                            </td>
                            <td class="px-2 py-2 text-right">
                              <button
                                class="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                @click="removeWithdrawal(index)"
                              >
                                <FontAwesomeIcon :icon="['fas', 'trash']" class="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        </tbody>
                        <tfoot class="border-t dark:border-gray-700">
                          <tr>
                            <td
                              class="px-2 py-2 text-left font-medium text-gray-800 dark:text-gray-200"
                            >
                              Total Retiros
                            </td>
                            <td
                              class="px-2 py-2 text-right font-medium text-orange-600 dark:text-orange-400"
                            >
                              ${{ formatCurrency(totalWithdrawals) }}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                      No se registraron retiros en este turno
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div>
                  <label
                    for="closing-notes"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    <FontAwesomeIcon
                      :icon="['fas', 'pen-to-square']"
                      class="h-4 w-4 mr-1 text-purple-500"
                    />
                    Notas del Cierre (opcional)
                  </label>
                  <textarea
                    id="closing-notes"
                    v-model="closingNotes"
                    rows="3"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Observaciones sobre el cierre de caja..."
                  ></textarea>
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
              @click="closeModal"
            >
              Cancelar
            </button>
            <button
              :disabled="isProcessing || currentShift.status === 'closed'"
              :class="[
                'px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center',
                !isProcessing && currentShift.status !== 'closed'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed',
              ]"
              @click="confirmCashClosing"
            >
              <FontAwesomeIcon
                v-if="isProcessing"
                :icon="['fas', 'spinner']"
                class="h-4 w-4 mr-2 animate-spin"
              />
              <span>{{
                currentShift.status === 'closed' ? 'Turno Cerrado' : 'Confirmar Cierre'
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
