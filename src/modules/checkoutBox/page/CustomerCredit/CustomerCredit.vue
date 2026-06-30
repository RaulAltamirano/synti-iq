<script lang="ts" src="./CustomerCredit.ts" />

<template>
  <div
    class="rounded-xl shadow-lg p-6 transition-all duration-300"
    :class="{ 'bg-white text-gray-900': !isDark, 'bg-gray-800 text-gray-100': isDark }"
  >
    <!-- Header con título, búsqueda y filtros -->
    <header class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold">Créditos de Clientes</h2>
        <span
          class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300"
        >
          {{ filteredCredits.length }} registros
        </span>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar crédito..."
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
          v-model="statusFilter"
          class="p-2 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
          :class="[
            isDark
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-300 bg-white text-black',
          ]"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="paid">Pagado</option>
          <option value="overdue">Vencido</option>
        </select>
      </div>
    </header>

    <!-- Resumen de créditos -->
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
        <p class="text-sm text-gray-500 dark:text-gray-400">Total de créditos</p>
        <p class="text-2xl font-bold mt-1">${{ totalCredits.toFixed(2) }}</p>
        <p class="text-xs mt-2" :class="creditsTrend > 0 ? 'text-green-500' : 'text-red-500'">
          <span v-if="creditsTrend > 0">↑</span>
          <span v-else>↓</span>
          {{ Math.abs(creditsTrend) }}% vs período anterior
        </p>
      </div>

      <div
        class="p-4 rounded-lg border transition-all"
        :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Créditos activos</p>
        <p class="text-2xl font-bold mt-1">{{ activeCredits.length }}</p>
        <p class="text-xs mt-2 text-blue-500">Promedio: ${{ averageActiveCredit.toFixed(2) }}</p>
      </div>

      <div
        class="p-4 rounded-lg border transition-all"
        :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Créditos vencidos</p>
        <p class="text-2xl font-bold mt-1">{{ overdueCredits.length }}</p>
        <p class="text-xs mt-2 text-red-500">Total: ${{ totalOverdueCredits.toFixed(2) }}</p>
      </div>
    </div>

    <!-- Lista de créditos -->
    <div
      v-motion="{ initial: { opacity: 0 }, enter: { opacity: 1, transition: { stagger: 0.1 } } }"
      :class="{ 'opacity-50': isLoading }"
    >
      <div v-if="isLoading" class="flex justify-center my-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <div v-else-if="filteredCredits.length === 0" class="text-center py-12">
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
        <p class="mt-4 text-gray-500">No se encontraron créditos</p>
        <button class="mt-4 px-4 py-2 text-sm text-blue-600 underline" @click="resetFilters">
          Restablecer filtros
        </button>
      </div>

      <div v-else>
        <div
          v-for="(credit, index) in paginatedCredits"
          :key="credit.id"
          v-motion="{
            initial: { opacity: 0, y: 20 },
            enter: { opacity: 1, y: 0, transition: { delay: index * 50 } },
          }"
          class="border rounded-lg p-4 mb-4 cursor-pointer transition-all duration-300 hover:shadow-md"
          :class="[
            isDark
              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
              : 'border-gray-300 bg-white hover:bg-gray-100',
            { 'border-l-4 border-l-red-500': isOverdue(credit.dueDate) },
          ]"
          @click="toggleDetails(credit.id)"
        >
          <div class="flex flex-wrap md:flex-nowrap justify-between items-center gap-2">
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="getCreditStatusClass(credit.status)"
              >
                {{ credit.status }}
              </span>
              <p class="font-medium">ID: {{ credit.id }}</p>
              <p class="text-sm text-gray-500">Cliente: {{ credit.customer }}</p>
            </div>

            <div class="flex gap-4 items-center">
              <p class="font-bold text-lg">${{ credit.amount.toFixed(2) }}</p>
              <p class="text-sm text-gray-500">Vence: {{ formatDate(credit.dueDate) }}</p>

              <div class="flex gap-2">
                <button
                  class="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-600"
                  title="Ver detalles"
                  @click.stop="viewDetails(credit.id)"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"
                    />
                  </svg>
                </button>

                <button
                  class="text-green-500 hover:text-green-700 transition-colors duration-200 p-2 rounded-full hover:bg-green-50 dark:hover:bg-gray-600"
                  title="Enviar recordatorio"
                  @click.stop="sendReminder(credit.id)"
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-if="credit.showDetails" class="mt-4 transition-all duration-300">
            <div
              class="p-4 rounded-lg bg-opacity-50"
              :class="isDark ? 'bg-gray-600' : 'bg-gray-100'"
            >
              <p class="text-sm mb-3 flex justify-between">
                <span
                  >Cliente: <strong>{{ credit.customer }}</strong></span
                >
                <span
                  >Fecha de vencimiento: <strong>{{ formatDate(credit.dueDate) }}</strong></span
                >
              </p>

              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b" :class="isDark ? 'border-gray-500' : 'border-gray-300'">
                      <th class="text-left py-2 px-2">Descripción</th>
                      <th class="text-right py-2 px-2">Monto</th>
                      <th class="text-right py-2 px-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in credit.items"
                      :key="item.id"
                      class="border-b"
                      :class="isDark ? 'border-gray-500' : 'border-gray-300'"
                    >
                      <td class="py-2 px-2">{{ item.description }}</td>
                      <td class="py-2 px-2 text-right">${{ item.amount.toFixed(2) }}</td>
                      <td class="py-2 px-2 text-right">{{ item.status }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td class="pt-2 px-2" colspan="2">Total:</td>
                      <td class="pt-2 px-2 text-right font-bold">
                        ${{ credit.amount.toFixed(2) }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div class="mt-4 flex justify-end gap-2">
                <button
                  class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  @click.stop="markAsPaid(credit.id)"
                >
                  Marcar como pagado
                </button>
                <button
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  @click.stop="extendDueDate(credit.id)"
                >
                  Extender fecha
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div
        v-if="filteredCredits.length > itemsPerPage"
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
