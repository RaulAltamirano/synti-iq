<script lang="ts" src="./ProductCard.ts" />

<template>
  <div
    class="relative bg-white p-4 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-gray-200"
  >
    <!-- Imagen del Producto -->
    <div class="relative">
      <img
        :src="product.image[0]"
        :alt="product.name"
        class="w-full h-48 object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
      />
      <span
        v-if="product.discount"
        class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"
      >
        {{ product.discount }}% OFF
      </span>
    </div>

    <!-- Información del Producto -->
    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
        {{ product.name }}
      </h3>
      <div class="flex items-center space-x-2 mt-1">
        <p class="text-gray-600 text-sm">
          <span class="text-lg font-bold">${{ product.price }}</span>
          <span v-if="product.originalPrice" class="text-gray-400 line-through text-sm ml-2">
            ${{ product.originalPrice }}
          </span>
        </p>
      </div>

      <!-- Calificación -->
      <div class="flex items-center space-x-1 text-yellow-500 mt-2">
        <font-awesome-icon
          v-for="i in 5"
          :key="i"
          icon="star"
          :class="{ 'text-yellow-400': i <= product.rating, 'text-gray-300': i > product.rating }"
        />
        <span class="text-gray-600 text-sm ml-2"> ({{ product.rating.toFixed(1) }}) </span>
      </div>

      <!-- Descripción -->
      <p class="text-gray-500 text-sm mt-2 line-clamp-2">
        {{ product.description }}
      </p>
    </div>

    <!-- Botones de Acción -->
    <div
      class="absolute top-4 right-4 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <button
        class="p-2 bg-white rounded-full shadow hover:bg-gray-100 border border-gray-200 transition-all"
        aria-label="Add to Wishlist"
        @click="$emit('add-to-wishlist', product)"
      >
        <font-awesome-icon icon="heart" class="text-red-500" />
      </button>
      <button
        class="p-2 bg-white rounded-full shadow hover:bg-gray-100 border border-gray-200 transition-all"
        aria-label="Quick View"
        @click="$emit('quick-view', product)"
      >
        <font-awesome-icon icon="eye" class="text-gray-600" />
      </button>
    </div>
  </div>
</template>
