<script lang="ts" src="./QuickView.ts" />

<template>
  <div>
    <Transition name="fade" appear>
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div
          v-if="product"
          class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
        >
          <!-- Botón Cerrar -->
          <button
            class="absolute right-2 top-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-300 shadow-lg"
            @click="$emit('close')"
          >
            <font-awesome-icon icon="xmark" />
          </button>
          <div class="grid md:grid-cols-2 gap-6 p-6">
            <!-- Galería de Imágenes -->
            <div class="space-y-4">
              <div class="relative aspect-square group">
                <!-- Imagen Principal -->
                <img
                  :src="currentImage"
                  :alt="product.name"
                  class="w-full h-full object-cover rounded-lg cursor-zoom-in"
                  @click="openZoom"
                />

                <!-- Controles de Navegación -->
                <button
                  v-if="product.image?.length > 1"
                  class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  @click="prevImage"
                >
                  <font-awesome-icon icon="chevron-left" />
                </button>
                <button
                  v-if="product.image?.length > 1"
                  class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  @click="nextImage"
                >
                  <font-awesome-icon icon="chevron-right" />
                </button>

                <!-- Badges -->
                <div class="absolute top-2 left-2 space-x-2">
                  <span
                    v-if="product.isNew"
                    class="px-3 py-1 bg-emerald-500 text-white text-sm rounded-full animate-bounce"
                  >
                    <font-awesome-icon icon="star" />
                  </span>
                  <span
                    v-if="product.discount"
                    class="px-3 py-1 bg-rose-500 text-white text-sm rounded-full animate-pulse"
                  >
                    <font-awesome-icon icon="tag" />
                    -{{ product.discount }}%
                  </span>
                </div>
              </div>

              <!-- Miniaturas -->
              <div v-if="product.image?.length > 1" class="flex gap-2 overflow-x-auto pb-2 p-1">
                <button
                  v-for="(image, index) in product.image"
                  :key="index"
                  class="relative w-20 h-20 flex-shrink-0 transition-transform hover:scale-105"
                  @click="selectImage(index)"
                >
                  <img
                    :src="image"
                    :alt="`${product.name} - Vista ${index + 1}`"
                    class="w-full h-full object-cover rounded-lg"
                    :class="{ 'ring-2 ring-blue-500': currentImageIndex === index }"
                  />
                </button>
              </div>
            </div>

            <!-- Información del Producto -->
            <div class="space-y-6">
              <div class="animate-fadeIn">
                <h2 class="text-2xl font-bold mb-2">{{ product.name }}</h2>
                <div class="flex items-center gap-2 mb-4">
                  <div class="flex text-amber-400">
                    <font-awesome-icon
                      v-for="star in 5"
                      :key="star"
                      icon="fa-star"
                      :class="[
                        'fas',
                        star <= Math.floor(product.rating)
                          ? 'fa-star'
                          : star - product.rating === 0.5
                            ? 'fa-star-half-alt'
                            : 'far fa-star',
                      ]"
                    />
                  </div>
                  <span class="text-sm text-gray-600"> ({{ product.reviews }} reseñas) </span>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-3xl font-bold text-blue-600">
                    ${{ product.price.toFixed(2) }}
                  </span>
                  <span v-if="product.oldPrice" class="text-lg text-gray-400 line-through">
                    ${{ product.oldPrice.toFixed(2) }}
                  </span>
                </div>
              </div>

              <!-- Acciones del Producto -->
              <div class="space-y-4 animate-slideUp">
                <div class="flex items-center gap-4">
                  <div class="flex items-center border rounded-lg bg-gray-50">
                    <button
                      class="px-4 py-2 hover:bg-gray-100 transition-colors"
                      :disabled="quantity <= 1"
                      @click="decrementQuantity"
                    >
                      <font-awesome-icon icon="minus" />
                    </button>
                    <span class="w-12 text-center font-medium">{{ quantity }}</span>
                    <button
                      class="px-4 py-2 hover:bg-gray-100 transition-colors"
                      @click="incrementQuantity"
                    >
                      <font-awesome-icon icon="plus" />
                    </button>
                  </div>
                  <button
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 active:scale-95"
                    @click="addToCart"
                  >
                    <font-awesome-icon icon="shopping-cart" />
                    Añadir al Carrito
                  </button>
                </div>

                <div class="flex gap-4">
                  <button
                    class="p-3 border rounded-lg hover:bg-gray-50 transition-colors group relative"
                    :class="{ 'text-rose-500': isFavorite }"
                    @click="toggleFavorite"
                  >
                    <font-awesome-icon
                      :icon="isFavorite ? 'fa-heart animate-heartBeat' : 'fa-heart'"
                    />
                    <span
                      class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {{ isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos' }}
                    </span>
                  </button>
                  <button
                    class="p-3 border rounded-lg hover:bg-gray-50 transition-colors group relative"
                    @click="shareProduct"
                  >
                    <font-awesome-icon icon="share-alt" />
                    <span
                      class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Compartir producto
                    </span>
                  </button>
                </div>
              </div>

              <!-- Detalles del Producto -->
              <div class="space-y-4 animate-fadeIn">
                <div class="border-t pt-4">
                  <h3 class="font-semibold flex items-center gap-2">
                    <font-awesome-icon
                      icon="info-circle"
                      class="fas fa-info-circle text-blue-500"
                    />
                    Descripción
                  </h3>
                  <p class="text-gray-600 mt-2">{{ product.description }}</p>
                </div>

                <div v-if="product.features?.length" class="border-t pt-4">
                  <h3 class="font-semibold flex items-center gap-2">
                    <font-awesome-icon icon="fa-list" class="fas fa-list-ul text-blue-500" />
                    Características
                  </h3>
                  <ul class="mt-2 space-y-2">
                    <li
                      v-for="(feature, index) in product.features"
                      :key="index"
                      class="flex items-start gap-2 text-gray-600"
                    >
                      <i class="fas fa-check-circle text-green-500 mt-1"></i>
                      <span>{{ feature }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Productos Sugeridos -->
          <div class="border-t p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <i class="fas fa-thumbs-up text-blue-500"></i>
              Productos Sugeridos
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="suggestedProduct in suggestedProducts"
                :key="suggestedProduct.id"
                class="group border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <div class="relative overflow-hidden">
                  <img
                    :src="suggestedProduct.image"
                    :alt="suggestedProduct.name"
                    class="w-full h-32 object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <button
                      class="bg-white text-blue-600 px-4 py-2 rounded-lg transform -translate-y-4 group-hover:translate-y-0 transition-transform"
                    >
                      Ver Producto
                    </button>
                  </div>
                </div>
                <div class="p-4">
                  <h4 class="font-medium text-sm mb-2 line-clamp-2">{{ suggestedProduct.name }}</h4>
                  <p class="text-sm font-bold text-blue-600">${{ suggestedProduct.price }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal de Zoom -->
    <div
      v-if="showZoom"
      class="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
      @click="closeZoom"
    >
      <button
        class="absolute top-4 right-4 text-white text-xl hover:text-gray-300 transition-colors"
      >
        <font-awesome-icon icon="fa-times" />
      </button>
      <img
        :src="currentImage"
        :alt="product?.name"
        class="max-w-full max-h-[90vh] object-contain"
      />
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
