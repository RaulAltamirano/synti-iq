<script lang="ts" src="./Cart.ts" />

<template>
  <div class="min-h-screen p-16">
    <div class="max-w-6xl mx-auto">
      <!-- Header Tabs -->
      <div class="bg-white rounded-lg shadow-md mb-6 p-4">
        <div class="flex space-x-4">
          <button
            :class="[
              'px-6 py-3 rounded-lg font-semibold transition-all duration-300',
              activeTab === 'cart'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-blue-50',
            ]"
            @click="activeTab = 'cart'"
          >
            <font-awesome-icon icon="shopping-cart" class="mr-2" />
            Carrito ({{ cartItems.length }})
          </button>
          <button
            :class="[
              'px-6 py-3 rounded-lg font-semibold transition-all duration-300',
              activeTab === 'wishlist'
                ? 'bg-pink-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-pink-50',
            ]"
            @click="activeTab = 'wishlist'"
          >
            <font-awesome-icon icon="heart" class="mr-2" />
            Lista de Deseos ({{ wishlistItems.length }})
          </button>
        </div>
      </div>

      <!-- Cart Section -->
      <div v-if="activeTab === 'cart'" class="space-y-4">
        <!-- Cart Items -->
        <div v-if="cartItems.length > 0" class="bg-white rounded-lg shadow-md p-6">
          <div class="space-y-4">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow duration-300"
            >
              <div class="flex items-center space-x-4">
                <div class="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 class="font-semibold text-lg text-gray-800">{{ item.name }}</h3>
                  <p class="text-gray-600">{{ item.description }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="flex items-center bg-gray-100 rounded-lg">
                  <button
                    class="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-l-lg transition-colors"
                    @click="decreaseQuantity(item)"
                  >
                    <font-awesome-icon icon="minus" />
                  </button>
                  <span class="px-4 py-1 font-semibold">{{ item.quantity }}</span>
                  <button
                    class="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-r-lg transition-colors"
                    @click="increaseQuantity(item)"
                  >
                    <font-awesome-icon icon="plus" />
                  </button>
                </div>
                <span class="font-semibold text-lg text-blue-600"
                  >${{ (item.price * item.quantity).toFixed(2) }}</span
                >
                <button
                  class="text-red-500 hover:text-red-600 transition-colors"
                  @click="removeFromCart(item)"
                >
                  <font-awesome-icon icon="trash-alt" />
                </button>
              </div>
            </div>
          </div>

          <!-- Cart Summary -->
          <div class="mt-6 border-t pt-6">
            <div class="flex justify-between items-center">
              <div class="space-y-2">
                <p class="text-gray-600">
                  Subtotal: <span class="font-semibold">${{ calculateSubtotal() }}</span>
                </p>
                <p class="text-gray-600">
                  IVA (16%): <span class="font-semibold">${{ calculateTax() }}</span>
                </p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-blue-600">Total: ${{ calculateTotal() }}</p>
                <button
                  class="mt-4 bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  <font-awesome-icon icon="credit-card" class="mr-2" />
                  Proceder al Pago
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Cart State -->
        <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
          <div class="text-gray-400 text-6xl mb-4">
            <font-awesome-icon icon="shopping-cart" />
          </div>
          <h3 class="text-xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h3>
          <p class="text-gray-500 mb-6">¡Agrega algunos productos para comenzar!</p>
          <button
            class="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            @click="$router.push('/productos')"
          >
            <font-awesome-icon icon="shopping-bag" class="mr-2" />
            Ir a Productos
          </button>
        </div>
      </div>

      <!-- Wishlist Section -->
      <div v-if="activeTab === 'wishlist'" class="space-y-4">
        <!-- Wishlist Items -->
        <div
          v-if="wishlistItems.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            v-for="item in wishlistItems"
            :key="item.id"
            class="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300"
          >
            <div class="relative">
              <img :src="item.image" :alt="item.name" class="w-full h-48 object-cover" />
              <div class="absolute top-2 right-2 space-x-2">
                <button
                  class="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                  @click="addToCart(item)"
                >
                  <font-awesome-icon icon="shopping-cart" />
                </button>
                <button
                  class="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  @click="removeFromWishlist(item)"
                >
                  <font-awesome-icon icon="trash-alt" />
                </button>
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-lg text-gray-800 mb-2">{{ item.name }}</h3>
              <p class="text-gray-600 text-sm mb-4">{{ item.description }}</p>
              <div class="flex justify-between items-center">
                <span class="font-bold text-blue-600">${{ item.price.toFixed(2) }}</span>
                <span class="text-sm text-gray-500">Agregado {{ item.addedDate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Wishlist State -->
        <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
          <div class="text-gray-400 text-6xl mb-4">
            <font-awesome-icon icon="heart" />
          </div>
          <h3 class="text-xl font-semibold text-gray-600 mb-2">Tu lista de deseos está vacía</h3>
          <p class="text-gray-500 mb-6">¡Guarda tus productos favoritos aquí!</p>
          <button
            class="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            @click="$router.push('/productos')"
          >
            <font-awesome-icon icon="shopping-bag" class="mr-2" />
            Explorar Productos
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
