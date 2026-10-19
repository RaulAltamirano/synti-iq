<script lang="ts" src="./CheckoutBoxLayout.ts" />

<template>
  <div
    class="min-h-screen w-full transition-colors duration-300"
    :class="isDark ? 'bg-gray-900' : 'bg-gray-100'"
  >
    <!-- Fondo al abrir menú (solo móvil) -->
    <button
      v-show="sidebarOpen"
      type="button"
      class="fixed inset-0 z-40 cursor-default bg-gray-950/55 backdrop-blur-sm transition-opacity lg:pointer-events-none lg:hidden lg:opacity-0"
      aria-label="Cerrar menú"
      @click="closeSidebar"
    />

    <div class="flex">
      <aside
        id="checkout-nav-drawer"
        class="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] max-w-full flex-col border-r transition-transform duration-200 ease-out lg:z-20 lg:w-64 lg:translate-x-0"
        :class="[
          sidebarOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full',
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white',
        ]"
      >
        <NavbarCheckoutBox @request-close="closeSidebar" />
      </aside>

      <main
        class="flex min-h-screen min-h-dvh flex-1 flex-col transition-all duration-200 lg:ml-64"
        :class="isDark ? 'bg-gray-900' : 'bg-gray-100'"
      >
        <header
          class="sticky top-0 z-30 flex min-h-14 shrink-0 items-center gap-3 border-b px-3 pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-2 lg:hidden"
          :class="
            isDark
              ? 'border-gray-700 bg-gray-900/95 backdrop-blur-md'
              : 'border-gray-200 bg-white/95 backdrop-blur-md'
          "
        >
          <button
            type="button"
            class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-[var(--color-text-primary)] transition-colors duration-200 hover:bg-[var(--color-bg-overlay)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :aria-expanded="sidebarOpen"
            aria-controls="checkout-nav-drawer"
            aria-label="Abrir o cerrar menú de navegación"
            @click="toggleSidebar"
          >
            <font-awesome-icon
              :icon="['fas', sidebarOpen ? 'xmark' : 'bars']"
              class="h-6 w-6"
              aria-hidden="true"
            />
          </button>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-[var(--color-text-primary)]">Synti IQ</p>
            <p class="truncate text-xs text-[var(--color-text-secondary)]">Punto de venta</p>
          </div>
        </header>

        <div class="flex-1">
          <RouterView v-slot="{ Component }">
            <div
              class="h-full min-h-0 transition-colors duration-300 p-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:p-4"
              :class="isDark ? 'bg-gray-900' : 'bg-gray-100'"
            >
              <component :is="Component" />
            </div>
          </RouterView>
        </div>
      </main>
    </div>
  </div>
</template>
