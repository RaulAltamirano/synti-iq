<script lang="ts" src="./SalesView.ts" />

<template>
  <StatsCheckoutBox />

  <!-- Contenedor principal mejor estructurado -->
  <div class="relative">
    <!-- Contenedor relativo para el botón flotante -->
    <div
      class="rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
    >
      <!-- Header -->
      <HeaderCar />

      <!-- Vista de ventas -->
      <template v-if="currentView === 'sales'">
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Contenedor izquierdo (tabla de productos) -->
          <div class="lg:flex-1">
            <!-- Búsqueda y escáner -->
            <div class="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct class="flex-1" />
              <button
                class="h-12 px-4 rounded-lg flex items-center justify-center bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors"
                aria-label="Abrir escáner de productos"
                @click="openScanner"
              >
                <font-awesome-icon icon="barcode" class="mr-2" />
                <span class="hidden sm:inline">Escanear</span>
              </button>
            </div>

            <!-- Tabla de productos con contenedor scrollable -->
            <section
              v-motion="{
                initial: { opacity: 0, y: 20 },
                enter: { opacity: 1, y: 0, transition: { duration: 500, ease: 'easeOut' } },
              }"
              class="border rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-all duration-300"
              aria-labelledby="cart-heading"
            >
              <h2 id="cart-heading" class="sr-only">Carrito de compras</h2>

              <!-- Área de contenido del carrito con scroll -->
              <div
                class="overflow-x-auto max-h-[calc(100vh-400px)] lg:max-h-[calc(100vh-250px)] transition-all duration-300"
                role="region"
                aria-label="Lista de productos en carrito"
                tabindex="0"
              >
                <!-- Tabla de productos -->
                <table v-if="currentCart && currentCart.length" class="min-w-full text-sm">
                  <caption class="sr-only">
                    Lista de productos en el carrito
                  </caption>
                  <thead class="sticky top-0 z-10">
                    <tr
                      class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/90 text-gray-900 dark:text-gray-100 shadow-sm"
                    >
                      <th scope="col" class="p-4 text-left font-medium">Producto</th>
                      <th scope="col" class="p-4 text-left font-medium">Cantidad</th>
                      <th scope="col" class="p-4 text-left font-medium">Precio</th>
                      <th scope="col" class="p-4 text-left font-medium">Total</th>
                      <th scope="col" class="p-4 text-left font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in currentCart"
                      :key="item.productId"
                      v-motion="{
                        initial: { opacity: 0, y: 10 },
                        enter: {
                          opacity: 1,
                          y: 0,
                          transition: { delay: 100 + index * 50, duration: 300 },
                        },
                      }"
                      class="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/70 text-gray-800 dark:text-gray-200 transition-colors duration-200"
                    >
                      <!-- Producto -->
                      <td class="p-4">
                        <div class="flex items-center space-x-3">
                          <div
                            class="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                          >
                            <FontAwesomeIcon
                              icon="box"
                              class="text-gray-400 dark:text-gray-500"
                              aria-hidden="true"
                            />
                          </div>
                          <span class="font-medium truncate max-w-[200px]">{{
                            item.name || 'Producto sin nombre'
                          }}</span>
                        </div>
                      </td>

                      <!-- Cantidad -->
                      <td class="p-4">
                        <div class="flex items-center gap-2">
                          <button
                            :disabled="item.quantity <= 1"
                            class="p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                            aria-label="Reducir cantidad de producto"
                            @click="decreaseQuantity(item)"
                          >
                            <FontAwesomeIcon
                              icon="minus"
                              class="text-gray-600 dark:text-gray-400"
                              aria-hidden="true"
                            />
                            <span class="sr-only">Reducir cantidad</span>
                          </button>
                          <span class="min-w-[30px] text-center font-medium" aria-live="polite">
                            {{ item.quantity }}
                          </span>
                          <button
                            class="p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                            aria-label="Aumentar cantidad de producto"
                            @click="increaseQuantity(item)"
                          >
                            <FontAwesomeIcon
                              icon="plus"
                              class="text-gray-600 dark:text-gray-400"
                              aria-hidden="true"
                            />
                            <span class="sr-only">Aumentar cantidad</span>
                          </button>
                        </div>
                      </td>

                      <!-- Precio -->
                      <td class="p-4">
                        <div class="font-medium text-gray-800 dark:text-gray-200">
                          {{ item.price ? `$${parseFloat(item.price).toFixed(2)}` : 'N/A' }}
                        </div>
                      </td>

                      <!-- Total -->
                      <td class="p-4">
                        <div class="font-semibold text-blue-700 dark:text-blue-400">
                          {{
                            item.price
                              ? `$${(parseFloat(item.price) * item.quantity).toFixed(2)}`
                              : 'N/A'
                          }}
                        </div>
                      </td>

                      <!-- Acciones -->
                      <td class="p-4">
                        <div class="flex gap-2">
                          <button
                            class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                            aria-label="Aplicar descuento"
                            @click="applyDiscount(item)"
                          >
                            <FontAwesomeIcon icon="percent" aria-hidden="true" />
                          </button>
                          <button
                            class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                            aria-label="Eliminar producto"
                            @click="removeItem(item)"
                          >
                            <FontAwesomeIcon icon="trash" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Estado vacío con animación -->
                <div
                  v-else
                  v-motion="{
                    initial: { opacity: 0, scale: 0.95 },
                    enter: { opacity: 1, scale: 1, transition: { duration: 500, ease: 'easeOut' } },
                  }"
                  class="py-16 px-4 text-center"
                  aria-live="polite"
                >
                  <div class="relative">
                    <!-- Contenido del estado vacío -->
                    <div class="relative z-0">
                      <div
                        v-motion="{
                          initial: { y: 10, opacity: 0 },
                          enter: { y: 0, opacity: 1, transition: { delay: 300 } },
                        }"
                        class="mb-6 inline-flex p-4 rounded-full bg-blue-50 dark:bg-blue-900/20"
                      >
                        <FontAwesomeIcon
                          icon="shopping-cart"
                          class="text-4xl text-blue-500 dark:text-blue-400 opacity-80"
                          aria-hidden="true"
                        />
                      </div>
                      <h3
                        v-motion="{
                          initial: { y: 10, opacity: 0 },
                          enter: { y: 0, opacity: 1, transition: { delay: 400 } },
                        }"
                        class="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2"
                      >
                        Tu carrito está vacío
                      </h3>
                      <p
                        v-motion="{
                          initial: { y: 10, opacity: 0 },
                          enter: { y: 0, opacity: 1, transition: { delay: 500 } },
                        }"
                        class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto"
                      >
                        Añade productos a tu carrito para comenzar con tu compra
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botones de acción simplificados -->
              <div
                v-motion="{
                  initial: { opacity: 0 },
                  enter: { opacity: 1, transition: { delay: 300 } },
                }"
                class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50"
              >
                <button
                  class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Abrir ventana de recarga"
                  @click="openReloadModal"
                >
                  <FontAwesomeIcon icon="phone" class="text-blue-100" aria-hidden="true" />
                  Recargas
                </button>
                <button
                  class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Abrir ventana de servicios"
                  @click="openServiceShutdownModal"
                >
                  <FontAwesomeIcon icon="services" aria-hidden="true" />
                  Servicios
                </button>
              </div>
            </section>
          </div>

          <!-- Resumen en sidebar para desktop -->
          <div class="lg:w-80 lg:sticky lg:top-4 lg:self-start">
            <section
              class="border rounded-xl p-4 bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600"
            >
              <h2 class="text-lg font-semibold mb-4">Resumen de compra</h2>
              <div class="space-y-3">
                <p class="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${{ carTotal }}</span>
                </p>
                <p
                  v-if="cartDiscountTotal"
                  class="flex justify-between text-green-600 dark:text-green-400"
                >
                  <span>Descuento:</span>
                  <span>-${{ cartDiscountTotal }}</span>
                </p>
                <p
                  class="flex justify-between text-xl font-bold border-t pt-3 border-gray-200 dark:border-gray-600"
                >
                  <span>Total:</span>
                  <span>${{ carTotal }}</span>
                </p>

                <!-- Botón de pago para desktop -->
                <button
                  class="w-full mt-4 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  aria-label="Procesar pago"
                  @click="showPaymentOptions"
                >
                  <font-awesome-icon icon="cash-register" class="mr-2" />
                  Procesar Pago
                </button>
              </div>
            </section>
          </div>
        </div>
      </template>
    </div>

    <!-- Botón flotante de pago para mobile -->
    <button
      v-if="currentView === 'sales' && currentCart && currentCart.length"
      class="fixed bottom-6 right-6 lg:hidden z-50 px-6 py-3 rounded-full shadow-lg bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      aria-label="Procesar pago"
      @click="showPaymentOptions"
    >
      <font-awesome-icon icon="cash-register" class="mr-2" />
      <span class="font-medium">Pagar</span>
      <span class="ml-2 font-bold">${{ carTotal }}</span>
    </button>
  </div>
  <PaymentModalDetails
    :visible="showModal"
    :subtotal="carTotal"
    :discount="cartDiscountTotal"
    @close="showModal = false"
    @pay="handlePayment"
  />
  <MobileRechargeModal />
  <ServicesModal />
</template>
