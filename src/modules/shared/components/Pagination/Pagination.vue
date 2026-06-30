<template>
  <div class="flex justify-center mt-6 space-x-2">
    <!-- Botón Primera Página -->
    <button
      :disabled="currentPage === 1"
      class="px-3 py-2 rounded-lg"
      :class="buttonClass(currentPage === 1)"
      @click="goToPage(1)"
    >
      Primera
    </button>

    <!-- Botón Página Anterior -->
    <button
      :disabled="currentPage === 1"
      class="px-3 py-2 rounded-lg"
      :class="buttonClass(currentPage === 1)"
      @click="goToPage(currentPage - 1)"
    >
      Anterior
    </button>

    <!-- Páginas Iniciales con botón de elipsis -->
    <button
      v-if="rangeStart > 1"
      class="px-4 py-2 rounded-lg bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-colors"
      @click="goToPage(rangeStart - 1)"
    >
      ...
    </button>

    <!-- Páginas Principales -->
    <button
      v-for="page in pagesInRange"
      :key="page"
      class="px-4 py-2 rounded-lg"
      :class="{
        'bg-primary text-white': currentPage === page,
        'bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-colors':
          currentPage !== page,
      }"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>

    <!-- Páginas Finales con botón de elipsis -->
    <button
      v-if="rangeEnd < totalPages"
      class="px-4 py-2 rounded-lg bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-colors"
      @click="goToPage(rangeEnd + 1)"
    >
      ...
    </button>

    <!-- Botón Página Siguiente -->
    <button
      :disabled="currentPage === totalPages"
      class="px-3 py-2 rounded-lg"
      :class="buttonClass(currentPage === totalPages)"
      @click="goToPage(currentPage + 1)"
    >
      Siguiente
    </button>

    <!-- Botón Última Página -->
    <button
      :disabled="currentPage === totalPages"
      class="px-3 py-2 rounded-lg"
      :class="buttonClass(currentPage === totalPages)"
      @click="goToPage(totalPages)"
    >
      Última
    </button>
  </div>
</template>

<script lang="ts" src="./Pagination.ts" />
