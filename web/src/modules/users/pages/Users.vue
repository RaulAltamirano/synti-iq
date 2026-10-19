<script lang="ts" src="./Users.ts" />

<template>
  <div class="flex justify-center items-center min-h-screen transition-colors duration-300">
    <div
      class="flex flex-col p-6 max-w-6xl w-full space-y-6 relative rounded-xl"
      :class="[isDark ? 'bg-gray-900/40 text-white' : 'bg-white/80 text-gray-800 shadow-lg']"
    >
      <TitleCard title="Users" icon="user" :actions="[{ icon: 'add', click: addNewUser }]" />
      <!-- Stats Bar -->
      <div
        class="grid grid-cols-1 md:grid-cols-4 gap-4 p-1 border-b"
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

      <!-- Controles -->
      <div class="p-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <font-awesome-icon
            icon="search"
            class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
          />
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search users..."
            class="w-full pl-10 pr-4 py-2 rounded-lg transition-colors duration-300"
            :class="isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'"
          />
        </div>
        <select
          v-model="filters.role"
          class="px-4 py-2 rounded-lg transition-colors duration-300"
          :class="isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'"
        >
          <option value="">All Roles</option>
          <option v-for="role in roles" :key="role.value" :value="role.value">
            {{ role.label }}
          </option>
        </select>
        <select
          v-model="filters.status"
          class="px-4 py-2 rounded-lg transition-colors duration-300"
          :class="isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'"
        >
          <option value="">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="idle">Idle</option>
        </select>
      </div>

      <!-- Lista de Usuarios -->
      <div class="p-2">
        <TransitionGroup name="list" tag="div" class="space-y-4">
          <div
            v-for="user in paginatedUsers"
            :key="user.id"
            class="group rounded-xl p-4 flex items-center justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
            :class="
              isDark
                ? 'bg-gray-700/50 hover:bg-gray-700'
                : 'bg-white hover:border-blue-300 border border-gray-200'
            "
          >
            <!-- Info Usuario -->
            <div class="flex items-center gap-6">
              <div class="relative">
                <div
                  class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold hover:rotate-12 transition-all duration-500"
                >
                  {{ user.name[0] }}
                </div>
                <span
                  :class="[
                    'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2',
                    isDark ? 'border-gray-700' : 'border-white',
                    statusColors[user.status],
                  ]"
                ></span>
              </div>

              <div class="space-y-1">
                <h3 class="font-semibold text-lg">{{ user.name }}</h3>
                <p class="opacity-70">{{ user.email }}</p>
                <div class="flex gap-3">
                  <span
                    :class="['text-xs px-3 py-1 rounded-full font-medium', roleColors[user.role]]"
                  >
                    {{ user.role }}
                  </span>
                  <span class="text-xs opacity-50">
                    <font-awesome-icon icon="clock" class="mr-1" />
                    Last seen: {{ formatLastSeen(user.lastSeen) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                class="action-button"
                :class="isDark ? 'hover:bg-gray-600' : 'hover:bg-blue-100'"
                @click="viewDashboard(user)"
              >
                <font-awesome-icon icon="chart-line" />
              </button>
              <button
                class="action-button"
                :class="isDark ? 'hover:bg-gray-600' : 'hover:bg-green-100'"
                @click="impersonateUser(user)"
              >
                <font-awesome-icon icon="user-secret" />
              </button>
              <button
                class="action-button"
                :class="isDark ? 'hover:bg-gray-600' : 'hover:bg-yellow-100'"
                @click="editUser(user)"
              >
                <font-awesome-icon icon="pen" />
              </button>
              <button
                class="action-button"
                :class="isDark ? 'hover:bg-gray-600' : 'hover:bg-purple-100'"
                @click="showUserLogs(user)"
              >
                <font-awesome-icon icon="history" />
              </button>
              <button
                class="action-button"
                :class="isDark ? 'hover:bg-gray-600' : 'hover:bg-red-100'"
                @click="confirmDelete(user)"
              >
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </div>
        </TransitionGroup>

        <div class="mt-6 flex justify-between items-center">
          <p class="text-sm opacity-70">
            Showing {{ paginationStart + 1 }} to {{ paginationEnd }} of
            {{ filteredUsers.length }} users
          </p>
          <div class="flex gap-2">
            <button
              v-for="page in totalPages"
              :key="page"
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
              :class="[
                currentPage === page
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-100 hover:bg-gray-200',
              ]"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "../../../assets/tailwind.css";

.action-button {
  @apply p-2 rounded-lg transition-all duration-300 hover:scale-110;
}

@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
