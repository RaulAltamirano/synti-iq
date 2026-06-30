<script lang="ts" src="./CheckoutBox.ts" />

<template>
  <div
    class="flex min-h-screen bg-gray-50 transition-all duration-300"
    :class="{ 'bg-gray-900': isDark }"
  >
    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Header Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <!-- <StatCard v-for="stat in stats" :key="stat.id" :stat="stat" :isDark="isDark" /> -->
      </div>
      <div
        class="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b"
        :class="isDark ? 'border-gray-700' : 'border-gray-200'"
      >
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="p-4 rounded-lg transition-all duration-300 hover:scale-105"
          :class="isDark ? 'bg-gray-700' : 'bg-gray-50'"
        >
          <div class="flex items-center gap-3">
            <font-awesome-icon :icon="stat.icon" :class="[stat.color]" />
            <div>
              <p class="text-sm opacity-70">{{ stat.label }}</p>
              <p class="text-2xl font-bold">{{ stat.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div
        class="bg-white rounded-xl shadow-lg transition-all duration-300"
        :class="{ 'bg-gray-800': isDark }"
      >
        <!-- Sales View -->
        <div
          class="rounded-xl shadow-lg p-6 transition-all duration-300"
          :class="{ 'bg-white text-gray-900': !isDark, 'bg-gray-800 text-gray-100': isDark }"
        >
          <!-- Sales View -->
          <SalesView />
          <!-- Returns View -->
          <template v-if="currentView === 'returns'">
            <div class="p-4">
              <h3 class="text-xl font-bold mb-4">Process Returns</h3>
              <div class="space-y-4">
                <input
                  v-model="returnOrderId"
                  type="text"
                  placeholder="Enter Order ID"
                  class="w-full p-3 rounded-lg transition-colors duration-300"
                  :class="[isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100']"
                />
                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg" @click="searchOrder">
                  Search Order
                </button>
              </div>
            </div>
          </template>

          <!-- Cash Register View -->
          <template v-if="currentView === 'register'">
            <div class="p-4">
              <h3 class="text-xl font-bold mb-4">Cash Register Management</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-4">
                  <h4 class="font-semibold">Opening Balance</h4>
                  <input
                    v-model="openingBalance"
                    type="number"
                    class="w-full p-3 rounded-lg transition-colors duration-300"
                    :class="[isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100']"
                  />
                  <button class="px-4 py-2 bg-green-600 text-white rounded-lg" @click="startShift">
                    Start Shift
                  </button>
                </div>
                <div class="space-y-4">
                  <h4 class="font-semibold">Closing Balance</h4>
                  <input
                    v-model="closingBalance"
                    type="number"
                    class="w-full p-3 rounded-lg transition-colors duration-300"
                    :class="[isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100']"
                  />
                  <button class="px-4 py-2 bg-red-600 text-white rounded-lg" @click="endShift">
                    End Shift
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
