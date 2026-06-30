<script lang="ts" src="./ReturnsView.ts" />

<template>
  <div
    class="rounded-xl shadow-lg p-6 transition-all duration-300"
    :class="{ 'bg-white text-gray-900': !isDark, 'bg-gray-800 text-gray-100': isDark }"
  >
    <!-- Header con título, búsqueda y filtros -->
    <header class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold">Devoluciones</h2>
        <span
          class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300"
        >
          {{ filteredReturns.length }} registros
        </span>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar devolución..."
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
          <option value="all">Todas las devoluciones</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobadas</option>
          <option value="rejected">Rechazadas</option>
        </select>
      </div>
    </header>

    <!-- Resumen de devoluciones -->
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
        <p class="text-sm text-gray-500 dark:text-gray-400">Devoluciones totales</p>
        <p class="text-2xl font-bold mt-1">${{ totalReturns.toFixed(2) }}</p>
        <p class="text-xs mt-2" :class="returnsTrend > 0 ? 'text-red-500' : 'text-green-500'">
          <span v-if="returnsTrend > 0">↑</span>
          <span v-else>↓</span>
          {{ Math.abs(returnsTrend) }}% vs período anterior
        </p>
      </div>

      <div
        class="p-4 rounded-lg border transition-all"
        :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Número de devoluciones</p>
        <p class="text-2xl font-bold mt-1">{{ filteredReturns.length }}</p>
        <p class="text-xs mt-2 text-blue-500">Promedio: ${{ averageReturn.toFixed(2) }}</p>
      </div>

      <div
        class="p-4 rounded-lg border transition-all"
        :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Producto más devuelto</p>
        <p class="text-xl font-bold mt-1">{{ topReturnedProduct.name }}</p>
        <p class="text-xs mt-2 text-gray-500">{{ topReturnedProduct.count }} unidades devueltas</p>
      </div>
    </div>

    <!-- Lista de devoluciones -->
    <div
      v-motion="{ initial: { opacity: 0 }, enter: { opacity: 1, transition: { stagger: 0.1 } } }"
      :class="{ 'opacity-50': isLoading }"
    >
      <div v-if="isLoading" class="flex justify-center my-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <div v-else-if="filteredReturns.length === 0" class="text-center py-12">
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
        <p class="mt-4 text-gray-500">No se encontraron devoluciones</p>
        <button class="mt-4 px-4 py-2 text-sm text-blue-600 underline" @click="resetFilters">
          Restablecer filtros
        </button>
      </div>

      <div v-else>
        <div
          v-for="(returnItem, index) in paginatedReturns"
          :key="returnItem.id"
          v-motion="{
            initial: { opacity: 0, y: 20 },
            enter: { opacity: 1, y: 0, transition: { delay: index * 50 } },
          }"
          class="border rounded-lg p-4 mb-4 cursor-pointer transition-all duration-300 hover:shadow-md"
          :class="[
            isDark
              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
              : 'border-gray-300 bg-white hover:bg-gray-100',
            { 'border-l-4 border-l-red-500': isRecentReturn(returnItem.date) },
          ]"
          @click="toggleDetails(returnItem.id)"
        >
          <div class="flex flex-wrap md:flex-nowrap justify-between items-center gap-2">
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="getReturnStatusClass(returnItem.status)"
              >
                {{ returnItem.status }}
              </span>
              <p class="font-medium">ID: {{ returnItem.id }}</p>
            </div>

            <div class="flex gap-4 items-center">
              <p class="font-bold text-lg">${{ returnItem.total.toFixed(2) }}</p>

              <div class="flex gap-2">
                <button
                  class="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-600"
                  title="Descargar comprobante"
                  @click.stop="downloadReturnSlip(returnItem.id)"
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>

                <button
                  class="text-green-500 hover:text-green-700 transition-colors duration-200 p-2 rounded-full hover:bg-green-50 dark:hover:bg-gray-600"
                  title="Enviar por email"
                  @click.stop="sendEmailReturnSlip(returnItem.id)"
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-if="returnItem.showDetails" class="mt-4 transition-all duration-300">
            <div
              class="p-4 rounded-lg bg-opacity-50"
              :class="isDark ? 'bg-gray-600' : 'bg-gray-100'"
            >
              <p class="text-sm mb-3 flex justify-between">
                <span
                  >Cliente: <strong>{{ returnItem.customer }}</strong></span
                >
                <span
                  >Fecha: <strong>{{ formatDate(returnItem.date) }}</strong></span
                >
              </p>

              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b" :class="isDark ? 'border-gray-500' : 'border-gray-300'">
                      <th class="text-left py-2 px-2">Producto</th>
                      <th class="text-right py-2 px-2">Cantidad</th>
                      <th class="text-right py-2 px-2">Precio</th>
                      <th class="text-right py-2 px-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in returnItem.items"
                      :key="item.id"
                      class="border-b"
                      :class="isDark ? 'border-gray-500' : 'border-gray-300'"
                    >
                      <td class="py-2 px-2">{{ item.name }}</td>
                      <td class="py-2 px-2 text-right">{{ item.quantity }}</td>
                      <td class="py-2 px-2 text-right">${{ item.price.toFixed(2) }}</td>
                      <td class="py-2 px-2 text-right">
                        ${{ (item.quantity * item.price).toFixed(2) }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td class="pt-2 px-2" colspan="3">Subtotal:</td>
                      <td class="pt-2 px-2 text-right">
                        ${{ calculateSubtotal(returnItem.items).toFixed(2) }}
                      </td>
                    </tr>
                    <tr>
                      <td class="py-1 px-2" colspan="3">Impuestos (16%):</td>
                      <td class="py-1 px-2 text-right">
                        ${{ calculateTaxes(returnItem.items).toFixed(2) }}
                      </td>
                    </tr>
                    <tr>
                      <td class="py-1 px-2" colspan="3">Total:</td>
                      <td class="py-1 px-2 text-right font-bold">
                        ${{ returnItem.total.toFixed(2) }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div class="mt-4 flex justify-end gap-2">
                <button
                  class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                  @click.stop="printReturnSlip(returnItem.id)"
                >
                  Imprimir
                </button>
                <button
                  class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  @click.stop="approveReturn(returnItem)"
                >
                  Aprobar devolución
                </button>
                <button
                  class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  @click.stop="rejectReturn(returnItem)"
                >
                  Rechazar devolución
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div
        v-if="filteredReturns.length > itemsPerPage"
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
