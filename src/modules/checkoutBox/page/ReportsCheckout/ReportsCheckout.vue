<script lang="ts" src="./ReportsCheckout.ts" />

<template>
  <div
    class="rounded-xl shadow-lg p-6 transition-all duration-300"
    :class="{ 'bg-white text-gray-900': !isDark, 'bg-gray-800 text-gray-100': isDark }"
  >
    <!-- Título y descripción -->
    <header class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold">Reportes</h2>
      </div>
    </header>

    <!-- Sección de Reportes Esenciales -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6">Reportes basicos</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Reporte de Ventas por Día/Hora -->
        <div
          v-motion="{
            initial: { opacity: 0, y: 20 },
            enter: { opacity: 1, y: 0, transition: { delay: 100 } },
          }"
          class="p-6 rounded-lg border transition-all hover:shadow-md"
          :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
        >
          <h3 class="text-xl font-semibold mb-2">
            <font-awesome-icon :icon="['fas', 'chart-line']" class="mr-2" />
            Ventas por Día/Hora
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Analiza los momentos de mayor actividad para optimizar turnos y estrategias.
          </p>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            @click="generateSalesByHourReport"
          >
            Generar Reporte
          </button>
        </div>

        <!-- Reporte de Productos con Bajo Stock -->
        <div
          v-motion="{
            initial: { opacity: 0, y: 20 },
            enter: { opacity: 1, y: 0, transition: { delay: 200 } },
          }"
          class="p-6 rounded-lg border transition-all hover:shadow-md"
          :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
        >
          <h3 class="text-xl font-semibold mb-2">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="mr-2" />
            Productos con Bajo Stock
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Identifica productos críticos para reabastecer, segmentados por proveedor.
          </p>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            @click="generateLowStockReport"
          >
            Generar Reporte
          </button>
        </div>

        <!-- Reporte de Ventas por Categoría y Producto -->
        <div
          v-motion="{
            initial: { opacity: 0, y: 20 },
            enter: { opacity: 1, y: 0, transition: { delay: 300 } },
          }"
          class="p-6 rounded-lg border transition-all hover:shadow-md"
          :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
        >
          <h3 class="text-xl font-semibold mb-2">
            <font-awesome-icon :icon="['fas', 'shopping-basket']" class="mr-2" />
            Ventas por Categoría
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Descubre qué categorías y productos son los más vendidos.
          </p>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            @click="generateSalesByCategoryReport"
          >
            Generar Reporte
          </button>
        </div>
      </div>
    </section>

    <!-- Sección de Reportes Innovadores -->
    <section>
      <h2 class="text-2xl font-bold mb-6">Reportes avanzados</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Predicción de Ruptura de Stock -->
        <div
          v-motion="{
            initial: { opacity: 0, y: 20 },
            enter: { opacity: 1, y: 0, transition: { delay: 400 } },
          }"
          class="p-6 rounded-lg border transition-all hover:shadow-md"
          :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
        >
          <h3 class="text-xl font-semibold mb-2">
            <font-awesome-icon :icon="['fas', 'chart-pie']" class="mr-2" />
            Predicción de Ruptura de Stock
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Predice cuándo se agotará un producto y recibe alertas.
          </p>
          <button
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            @click="generateStockPredictionReport"
          >
            Generar Reporte
          </button>
        </div>

        <!-- Análisis de Productos Complementarios -->
        <div
          v-motion="{
            initial: { opacity: 0, y: 20 },
            enter: { opacity: 1, y: 0, transition: { delay: 500 } },
          }"
          class="p-6 rounded-lg border transition-all hover:shadow-md"
          :class="[isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50']"
        >
          <h3 class="text-xl font-semibold mb-2">
            <font-awesome-icon :icon="['fas', 'handshake']" class="mr-2" />
            Productos Complementarios
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Descubre qué productos suelen comprarse juntos.
          </p>
          <button
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            @click="generateComplementaryProductsReport"
          >
            Generar Reporte
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
