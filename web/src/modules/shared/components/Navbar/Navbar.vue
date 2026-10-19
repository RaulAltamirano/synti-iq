<script lang="ts" src="./Navbar.ts" />

<template>
  <nav
    class="fixed top-0 z-50 w-full border-b border-gray-200/60 bg-white/75 backdrop-blur-md transition-colors duration-300 dark:border-gray-700/60 dark:bg-gray-950/75"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <RouterLink
          :to="{ name: 'Home' }"
          class="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 rounded-lg"
        >
          <div
            class="relative w-8 h-8 shrink-0 animate-logo-float transition-all duration-300 group-hover:scale-110"
          >
            <Logo :dark="isDark" class="w-full h-full object-contain" />
            <div
              class="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 blur-xl transition-opacity duration-300 group-hover:opacity-100 opacity-0"
              aria-hidden="true"
            />
          </div>
          <span
            :class="[
              'text-xl font-semibold transition-colors duration-300 hidden sm:inline',
              isDark ? 'text-white hover:text-primary' : 'text-gray-900 hover:text-primary',
            ]"
          >
            SyntiIQ
          </span>
        </RouterLink>

        <div class="flex items-center gap-2 sm:gap-4">
          <div ref="notificationPanelRef" class="relative">
            <button
              type="button"
              class="relative flex items-center justify-center min-w-11 min-h-11 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              :class="
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
              "
              aria-label="Notifications"
              @click.stop="toggleNotifications"
            >
              <FontAwesomeIcon
                icon="bell"
                :class="[
                  'text-xl transition-colors',
                  { 'animate-notification-ring': notificationStore.hasNewNotifications },
                ]"
              />
              <span
                v-if="notificationStore.notificationCount > 0"
                class="absolute top-0.5 right-0.5 bg-primary text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center animate-pulse"
              >
                {{ notificationStore.notificationCount }}
              </span>
            </button>

            <!-- Mobile backdrop -->
            <Transition
              enter-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-150"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-if="notificationStore.showNotificationPanel"
                class="fixed inset-0 bg-black/30 z-55 sm:hidden"
                aria-hidden="true"
                @click="notificationStore.closeNotificationPanel"
              />
            </Transition>

            <!-- Notification panel -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-1 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 translate-y-1 scale-95"
            >
              <div
                v-if="notificationStore.showNotificationPanel"
                class="fixed inset-x-4 top-18 max-h-[calc(100vh-6rem)] min-w-0 sm:absolute sm:inset-auto sm:right-0 sm:left-auto sm:top-auto sm:mt-2 sm:w-80 sm:max-h-[360px] origin-top-right rounded-xl overflow-hidden shadow-lg flex flex-col z-60"
                :class="
                  isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
                "
                role="menu"
              >
                <div
                  class="px-4 py-3 border-b flex items-center justify-between shrink-0"
                  :class="isDark ? 'border-gray-700' : 'border-gray-200'"
                >
                  <span
                    class="text-sm font-semibold"
                    :class="isDark ? 'text-white' : 'text-gray-900'"
                  >
                    Notifications
                  </span>
                  <button
                    v-if="notificationStore.notificationCount > 0"
                    type="button"
                    class="text-xs text-primary hover:underline py-2 px-2 -mr-2 rounded min-h-[44px] sm:min-h-0 sm:py-0 sm:px-0 flex items-center"
                    @click="notificationStore.markAllAsRead"
                  >
                    Mark all read
                  </button>
                </div>
                <div
                  class="flex-1 min-h-0 overflow-y-auto overscroll-contain"
                  style="-webkit-overflow-scrolling: touch"
                >
                  <div
                    v-if="notificationStore.notifications.length === 0"
                    class="px-4 py-8 text-center text-sm"
                    :class="isDark ? 'text-gray-500' : 'text-gray-400'"
                  >
                    No notifications yet
                  </div>
                  <button
                    v-for="n in notificationStore.notifications"
                    :key="n.id"
                    type="button"
                    class="w-full px-4 py-3 text-left flex gap-3 transition-colors border-b last:border-b-0"
                    :class="[
                      isDark
                        ? 'border-gray-700 hover:bg-gray-800'
                        : 'border-gray-200 hover:bg-gray-50',
                      !n.read && (isDark ? 'bg-gray-800/50' : 'bg-primary/5'),
                    ]"
                    @click="notificationStore.markAsRead(n.id)"
                  >
                    <div
                      class="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                      :class="
                        n.type === 'referral' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20'
                      "
                    >
                      <FontAwesomeIcon :icon="['fas', 'user-plus']" class="text-sm" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-medium truncate"
                        :class="isDark ? 'text-gray-200' : 'text-gray-800'"
                      >
                        {{ n.title }}
                      </p>
                      <p
                        class="text-xs truncate mt-0.5"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                      >
                        {{ n.message }}
                      </p>
                      <p class="text-xs mt-1" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                        {{ n.time }}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <RouterLink
            :to="{ name: 'Cart' }"
            class="relative flex items-center justify-center min-w-11 min-h-11 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            :class="isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'"
            aria-label="Cart"
          >
            <FontAwesomeIcon
              icon="shopping-bag"
              :class="['text-xl transition-colors', { 'animate-cart-bounce': cartAnimation }]"
            />
            <span
              v-if="cartCount > 0"
              class="absolute top-0.5 right-0.5 bg-primary text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center"
            >
              {{ cartCount }}
            </span>
          </RouterLink>

          <div ref="dropdownRef" class="relative">
            <button
              type="button"
              class="flex items-center gap-2 sm:gap-3 min-h-11 rounded-lg px-1 sm:px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 group"
              :aria-expanded="showDropdown"
              aria-haspopup="true"
              aria-label="User menu"
              @click.stop="toggleDropdown"
            >
              <div class="relative shrink-0">
                <Avatar
                  :name="userName"
                  :color-seed="userId"
                  size="md"
                  class="transition-transform duration-300 group-hover:scale-105 ring-2"
                  :class="isDark ? 'ring-gray-700' : 'ring-gray-200'"
                />
              </div>
              <div class="hidden sm:block text-left">
                <p
                  class="text-sm font-medium truncate max-w-[120px]"
                  :class="isDark ? 'text-white' : 'text-gray-900'"
                >
                  {{ userName }}
                </p>
              </div>
              <FontAwesomeIcon
                icon="chevron-down"
                class="hidden sm:block text-xs transition-transform duration-200"
                :class="[
                  isDark ? 'text-gray-400' : 'text-gray-500',
                  showDropdown ? 'rotate-180' : '',
                ]"
              />
            </button>

            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-1 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 translate-y-1 scale-95"
            >
              <div
                v-if="showDropdown"
                class="absolute right-0 mt-3 w-72 origin-top-right rounded-xl overflow-hidden transform shadow-lg"
                :class="
                  isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
                "
                role="menu"
                aria-orientation="vertical"
              >
                <div class="p-4 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
                  <div class="flex items-center space-x-3">
                    <div class="relative shrink-0">
                      <Avatar :name="userName" :color-seed="userId" size="lg" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-base font-semibold truncate"
                        :class="isDark ? 'text-white' : 'text-gray-900'"
                      >
                        {{ userName }}
                      </p>
                      <p
                        class="text-sm truncate"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                      >
                        {{ userEmail }}
                      </p>
                      <div v-if="userRole" class="mt-1">
                        <RoleIcon
                          :role="userRole"
                          size="sm"
                          :show-label="true"
                          class="inline-flex"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="py-1">
                  <div class="px-4 py-3">
                    <div class="flex items-center justify-between">
                      <span class="text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                        Theme
                      </span>
                      <button
                        class="relative rounded-full w-12 h-6 transition-colors duration-300 focus:outline-none"
                        :class="isDark ? 'bg-primary' : 'bg-gray-200'"
                        @click="changeTheme"
                      >
                        <span
                          class="absolute inset-y-0 left-0 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 [&>svg]:block"
                          :class="isDark ? 'translate-x-6' : 'translate-x-0'"
                        >
                          <FontAwesomeIcon
                            :icon="isDark ? faMoon : faSun"
                            class="h-3.5 w-3.5"
                            :class="isDark ? 'text-indigo-600!' : 'text-amber-500!'"
                            aria-hidden="true"
                          />
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    v-for="(item, index) in menuItems"
                    :key="index"
                    class="flex items-center w-full px-4 py-2 text-sm transition-colors duration-200"
                    :class="[
                      isDark
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-700 hover:bg-gray-100',
                      item.danger && 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
                    ]"
                    @click="item.action"
                  >
                    <FontAwesomeIcon :icon="item.icon" class="w-4 h-4 mr-3" />
                    {{ item.label }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
@keyframes logo-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes notification-ring {
  0% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(15deg);
  }
  100% {
    transform: rotate(-15deg);
  }
}

@keyframes cart-bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.animate-notification-ring {
  animation: notification-ring 0.5s ease-in-out;
}

.animate-cart-bounce {
  animation: cart-bounce 0.5s ease-in-out;
}
</style>
