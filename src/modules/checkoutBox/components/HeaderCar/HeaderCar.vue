<script lang="ts" src="./HeaderCar.ts" />

<template>
  <section
    v-motion="{
      initial: { opacity: 0, y: -20 },
      enter: {
        opacity: 1,
        y: 0,
        transition: { duration: 300 },
      },
    }"
    class="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
  >
    <!-- Carts container -->
    <div class="flex flex-wrap gap-2 w-full md:w-auto" role="list" aria-label="Carritos de compra">
      <CartItemHeader
        v-for="(cart, index) in carts"
        :key="cart.id"
        :cart="cart"
        :index="index"
        :is-current="currentCartIndex === index"
        :can-delete="carts.length > 1"
        @drag-start="onDragStart"
        @drag-over="onDragOver"
        @drag-end="onDragEnd"
        @drop="onDrop"
      />

      <!-- Add new cart -->
      <button
        v-motion="{
          initial: { scale: 0.95 },
          hover: { scale: 1.05 },
          transition: { type: 'spring', stiffness: 300 },
        }"
        class="btn-primary flex items-center px-3 py-2 rounded-lg transition-colors duration-200"
        :class="
          isDark
            ? 'bg-green-800 hover:bg-green-700 text-white'
            : 'bg-green-600 hover:bg-green-500 text-white'
        "
        aria-label="Crear nuevo carrito"
        @click="cartStore.addNewCart"
      >
        <font-awesome-icon icon="plus" class="mr-2" />
        <span>Nuevo Carrito</span>
      </button>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-2 w-full md:w-auto justify-end">
      <button
        class="btn-secondary flex items-center px-3 py-2 rounded-lg transition-colors duration-200"
        :class="
          isDark
            ? cartStore.isPriceCheckerActive
              ? 'bg-amber-700 hover:bg-amber-600 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
            : cartStore.isPriceCheckerActive
              ? 'bg-amber-500 hover:bg-amber-400 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        "
        aria-label="Verificar precio de producto"
        :aria-pressed="cartStore.isPriceCheckerActive"
        @click="cartStore.togglePriceChecker"
      >
        <font-awesome-icon icon="tag" class="mr-2" /> Verificar Precio
      </button>
      <button
        class="btn-secondary flex items-center px-3 py-2 rounded-lg transition-colors duration-200"
        :class="
          isDark
            ? 'bg-indigo-800 hover:bg-indigo-700 text-white'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
        "
        aria-label="Compartir carrito actual"
        @click="openShareModal"
      >
        <font-awesome-icon icon="share-alt" class="mr-2" /> Compartir
      </button>
    </div>
  </section>
  <!-- Price checker modal -->
  <!-- <PriceCheckerModal 
    v-if="showPriceChecker"
    :selected-product="selectedProduct"
    @close="cartStore.togglePriceChecker"
  /> -->
  <ShareCartModal :cart-items="currentCartItems" />
</template>
