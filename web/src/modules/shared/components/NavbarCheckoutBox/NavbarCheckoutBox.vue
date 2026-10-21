<script lang="ts" src="./NavbarCheckoutBox.ts" />
<template>
  <div
    v-motion="sidebarMotion"
    class="flex h-full min-h-0 max-h-dvh flex-col justify-between bg-(--color-bg-elevated) text-(--color-text-primary) transition-colors duration-200"
  >
    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div class="shrink-0 p-4 lg:p-6">
        <div class="flex items-center justify-between gap-2">
          <div v-motion="logoMotion" class="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <img
              :src="isDark ? '/logo-white.svg' : '/logo.svg'"
              alt="Synti IQ"
              class="h-7 w-auto shrink-0 sm:h-8"
              width="120"
              height="32"
            />
            <div class="flex min-w-0 flex-col">
              <h2 class="truncate text-base font-semibold tracking-tight sm:text-lg">Caja</h2>
              <span class="truncate text-xs text-(--color-text-secondary)">Punto de venta</span>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-(--color-text-secondary) transition-colors duration-200 hover:bg-(--color-bg-overlay) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg-elevated) lg:hidden"
              aria-label="Cerrar menú"
              @click="requestCloseNav"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Cambiar tema"
              class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-(--color-text-secondary) transition-colors duration-200 hover:bg-(--color-bg-overlay) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg-elevated)"
              @click="toggleTheme"
            >
              <font-awesome-icon
                :icon="['fas', isDark ? 'sun' : 'moon']"
                class="h-5 w-5 text-warning dark:text-warning-400"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
      <div class="mx-4 mb-3 h-px shrink-0 bg-(--color-border-default)" role="separator" />
      <nav
        class="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-y-contain px-4 pb-2 [-webkit-overflow-scrolling:touch]"
        aria-label="Navegación de caja"
      >
        <button
          v-for="(menu, index) in menuItems"
          :key="menu.id"
          v-motion="{
            initial: { opacity: 0, x: -20 },
            enter: {
              opacity: 1,
              x: 0,
              transition: { delay: navStaggerDelay(index) },
            },
          }"
          type="button"
          class="group flex w-full min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg-elevated) sm:py-3 sm:text-base"
          :class="[
            currentView === menu.id
              ? 'bg-primary-50 text-primary dark:bg-primary-950/40 dark:text-primary-300'
              : 'text-(--color-text-secondary) hover:bg-(--color-bg-overlay) hover:text-(--color-text-primary)',
          ]"
          @click="goTo(menu.id)"
        >
          <div class="relative shrink-0">
            <font-awesome-icon
              :icon="menu.icon"
              class="h-5 w-5 transition-colors duration-200"
              aria-hidden="true"
            />
            <div
              v-if="currentView === menu.id"
              v-motion="{
                initial: { scaleX: 0 },
                enter: { scaleX: 1 },
              }"
              class="absolute -bottom-2 -left-2 -right-2 h-0.5 origin-left rounded-full bg-primary"
            />
          </div>
          <span class="min-w-0 flex-1 truncate font-medium">{{ menu.label }}</span>
        </button>
      </nav>
    </div>
    <div
      v-motion="{
        initial: { opacity: 0, y: 20 },
        enter: { opacity: 1, y: 0, transition: { delay: 0.3 } },
      }"
      class="shrink-0 border-t border-(--color-border-default) p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:p-4"
    >
      <div class="mb-3 flex items-center gap-3 rounded-lg bg-(--color-bg-overlay) p-3">
        <Avatar :name="displayName" :color-seed="avatarSeed" size="md" class="shrink-0" />
        <div class="flex min-w-0 flex-1 flex-col">
          <span class="block truncate font-medium text-(--color-text-primary)">{{
            displayName
          }}</span>
          <span class="block truncate text-xs text-(--color-text-secondary)">{{ roleLabel }}</span>
        </div>
      </div>
      <button
        type="button"
        class="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error transition-colors duration-200 hover:bg-error-50 dark:hover:bg-error-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg-elevated) sm:text-base"
        @click="closeCashDrawer"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <font-awesome-icon
          :icon="['fas', 'power-off']"
          class="h-5 w-5 shrink-0 transition-transform duration-200"
          :class="{ 'rotate-12': isHovered }"
          aria-hidden="true"
        />
        <span>Cerrar caja</span>
      </button>
    </div>
  </div>
  <CashClosingModal :shift-data="currentShift" :user-data="cashClosingUser" />
</template>
