<script lang="ts" src="./UserDashboard.ts" />
<template>
  <div class="flex justify-center items-center min-h-screen transition-colors duration-300">
    <div
      class="flex flex-col p-6 max-w-6xl w-full space-y-6 relative rounded-xl"
      :class="[isDark ? 'bg-gray-900/40 text-white' : 'bg-white/80 text-gray-800 shadow-lg']"
    >
      <div class="relative z-10">
        <TitleCard name="Dashboard" />

        <!-- User Info -->
        <div class="flex items-center gap-6 mb-6">
          <div
            class="w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center"
            :class="[
              isDark
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500',
            ]"
          >
            <span class="text-3xl font-bold text-white">{{ user.name.charAt(0) }}</span>
          </div>
          <div>
            <h2
              class="text-3xl font-bold"
              :class="[
                isDark
                  ? 'text-white'
                  : 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600',
              ]"
            >
              {{ user.name }}
            </h2>
            <p :class="[isDark ? 'text-gray-300' : 'text-gray-600']">{{ user.email }}</p>
            <div class="mt-3 flex gap-3">
              <span
                class="px-4 py-1.5 text-sm rounded-xl"
                :class="[
                  isDark
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800',
                ]"
              >
                {{ user.role }}
              </span>
              <span
                class="px-4 py-1.5 text-sm rounded-xl"
                :class="[
                  isDark
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800',
                ]"
              >
                Miembro desde {{ formatDate(user.joinDate) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div
          class="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b"
          :class="isDark ? 'border-gray-700' : 'border-gray-200'"
        >
          <div
            v-for="stat in stats"
            :key="stat.title"
            class="p-4 rounded-lg transition-all duration-300 hover:scale-105"
            :class="isDark ? 'bg-gray-700' : 'bg-gray-50'"
          >
            <div class="flex items-center gap-3">
              <font-awesome-icon :icon="stat.icon" :class="[stat.color, 'text-xl']" />
              <div>
                <p class="text-sm opacity-70">{{ stat.title }}</p>
                <p class="text-2xl font-bold">{{ stat.value }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="relative">
            <font-awesome-icon
              icon="search"
              class="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
            />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar actividad..."
              class="w-full pl-10 pr-4 py-2 rounded-lg transition-colors duration-300"
              :class="isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'"
            />
          </div>
          <select
            v-model="filterType"
            class="px-4 py-2 rounded-lg transition-colors duration-300"
            :class="isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'"
          >
            <option value="all">Todas las actividades</option>
            <option value="purchase">Compras</option>
            <option value="review">Reseñas</option>
          </select>
        </div>

        <!-- Lista de Actividades -->
        <div class="p-6">
          <TransitionGroup name="list" tag="div" class="space-y-4">
            <div
              v-for="activity in filteredActivities"
              :key="activity.id"
              class="group rounded-xl p-4 flex items-center justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
              :class="
                isDark
                  ? 'bg-gray-700/50 hover:bg-gray-700'
                  : 'bg-white hover:border-blue-300 border border-gray-200'
              "
            >
              <div class="flex items-center gap-4">
                <div class="p-3 rounded-lg" :class="[getActivityColor(activity.type, isDark)]">
                  <font-awesome-icon
                    :icon="getActivityIcon(activity.type)"
                    class="text-white text-xl"
                  />
                </div>
                <div>
                  <h4 class="font-semibold text-lg">{{ activity.title }}</h4>
                  <p class="opacity-70">{{ formatDate(activity.date) }}</p>
                  <p class="mt-1">{{ activity.description }}</p>
                </div>
              </div>

              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  class="action-button"
                  :class="isDark ? 'hover:bg-gray-600' : 'hover:bg-blue-100'"
                  @click="viewDetails(activity)"
                >
                  <font-awesome-icon icon="eye" />
                </button>
                <button
                  v-if="activity.type === 'purchase'"
                  class="action-button"
                  :class="isDark ? 'hover:bg-gray-600' : 'hover:bg-green-100'"
                  @click="generateInvoice(activity)"
                >
                  <font-awesome-icon icon="file" />
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-enter-active,
.stats-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-enter-from,
.stats-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.9);
}

.list-move {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
