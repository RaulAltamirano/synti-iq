<script lang="ts" src="./ShareCartModal.ts" />

<template>
  <Teleport to="body">
    <div>
      <!-- Modal Overlay -->
      <div v-if="modalOpen" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Overlay Background -->
        <div
          v-motion="{
            initial: { opacity: 0 },
            enter: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
            leave: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
          }"
          class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          @click="closeModal"
        ></div>

        <!-- Modal Container -->
        <div class="flex items-center justify-center min-h-screen p-4">
          <div
            id="share-cart-modal"
            v-motion="{
              initial: { opacity: 0, y: 20, scale: 0.98 },
              enter: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
              },
              leave: {
                opacity: 0,
                y: 20,
                scale: 0.98,
                transition: { duration: 0.2, ease: [0.36, 0.66, 0.04, 1] },
              },
            }"
            class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-cart-modal-title"
            @click.stop
          >
            <!-- Modal Header -->
            <div
              class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <FontAwesomeIcon :icon="['fas', 'share-nodes']" class="h-5 w-5 text-indigo-500" />
                <h2
                  id="share-cart-modal-title"
                  class="text-xl font-bold text-gray-800 dark:text-white"
                >
                  Compartir Carrito
                </h2>
              </div>
              <button
                class="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                aria-label="Cerrar modal"
                @click="closeModal"
              >
                <FontAwesomeIcon :icon="['fas', 'xmark']" class="h-5 w-5" />
              </button>
            </div>

            <!-- Modal Content -->
            <div class="overflow-y-auto max-h-[calc(100vh-12rem)] p-6">
              <!-- Cart Summary -->
              <div
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 50 } },
                }"
                class="mb-6"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon
                    :icon="['fas', 'cart-shopping']"
                    class="h-4 w-4 mr-2 text-indigo-500"
                  />
                  Resumen del Carrito
                </h3>
                <div
                  class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <!-- Items List -->
                  <div class="max-h-48 overflow-y-auto mb-4">
                    <div
                      v-for="(item, index) in cartItems"
                      :key="index"
                      class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div class="flex items-center">
                        <span class="text-gray-600 dark:text-gray-300 text-sm mr-2"
                          >{{ item.quantity }}x</span
                        >
                        <span class="text-gray-800 dark:text-gray-200">{{ item.name }}</span>
                      </div>
                      <span class="text-gray-800 dark:text-gray-200 font-medium"
                        >${{ (item.quantity * item.price).toFixed(2) }}</span
                      >
                    </div>
                  </div>

                  <!-- Total -->
                  <div
                    class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700"
                  >
                    <span class="text-gray-800 dark:text-white font-medium">Total:</span>
                    <span class="text-indigo-600 dark:text-indigo-400 font-bold"
                      >${{ cartTotal.toFixed(2) }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Share Options -->
              <div
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 100 } },
                }"
                class="mb-6"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon
                    :icon="['fas', 'share-from-square']"
                    class="h-4 w-4 mr-2 text-indigo-500"
                  />
                  Opciones para Compartir
                </h3>

                <div class="grid grid-cols-1 gap-3">
                  <!-- WhatsApp -->
                  <button
                    class="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 transition-all duration-200 flex items-center justify-between group"
                    @click="shareViaWhatsApp"
                  >
                    <div class="flex items-center">
                      <div
                        class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors"
                      >
                        <FontAwesomeIcon
                          :icon="['fab', 'whatsapp']"
                          class="h-5 w-5 text-green-600 dark:text-green-400"
                        />
                      </div>
                      <span class="font-medium">WhatsApp</span>
                    </div>
                    <FontAwesomeIcon
                      :icon="['fas', 'angle-right']"
                      class="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors"
                    />
                  </button>

                  <!-- Email -->
                  <button
                    class="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 transition-all duration-200 flex items-center justify-between group"
                    @click="shareViaEmail"
                  >
                    <div class="flex items-center">
                      <div
                        class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors"
                      >
                        <FontAwesomeIcon
                          :icon="['fas', 'envelope']"
                          class="h-5 w-5 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <span class="font-medium">Correo Electrónico</span>
                    </div>
                    <FontAwesomeIcon
                      :icon="['fas', 'angle-right']"
                      class="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors"
                    />
                  </button>

                  <!-- Copy Link -->
                  <button
                    class="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 transition-all duration-200 flex items-center justify-between group"
                    @click="copyCartLink"
                  >
                    <div class="flex items-center">
                      <div
                        class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center mr-3 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors"
                      >
                        <FontAwesomeIcon
                          :icon="['fas', 'link']"
                          class="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                        />
                      </div>
                      <span class="font-medium">Copiar Enlace</span>
                    </div>
                    <FontAwesomeIcon
                      :icon="['fas', 'angle-right']"
                      class="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors"
                    />
                  </button>
                </div>
              </div>

              <!-- Additional Options -->
              <div
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 150 } },
                }"
                class="mb-2"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon :icon="['fas', 'gear']" class="h-4 w-4 mr-2 text-indigo-500" />
                  Opciones Adicionales
                </h3>

                <div class="space-y-3">
                  <div class="flex items-center">
                    <input
                      id="include-price"
                      v-model="includePrices"
                      type="checkbox"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                    />
                    <label
                      for="include-price"
                      class="ml-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      Incluir precios en el mensaje
                    </label>
                  </div>

                  <div class="flex items-center">
                    <input
                      id="include-images"
                      v-model="includeImages"
                      type="checkbox"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                    />
                    <label
                      for="include-images"
                      class="ml-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      Incluir imágenes de productos
                    </label>
                  </div>

                  <div>
                    <label
                      for="custom-message"
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Mensaje personalizado (opcional)
                    </label>
                    <textarea
                      id="custom-message"
                      v-model="customMessage"
                      rows="3"
                      class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: Hola, te comparto mi carrito de compras..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div
              class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end"
            >
              <button
                class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                @click="closeModal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
