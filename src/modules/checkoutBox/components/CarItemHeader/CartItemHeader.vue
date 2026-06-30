<script lang="ts" src="./CartItemHeader.ts" />

<template>
  <div
    :class="containerClasses"
    draggable="true"
    :aria-grabbed="false"
    v-motion="{
      initial: { x: -10, opacity: 0 },
      enter: {
        x: 0,
        opacity: 1,
        transition: { duration: 200, delay: index * 50 },
      },
    }"
    aria-dropeffect="move"
    role="listitem"
    @dragstart="onDragStart"
    @dragover.prevent="onDragOver"
    @dragend="onDragEnd"
    @drop="onDrop"
    @contextmenu.prevent="handleRightClick(index)"
  >
    <!-- Dropdown menu -->
    <div class="relative">
      <div
        v-if="cart.showDropdown"
        v-motion="{
          initial: { opacity: 0, y: -5 },
          enter: { opacity: 1, y: 0, transition: { duration: 150 } },
        }"
        class="absolute left-0 z-20 mt-1 w-48 rounded-md shadow-lg py-1"
        :class="isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'"
        role="menu"
        @click="cartStore.switchCart(index)"
      >
        <button
          class="block w-full text-left px-4 py-2 text-sm"
          :class="isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'"
          @click.stop="cartStore.duplicateCart(index)"
        >
          <font-awesome-icon icon="copy" class="mr-3" /> Duplicar
        </button>
        <button
          class="block w-full text-left px-4 py-2 text-sm"
          :class="isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'"
          @click.stop="cartStore.clearCart(index)"
        >
          <font-awesome-icon icon="trash-alt" class="mr-3" /> Vaciar
        </button>
        <button
          class="block w-full text-left px-4 py-2 text-sm"
          :class="[
            isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100',
            !canDelete ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          :disabled="!canDelete"
          @click.stop="canDelete && cartStore.removeCart(index)"
        >
          <font-awesome-icon icon="trash" class="mr-3" /> Eliminar
        </button>
      </div>
    </div>

    <!-- Editable cart name -->
    <div class="relative flex-grow">
      <div
        v-if="!cart.isEditing"
        class="px-3 py-2 flex items-center min-h-[40px] cursor-pointer"
        :aria-label="`Editar nombre del carrito: ${cart.name}`"
        tabindex="0"
        @click="cartStore.switchCart(index)"
        @dblclick="startEditing(index)"
        @keydown.enter="startEditing(index)"
      >
        <font-awesome-icon :icon="getCartIcon(index)" class="mr-2 flex-shrink-0" />
        <span class="truncate max-w-[100px] select-none">{{ cart.name }}</span>
      </div>
      <input
        v-else
        ref="editInput"
        v-model="cart.name"
        class="w-full px-3 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="
          isDark
            ? 'bg-gray-800 text-white border-gray-700'
            : 'bg-white text-gray-800 border-gray-300'
        "
        aria-label="Editar nombre del carrito"
        @blur="finishEditing(index)"
        @keyup.enter="finishEditing(index)"
        @keyup.esc="cancelEditing(index)"
      />
    </div>

    <!-- Item count -->
    <button class="px-3 py-2" @click="cartStore.switchCart(index)">
      <span v-if="cart.itemCount" :class="countBadgeClasses">
        {{ cart.itemCount }}
      </span>
    </button>

    <!-- Remove button -->
    <button
      :class="removeButtonClasses"
      :disabled="!canDelete"
      aria-label="Eliminar carrito"
      @click.stop="canDelete && cartStore.removeCart(index)"
    >
      <font-awesome-icon icon="xmark" />
    </button>
  </div>
</template>
