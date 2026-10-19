<script lang="ts" src="./StatCardCloseCheckout.ts" />
<template>
  <div
    v-motion="{
      initial: { opacity: 0, scale: 0.95 },
      enter: {
        opacity: 1,
        scale: 1,
        transition: { duration: 200 },
      },
    }"
    class="relative overflow-hidden rounded-lg border transition-all duration-200"
    :class="[
      isDark
        ? 'border-gray-700 bg-gray-700 hover:bg-gray-600'
        : 'border-gray-200 bg-gray-50 hover:bg-gray-100',
    ]"
  >
    <!-- Contenido principal -->
    <div class="p-4">
      <!-- Título -->
      <h4
        class="text-sm font-medium truncate"
        :class="[isDark ? 'text-gray-300' : 'text-gray-500']"
      >
        {{ title }}
      </h4>

      <!-- Valor -->
      <p
        class="mt-2 text-2xl font-bold tracking-tight"
        :class="[colorVariants[color] || 'text-current', { 'animate-pulse': loading }]"
      >
        {{ loading ? placeholder : value }}
      </p>

      <!-- Subtexto (opcional) -->
      <p v-if="subtitle" class="mt-1 text-sm" :class="[isDark ? 'text-gray-400' : 'text-gray-600']">
        {{ subtitle }}
      </p>
    </div>

    <!-- Indicador de cambio (opcional) -->
    <div
      v-if="showTrend && trend"
      class="absolute top-4 right-4 flex items-center gap-1 text-sm font-medium"
      :class="[trend > 0 ? 'text-green-500' : 'text-red-500']"
    >
      <!-- Ícono de flecha -->
      <svg
        class="w-4 h-4"
        :class="{ 'rotate-180': trend < 0 }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
      <!-- Porcentaje de cambio -->
      <span>{{ Math.abs(trend) }}%</span>
    </div>
  </div>
</template>
