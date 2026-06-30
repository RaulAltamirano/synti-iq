<script lang="ts" src="./CardHome.ts" />

<template>
  <div
    ref="motionElement"
    class="group relative cursor-pointer rounded-xl overflow-hidden"
    :class="isDark ? 'bg-gray-900/20' : 'bg-white shadow-lg'"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Fondo de vidrio esmerilado -->
    <div class="absolute inset-0 backdrop-blur-md bg-white/10 dark:bg-gray-900/10"></div>

    <!-- Contenido -->
    <div class="p-6 relative z-10">
      <!-- Icono con animación de flotación -->
      <div
        ref="iconElement"
        class="w-16 h-16 mx-auto rounded-xl flex items-center justify-center"
        :class="[iconBg]"
      >
        <font-awesome-icon :icon="icon" class="text-2xl text-white" />
      </div>

      <!-- Título con gradiente dinámico -->
      <h2
        ref="titleElement"
        class="mt-4 text-xl font-bold text-center"
        :class="isDark ? 'text-white' : 'text-gray-800'"
      >
        {{ title }}
      </h2>

      <!-- Descripción -->
      <p
        ref="descriptionElement"
        class="mt-2 text-sm text-center transition-colors duration-300"
        :class="isDark ? 'text-gray-400' : 'text-gray-600'"
      >
        {{ description }}
      </p>
    </div>

    <!-- Efecto de hover con degradado -->
    <div
      ref="hoverElement"
      class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
      :class="
        isDark
          ? 'bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent'
          : 'bg-gradient-to-br from-primary/5 via-blue-400/5 to-transparent'
      "
    ></div>
  </div>
</template>
