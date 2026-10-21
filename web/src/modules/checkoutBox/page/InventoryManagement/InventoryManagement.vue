<script lang="ts" src="./InventoryManagement.ts" />

<template>
  <div
    class="rounded-xl shadow-lg p-6 transition-all duration-300"
    :class="{ 'bg-white text-gray-900': !isDark, 'bg-gray-800 text-gray-100': isDark }"
  >
    <!-- Header con título, búsqueda y acciones principales -->
    <header class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold">Gestión de Inventario</h2>
        <span
          class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300"
        >
          {{ filteredProducts.length }} productos
        </span>
      </div>

      <div class="flex flex-wrap md:flex-nowrap gap-2">
        <div class="relative flex-grow">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar producto..."
            class="pl-10 pr-4 py-2 border rounded-lg w-full transition-all focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
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

        <button
          class="px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
          :class="[
            isRefreshing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600',
          ]"
          title="Actualizar inventario"
          :disabled="isRefreshing"
          @click="refreshInventory"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            :class="{ 'animate-spin': isRefreshing }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span class="text-white">{{ isRefreshing ? 'Actualizando...' : 'Actualizar' }}</span>
        </button>

        <button
          class="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2"
          title="Añadir producto"
          @click="showAddProductModal = true"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Añadir</span>
        </button>
      </div>
    </header>

    <!-- Filtros avanzados -->
    <div
      v-motion="{ initial: { opacity: 0, y: -20 }, enter: { opacity: 1, y: 0 } }"
      class="flex flex-wrap gap-4 mb-6 pb-4 border-b"
      :class="[isDark ? 'border-gray-700' : 'border-gray-200']"
    >
      <div class="flex flex-wrap md:flex-nowrap gap-4 w-full">
        <div class="w-full md:w-auto">
          <label class="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Categoría</label>
          <select
            v-model="selectedCategory"
            class="p-2 border rounded-lg w-full md:w-48 outline-none transition-all focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
            :class="[
              isDark
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black',
            ]"
          >
            <option value="">Todas las categorías</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <div class="w-full md:w-auto">
          <label class="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Estado de stock</label>
          <select
            v-model="stockFilter"
            class="p-2 border rounded-lg w-full md:w-48 outline-none transition-all focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
            :class="[
              isDark
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black',
            ]"
          >
            <option value="all">Todos los productos</option>
            <option value="critical">Stock crítico (&lt;5)</option>
            <option value="low">Stock bajo (5-10)</option>
            <option value="normal">Stock normal (>10)</option>
          </select>
        </div>

        <div class="w-full md:w-auto">
          <label class="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Ordenar por</label>
          <select
            v-model="sortBy"
            class="p-2 border rounded-lg w-full md:w-48 outline-none transition-all focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
            :class="[
              isDark
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black',
            ]"
          >
            <option value="name">Nombre</option>
            <option value="stock-asc">Stock (Menor a Mayor)</option>
            <option value="stock-desc">Stock (Mayor a Menor)</option>
            <option value="price-asc">Precio (Menor a Mayor)</option>
            <option value="price-desc">Precio (Mayor a Menor)</option>
          </select>
        </div>
      </div>

      <div class="flex gap-2 ml-auto items-end">
        <button
          class="px-4 py-2 text-sm rounded-lg border transition-colors"
          :class="[
            isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100',
          ]"
          @click="resetFilters"
        >
          Limpiar filtros
        </button>
        <button
          class="px-4 py-2 text-sm rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center gap-2"
          @click="exportFilteredInventory"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          Exportar
        </button>
      </div>
    </div>

    <!-- Resumen de inventario -->
    <div
      v-motion="{
        initial: { opacity: 0, y: 20 },
        enter: { opacity: 1, y: 0, transition: { delay: 200 } },
      }"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6"
    >
      <div
        class="p-4 rounded-lg border transition-all"
        :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Total de productos</p>
        <p class="text-2xl font-bold mt-1">{{ totalProducts }}</p>
        <p class="text-xs mt-2" :class="inventoryTrend > 0 ? 'text-green-500' : 'text-red-500'">
          <span v-if="inventoryTrend > 0">↑</span>
          <span v-else>↓</span>
          {{ Math.abs(inventoryTrend) }}% vs mes anterior
        </p>
      </div>

      <div
        class="p-4 rounded-lg border transition-all"
        :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Stock crítico</p>
        <p class="text-2xl font-bold mt-1 text-red-500">{{ criticalStockProducts }}</p>
        <p class="text-xs mt-2">
          {{ Math.round((criticalStockProducts / totalProducts) * 100) }}% del inventario
        </p>
      </div>

      <div
        class="p-4 rounded-lg border transition-all"
        :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Valor de inventario</p>
        <p class="text-2xl font-bold mt-1">${{ totalInventoryValue.toLocaleString() }}</p>
        <p class="text-xs mt-2 text-blue-500">
          Promedio: ${{ averageProductValue.toLocaleString() }}
        </p>
      </div>

      <div
        class="p-4 rounded-lg border transition-all"
        :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Más vendidos (mes)</p>
        <p class="text-xl font-bold mt-1 truncate" :title="topSellingProduct.name">
          {{ topSellingProduct.name || 'N/A' }}
        </p>
        <p class="text-xs mt-2 text-gray-500">
          {{ topSellingProduct.sold || 0 }} unidades vendidas
        </p>
      </div>
    </div>

    <!-- Tabla de productos -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
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
      <p class="mt-4 text-gray-500">No se encontraron productos</p>
      <button class="mt-4 px-4 py-2 text-sm text-blue-600 underline" @click="resetFilters">
        Restablecer filtros
      </button>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b" :class="isDark ? 'border-gray-600' : 'border-gray-300'">
            <th class="text-left py-3 px-4">Producto</th>
            <th class="text-left py-3 px-4">Categoría</th>
            <th class="text-right py-3 px-4">Stock</th>
            <th class="text-right py-3 px-4">Precio</th>
            <th class="text-right py-3 px-4">Valor</th>
            <th class="text-center py-3 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(product, index) in filteredProducts"
            :key="product.id"
            v-motion="{
              initial: { opacity: 0, x: -20 },
              enter: { opacity: 1, x: 0, transition: { delay: index * 50 } },
            }"
            class="border-b hover:bg-opacity-50 cursor-pointer transition-colors"
            :class="[
              isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50',
              { 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20': product.stock < 5 },
              {
                'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20':
                  product.stock >= 5 && product.stock <= 10,
              },
            ]"
            @click="toggleProductDetails(product.id)"
          >
            <td class="py-3 px-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden"
                >
                  <span v-if="!product.image" class="text-xl font-bold text-gray-500">{{
                    product.name.charAt(0)
                  }}</span>
                  <img
                    v-else
                    :src="product.image"
                    alt="Producto"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p class="font-medium">{{ product.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">SKU: {{ product.sku }}</p>
                </div>
              </div>
            </td>
            <td class="py-3 px-4">
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="getCategoryClass(product.category)"
              >
                {{ product.category }}
              </span>
            </td>
            <td class="py-3 px-4 text-right">
              <div
                :class="{
                  'text-red-500 font-bold': product.stock < 5,
                  'text-yellow-500': product.stock >= 5 && product.stock <= 10,
                  'text-green-500': product.stock > 10,
                }"
              >
                {{ product.stock }} unidades
              </div>
              <div
                class="mt-1 h-1 w-24 bg-gray-200 dark:bg-gray-600 rounded-full ml-auto overflow-hidden"
              >
                <div
                  class="h-full rounded-full"
                  :class="getStockBarColor(product.stock)"
                  :style="{ width: getStockPercentage(product.stock) + '%' }"
                ></div>
              </div>
            </td>
            <td class="py-3 px-4 text-right">${{ product.price.toFixed(2) }}</td>
            <td class="py-3 px-4 text-right font-medium">
              ${{ (product.price * product.stock).toFixed(2) }}
            </td>
            <td class="py-3 px-4">
              <div class="flex justify-center gap-2">
                <button
                  class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Ajustar stock"
                  @click.stop="adjustStock(product)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </button>
                <button
                  class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Editar producto"
                  @click.stop="editProduct(product)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Exportar producto"
                  @click.stop="exportProduct(product)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500"
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
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Detalles expandibles del producto -->
      <div
        v-if="selectedProductId"
        v-motion="{ initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0 } }"
        class="mt-4 p-4 rounded-lg transition-all duration-300"
        :class="isDark ? 'bg-gray-700' : 'bg-gray-100'"
      >
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-bold mb-3">Detalles del producto</h3>
          <button
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            @click="selectedProductId = null"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="mb-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">Descripción</p>
              <p class="mt-1">{{ selectedProduct?.description || 'Sin descripción' }}</p>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">Detalles del proveedor</p>
              <p class="mt-1">
                <strong>Proveedor:</strong> {{ selectedProduct?.supplier || 'N/A' }}
              </p>
              <p><strong>Contacto:</strong> {{ selectedProduct?.supplierContact || 'N/A' }}</p>
              <p><strong>Tiempo de entrega:</strong> {{ selectedProduct?.leadTime || 'N/A' }}</p>
            </div>

            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Ubicación en almacén</p>
              <p class="mt-1">{{ selectedProduct?.location || 'No especificada' }}</p>
            </div>
          </div>

          <div>
            <div class="mb-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">Historial de stock</p>
              <div
                class="mt-2 h-32 bg-white dark:bg-gray-800 rounded-lg p-2 border dark:border-gray-600"
              >
                <!-- Aquí iría un gráfico, simulado con div -->
                <div class="h-full w-full flex items-end justify-between">
                  <div
                    v-for="month in ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']"
                    :key="month"
                    class="w-1/6 mx-1 flex flex-col items-center"
                  >
                    <div
                      class="w-full bg-blue-500 rounded-t-sm"
                      :style="{ height: `${20 + Math.random() * 70}%` }"
                    ></div>
                    <span class="text-xs mt-1 text-gray-500">{{ month }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Acciones rápidas</p>
              <div class="mt-2 flex gap-2">
                <button
                  class="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  @click="orderMoreStock(selectedProduct)"
                >
                  Ordenar más
                </button>
                <button
                  class="flex-1 py-2 px-4 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                  @click="printBarcode(selectedProduct)"
                >
                  Imprimir código
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div class="flex justify-between items-center mt-6">
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
