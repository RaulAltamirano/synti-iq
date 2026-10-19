<script lang="ts" src="./Products.ts" />

<template>
  <div class="p-16">
    <!-- Barra de Filtros, Búsqueda y Ordenamiento -->
    <div
      class="sticky top-0 z-20 bg-white shadow-lg py-4 px-4 flex flex-col md:flex-row justify-between items-center"
    >
      <h2 class="text-lg md:text-3xl font-bold text-gray-800">Productos</h2>
      <div class="flex flex-wrap space-x-4 items-center mt-4 md:mt-0">
        <!-- Campo de Búsqueda -->
        <div class="relative">
          <i class="absolute left-2 top-2 text-gray-400">
            <font-awesome-icon icon="magnifying-glass" />
          </i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar producto..."
            class="pl-8 p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
          />
        </div>

        <!-- Selector de Ordenamiento -->
        <select
          v-model="sortOrder"
          class="p-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="default">Ordenar por</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="rating">Mejor calificación</option>
        </select>
      </div>
    </div>

    <!-- Contenedor de Tarjetas de Productos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
      <ProductCard
        v-for="product in paginatedProducts"
        :key="product.id"
        :product="product"
        @quick-view="openQuickView"
      />
    </div>

    <!-- Componente de Paginación -->
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :max-pages-to-show="5"
      :on-page-change="goToPage"
    />

    <!-- Modal de Vista Rápida -->
    <QuickView
      :is-open="isQuickViewOpen"
      :product="selectedProduct"
      @close="closeQuickView"
      @add-to-cart="handleAddToCart"
    />
  </div>
</template>

<style scoped>
/* Contenedor mínimo para productos */
.grid {
  min-height: 40vh; /* Asegura que el área de productos tenga altura suficiente */
}
</style>
