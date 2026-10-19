<script lang="ts" src="./CashRegister.ts" />

<template>
  <div
    class="rounded-xl shadow-lg p-6 transition-all duration-300"
    :class="{ 'bg-white text-gray-900': !isDark, 'bg-gray-800 text-gray-100': isDark }"
  >
    <!-- Header con título y búsqueda -->
    <header class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold">Registro de Caja</h2>
        <span
          class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300"
        >
          {{ filteredTransactions.length }} registros
        </span>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar transacción..."
            class="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 transition-all focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
            :class="[
              isDark
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black',
            ]"
          />
          <span class="absolute left-3 top-2.5 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>

        <select
          v-model="typeFilter"
          class="p-2 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
          :class="[
            isDark
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-300 bg-white text-black',
          ]"
        >
          <option value="all">Todos los tipos</option>
          <option value="income">Entradas</option>
          <option value="expense">Salidas</option>
        </select>
      </div>
    </header>

    <!-- Resumen de transacciones -->
    <div
      v-motion="{
        initial: { opacity: 0, y: 20 },
        enter: { opacity: 1, y: 0, transition: { delay: 200 } },
      }"
      class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      <div
        class="p-4 rounded-lg border transition-all"
        :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Total Entradas</p>
        <p class="text-2xl font-bold mt-1">${{ totalIncome.toFixed(2) }}</p>
      </div>

      <div
        class="p-4 rounded-lg border transition-all"
        :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Total Salidas</p>
        <p class="text-2xl font-bold mt-1">${{ totalExpense.toFixed(2) }}</p>
      </div>

      <div
        class="p-4 rounded-lg border transition-all"
        :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Balance Actual</p>
        <p class="text-2xl font-bold mt-1">${{ (totalIncome - totalExpense).toFixed(2) }}</p>
      </div>
    </div>

    <!-- Formulario para agregar transacciones -->
    <div
      v-motion="{
        initial: { opacity: 0, y: 20 },
        enter: { opacity: 1, y: 0, transition: { delay: 200 } },
      }"
      class="mb-6"
    >
      <div
        class="p-4 rounded-lg border transition-all"
        :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
      >
        <h3 class="text-lg font-semibold mb-4">Agregar Transacción</h3>
        <form class="space-y-4" @submit.prevent="addTransaction">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="type" class="block text-sm font-medium mb-1">Tipo</label>
              <select
                id="type"
                v-model="newTransaction.type"
                class="w-full p-2 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                :class="[
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-black',
                ]"
              >
                <option value="income">Entrada</option>
                <option value="expense">Salida</option>
              </select>
            </div>
            <div>
              <label for="amount" class="block text-sm font-medium mb-1">Monto</label>
              <input
                id="amount"
                v-model.number="newTransaction.amount"
                type="number"
                placeholder="Monto"
                class="w-full p-2 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                :class="[
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-black',
                ]"
                required
              />
            </div>
          </div>
          <div>
            <label for="description" class="block text-sm font-medium mb-1">Descripción</label>
            <input
              id="description"
              v-model="newTransaction.description"
              type="text"
              placeholder="Descripción"
              class="w-full p-2 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
              :class="[
                isDark
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white text-black',
              ]"
              required
            />
          </div>
          <div class="flex justify-end">
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Agregar Transacción
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Lista de transacciones -->
    <div
      v-motion="{ initial: { opacity: 0 }, enter: { opacity: 1, transition: { stagger: 0.1 } } }"
      :class="{ 'opacity-50': isLoading }"
    >
      <div v-if="isLoading" class="flex justify-center my-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <div v-else-if="filteredTransactions.length === 0" class="text-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 mx-auto text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="mt-4 text-gray-500">No se encontraron transacciones</p>
        <button class="mt-4 px-4 py-2 text-sm text-blue-600 underline" @click="resetFilters">
          Restablecer filtros
        </button>
      </div>

      <div v-else>
        <div
          v-for="(transaction, index) in paginatedTransactions"
          :key="transaction.id"
          v-motion="{
            initial: { opacity: 0, y: 20 },
            enter: { opacity: 1, y: 0, transition: { delay: index * 50 } },
          }"
          class="border rounded-lg p-4 mb-4 cursor-pointer transition-all duration-300 hover:shadow-md"
          :class="[
            isDark
              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
              : 'border-gray-300 bg-white hover:bg-gray-100',
            { 'border-l-4 border-l-green-500': isRecentTransaction(transaction.date) },
          ]"
          @click="toggleDetails(transaction.id)"
        >
          <div class="flex flex-wrap md:flex-nowrap justify-between items-center gap-2">
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="getTransactionTypeClass(transaction.type)"
              >
                {{ transaction.type === 'income' ? 'Entrada' : 'Salida' }}
              </span>
              <p class="font-medium">ID: {{ transaction.id }}</p>
            </div>

            <div class="flex gap-4 items-center">
              <p
                class="font-bold text-lg"
                :class="transaction.type === 'income' ? 'text-green-500' : 'text-red-500'"
              >
                ${{ transaction.amount.toFixed(2) }}
              </p>

              <div class="flex gap-2">
                <button
                  class="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-600"
                  title="Editar transacción"
                  @click.stop="editTransaction(transaction.id)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>

                <button
                  class="text-red-500 hover:text-red-700 transition-colors duration-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-600"
                  title="Eliminar transacción"
                  @click.stop="deleteTransaction(transaction.id)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-if="transaction.showDetails" class="mt-4 transition-all duration-300">
            <div
              class="p-4 rounded-lg bg-opacity-50"
              :class="isDark ? 'bg-gray-600' : 'bg-gray-100'"
            >
              <p class="text-sm mb-3 flex justify-between">
                <span
                  >Descripción: <strong>{{ transaction.description }}</strong></span
                >
                <span
                  >Fecha: <strong>{{ formatDate(transaction.date) }}</strong></span
                >
              </p>

              <div class="mt-4 flex justify-end gap-2">
                <button
                  class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                  @click.stop="printReceipt(transaction.id)"
                >
                  Imprimir
                </button>
                <button
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  @click.stop="duplicateTransaction(transaction)"
                >
                  Duplicar transacción
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div
        v-if="filteredTransactions.length > itemsPerPage"
        class="flex justify-between items-center mt-6"
      >
        <button
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded transition-colors"
          :class="
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
          "
          @click="prevPage"
        >
          Anterior
        </button>

        <div class="flex items-center">
          <span class="mx-2 text-sm text-gray-500">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
        </div>

        <button
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded transition-colors"
          :class="
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
          "
          @click="nextPage"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>
