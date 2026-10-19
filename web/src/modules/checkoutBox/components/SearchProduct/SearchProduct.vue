<script lang="ts" src="./SearchProduct.ts" />

<template>
  <div class="flex flex-col gap-4 items-start sm:flex-row">
    <!-- Contenedor principal -->
    <div class="relative flex-1">
      <div class="transition-colors duration-300 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <!-- Barra de búsqueda -->
        <div
          class="flex items-center p-2 transition-all duration-300 rounded-lg"
          :class="[
            isFocused
              ? 'ring-2 ring-blue-500 shadow-blue-100 dark:shadow-blue-900/20'
              : 'bg-gray-50 dark:bg-gray-700',
          ]"
        >
          <!-- Ícono de búsqueda -->
          <i
            class="px-2 transition-colors duration-300 text-gray-400 dark:text-gray-500"
            :class="{ 'text-blue-500 dark:text-blue-400': isFocused }"
          >
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" aria-hidden="true" />
          </i>

          <!-- Campo de entrada -->
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar producto..."
            class="flex-grow border-none outline-none transition-colors duration-300 bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 py-1"
            aria-label="Campo de búsqueda de productos"
            @focus="handleFocus"
            @blur="handleBlur"
          />

          <!-- Botón para limpiar búsqueda -->
          <button
            v-if="searchQuery.length > 0"
            class="p-1 rounded-full transition-all duration-200 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            aria-label="Limpiar búsqueda"
            @click="clearSearch"
          >
            <font-awesome-icon :icon="['fas', 'times-circle']" aria-hidden="true" />
          </button>

          <!-- Ícono de carga -->
          <div v-if="searchStore.isLoading && !showDropdown" class="ml-2" aria-live="polite">
            <font-awesome-icon
              :icon="['fas', 'spinner']"
              class="animate-spin text-blue-500 h-5 w-5"
              aria-hidden="true"
            />
          </div>
        </div>

        <!-- Dropdown de resultados -->
        <transition name="fade">
          <div
            v-if="showDropdown && searchStore.filteredProducts.length > 0"
            ref="listContainerRef"
            class="absolute w-full z-50 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg max-h-64 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-700"
            role="listbox"
            aria-label="Resultados de búsqueda"
          >
            <transition-group name="list-fade" tag="ul">
              <li
                v-for="product in searchStore.filteredProducts"
                :key="product.id"
                class="group flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-none"
                role="option"
                :aria-selected="false"
                @click="selectProduct(product)"
              >
                <!-- Imagen del producto -->
                <div class="flex items-center space-x-4">
                  <div
                    class="relative overflow-hidden rounded-lg w-14 h-14 bg-gray-100 dark:bg-gray-700"
                  >
                    <img
                      v-if="product.image"
                      :src="product.image"
                      :alt="`Imagen de ${product.name}`"
                      class="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1 product-image"
                      loading="lazy"
                    />
                  </div>
                  <!-- Detalles del producto -->
                  <div>
                    <h4
                      class="text-sm font-semibold transition-colors duration-300 text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    >
                      {{ product.name }}
                    </h4>
                    <p
                      class="text-xs transition-colors duration-300 text-gray-500 dark:text-gray-400 mt-1"
                    >
                      {{ product.description }}
                    </p>
                  </div>
                </div>
                <!-- Precio y marca -->
                <div class="flex flex-col items-end">
                  <p class="text-sm font-bold text-blue-600 dark:text-blue-400">
                    ${{ product.sellingPrice }}
                  </p>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ product.brand }}
                  </div>
                </div>
              </li>
            </transition-group>

            <!-- Indicador de carga de más resultados -->
            <div
              v-if="searchStore.hasMoreResults"
              ref="loadingMoreRef"
              class="p-3 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              <transition name="fade">
                <div v-if="searchStore.isLoading">
                  <font-awesome-icon
                    :icon="['fas', 'spinner']"
                    class="animate-spin text-blue-500"
                    aria-hidden="true"
                  />
                  <span class="ml-2">Cargando más productos...</span>
                </div>
                <div v-else>Desplázate para cargar más resultados</div>
              </transition>
            </div>
          </div>

          <!-- Mensaje cuando no hay resultados -->
          <div
            v-else-if="showDropdown && searchQuery.length > 0 && !searchStore.isLoading"
            class="absolute w-full z-50 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center transition-colors duration-300 border border-gray-100 dark:border-gray-700"
            aria-live="polite"
          >
            <font-awesome-icon
              :icon="['fas', 'search']"
              class="text-3xl mb-2 text-gray-300 dark:text-gray-600"
              aria-hidden="true"
            />
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              No se encontraron productos para
              <span class="font-medium">{{ searchQuery }}</span
              >.
            </p>
            <button
              class="mt-2 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              @click="clearSearch"
            >
              Limpiar búsqueda
            </button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos personalizados */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.3s ease;
}

.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
