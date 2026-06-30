<script lang="ts" src="./StoreDetails.ts" />

<template>
  <div
    class="min-h-screen w-full transition-colors duration-300 py-4 px-4 sm:py-8 sm:px-6"
    :class="isDark ? 'text-white' : 'text-gray-800'"
  >
    <div class="flex flex-col max-w-4xl w-full mx-auto gap-4 sm:gap-6 lg:gap-8 min-w-0">
      <TitleCard
        :title="store?.name ?? 'Detalle de tienda'"
        icon="store"
        :show-back-button="true"
      />

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full min-w-0">
        <!-- Card 1: Store info skeleton -->
        <div
          class="rounded-xl border p-4 sm:p-6 min-w-0 overflow-hidden"
          :class="isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'"
        >
          <div class="space-y-2 mb-6">
            <Skeleton variant="text" :height="18" class="w-48" />
            <Skeleton variant="text" :height="14" class="w-64" />
          </div>
          <div class="space-y-6">
            <div class="space-y-3">
              <Skeleton variant="text" :height="14" class="w-20" />
              <div class="flex items-center gap-3">
                <Skeleton variant="circular" :width="56" :height="56" />
                <div class="space-y-2">
                  <Skeleton variant="text" :height="16" class="w-40" />
                  <div class="flex gap-2">
                    <Skeleton variant="rectangular" :height="20" class="w-16 rounded-full" />
                    <Skeleton variant="rectangular" :height="20" class="w-14 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-3">
              <Skeleton variant="text" :height="14" class="w-24" />
              <Skeleton variant="text" :height="14" class="w-52" />
              <Skeleton variant="text" :height="14" class="w-36" />
            </div>
            <div class="space-y-3 min-w-0">
              <Skeleton variant="text" :height="14" class="w-28" />
              <Skeleton variant="text" :height="14" class="w-full max-w-md" />
            </div>
            <div class="space-y-3">
              <Skeleton variant="text" :height="14" class="w-32" />
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton variant="rectangular" :height="60" class="w-full rounded-lg" />
                <Skeleton variant="rectangular" :height="60" class="w-full rounded-lg" />
              </div>
            </div>
            <div class="space-y-3">
              <Skeleton variant="text" :height="14" class="w-20" />
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  v-for="i in 7"
                  :key="i"
                  class="flex justify-between items-center py-2 px-3 rounded-lg border"
                  :class="isDark ? 'border-gray-600' : 'border-gray-200'"
                >
                  <Skeleton variant="text" :height="14" class="w-24" />
                  <Skeleton variant="text" :height="14" class="w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <InfoBanner
        v-else-if="error"
        variant="error"
        title="Error"
        :description="error"
        :icon="['fas', 'exclamation-circle']"
      >
        <template #actions>
          <div class="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              class="min-h-[44px] sm:min-h-0 touch-manipulation"
              @click="retry"
            >
              Reintentar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="min-h-[44px] sm:min-h-0 touch-manipulation"
              @click="router.back()"
            >
              Volver
            </Button>
          </div>
        </template>
      </InfoBanner>

      <!-- Success: Store info -->
      <template v-else-if="store">
        <!-- Section: Store info (read-only) -->
        <Card variant="default" padding="md">
          <template #header>
            <h2 class="text-lg font-semibold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">
              Información de la tienda
            </h2>
            <p class="text-sm mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
              Datos básicos, contacto y horarios
            </p>
          </template>

          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between gap-2 min-w-0">
                <h3 class="text-sm font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                  Identidad
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  class="shrink-0 touch-manipulation min-h-[40px] sm:min-h-0"
                  :icon="['fas', 'pen']"
                  title="Editar identidad"
                  aria-label="Editar identidad"
                  @click="onSectionAction('name')"
                />
              </div>
              <div class="flex flex-wrap items-center gap-3 min-w-0">
                <Avatar
                  :name="store.name"
                  :color-seed="String(store.id)"
                  size="lg"
                  class="shrink-0"
                />
                <div class="min-w-0 flex-1">
                  <p
                    class="font-medium truncate"
                    :class="isDark ? 'text-gray-100' : 'text-gray-800'"
                  >
                    {{ store.name }}
                  </p>
                  <div class="flex gap-2 mt-1">
                    <Badge :variant="'info'" size="sm">{{ store.storeType }}</Badge>
                    <Badge :variant="store.isActive ? 'success' : 'error'" size="sm">
                      {{ store.isActive ? 'Activa' : 'Inactiva' }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-4 min-w-0">
              <h3 class="text-sm font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                Contacto
              </h3>
              <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 min-w-0">
                <p v-if="store.phoneNumber" class="flex items-center gap-2 text-sm">
                  <FontAwesomeIcon :icon="['fas', 'phone']" class="text-gray-500" />
                  {{ store.phoneNumber }}
                </p>
                <p v-if="store.email" class="flex items-center gap-2 text-sm">
                  <FontAwesomeIcon :icon="['fas', 'envelope']" class="text-gray-500" />
                  {{ store.email }}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-4 min-w-0">
              <div class="flex items-center justify-between gap-2 min-w-0">
                <h3 class="text-sm font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                  Ubicación
                </h3>
                <Button
                  v-if="hasAddress"
                  variant="ghost"
                  size="sm"
                  class="shrink-0 touch-manipulation min-h-[40px] sm:min-h-0"
                  :icon="['fas', 'pen']"
                  title="Editar ubicación"
                  aria-label="Editar ubicación"
                  @click="onSectionAction('address')"
                />
              </div>
              <template v-if="hasAddress">
                <p class="text-sm flex items-start gap-2 min-w-0 break-words">
                  <FontAwesomeIcon
                    :icon="['fas', 'map-marker-alt']"
                    class="mt-0.5 shrink-0 text-gray-500"
                  />
                  <span class="min-w-0">{{ store.address ?? store.location?.fullAddress }}</span>
                </p>
                <div
                  v-if="store.location?.city || store.location?.state"
                  class="text-sm"
                  :class="isDark ? 'text-gray-400' : 'text-gray-600'"
                >
                  {{ [store.location?.city, store.location?.state].filter(Boolean).join(', ') }}
                  <span v-if="store.location?.postalCode"> - {{ store.location.postalCode }}</span>
                </div>
              </template>
              <div
                v-else
                class="rounded-lg border border-dashed px-4 py-6 text-center"
                :class="isDark ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50/80'"
              >
                <FontAwesomeIcon
                  :icon="['fas', 'map-marker-alt']"
                  class="mx-auto mb-2 text-2xl opacity-50"
                  :class="isDark ? 'text-gray-500' : 'text-gray-400'"
                />
                <p class="text-sm mb-3" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                  No hay dirección registrada
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  :icon="['fas', 'plus']"
                  class="touch-manipulation min-h-[44px] sm:min-h-0"
                  @click="onSectionAction('address')"
                >
                  Agregar dirección
                </Button>
              </div>
            </div>

            <div class="flex flex-col gap-4 min-w-0">
              <div class="flex items-center justify-between gap-2 min-w-0">
                <h3 class="text-sm font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                  Metas de ventas
                </h3>
                <Button
                  v-if="hasSalesTargets"
                  variant="ghost"
                  size="sm"
                  class="shrink-0 touch-manipulation min-h-[40px] sm:min-h-0"
                  :icon="['fas', 'pen']"
                  title="Editar metas de ventas"
                  aria-label="Editar metas de ventas"
                  @click="onSectionAction('salesTargets')"
                />
              </div>
              <div v-if="hasSalesTargets" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  v-if="store.dailySalesTarget != null"
                  class="rounded-lg px-4 py-3 border"
                  :class="isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'"
                >
                  <p class="text-xs opacity-70">Meta diaria</p>
                  <p class="font-semibold">{{ formatNumber(store.dailySalesTarget) }}</p>
                </div>
                <div
                  v-if="store.monthlySalesTarget != null"
                  class="rounded-lg px-4 py-3 border"
                  :class="isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'"
                >
                  <p class="text-xs opacity-70">Meta mensual</p>
                  <p class="font-semibold">{{ formatNumber(store.monthlySalesTarget) }}</p>
                </div>
              </div>
              <div
                v-else
                class="rounded-lg border border-dashed px-4 py-6 text-center"
                :class="isDark ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50/80'"
              >
                <FontAwesomeIcon
                  :icon="['fas', 'chart-line']"
                  class="mx-auto mb-2 text-2xl opacity-50"
                  :class="isDark ? 'text-gray-500' : 'text-gray-400'"
                />
                <p class="text-sm mb-3" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                  No hay metas de ventas configuradas
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  :icon="['fas', 'plus']"
                  class="touch-manipulation min-h-[44px] sm:min-h-0"
                  @click="onSectionAction('salesTargets')"
                >
                  Agregar metas
                </Button>
              </div>
            </div>

            <div class="flex flex-col gap-4 min-w-0">
              <div class="flex items-center justify-between gap-2 min-w-0">
                <h3 class="text-sm font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                  Horarios
                </h3>
                <Button
                  v-if="hasSchedules"
                  variant="ghost"
                  size="sm"
                  class="shrink-0 touch-manipulation min-h-[40px] sm:min-h-0"
                  :icon="['fas', 'clock']"
                  title="Ver horarios"
                  aria-label="Ver horarios"
                  @click="onSectionAction('schedule')"
                />
              </div>
              <div v-if="hasSchedules" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  v-for="s in store.schedules"
                  :key="s.dayOfWeek"
                  class="flex justify-between items-center py-2 px-3 rounded-lg border"
                  :class="isDark ? 'border-gray-600' : 'border-gray-200'"
                >
                  <span class="text-sm font-medium">{{ s.dayLabel }}</span>
                  <span class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                    {{ formatHours(s.openTime, s.closeTime) }}
                  </span>
                </div>
              </div>
              <div
                v-else
                class="rounded-lg border border-dashed px-4 py-6 text-center"
                :class="isDark ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50/80'"
              >
                <FontAwesomeIcon
                  :icon="['fas', 'clock']"
                  class="mx-auto mb-2 text-2xl opacity-50"
                  :class="isDark ? 'text-gray-500' : 'text-gray-400'"
                />
                <p class="text-sm mb-3" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                  No hay horarios definidos
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  :icon="['fas', 'plus']"
                  class="touch-manipulation min-h-[44px] sm:min-h-0"
                  @click="onSectionAction('schedule')"
                >
                  Agregar horarios
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <StoreIdentityModal
          :is-open="activeModal === 'identity'"
          :initial-name="store.name"
          :color-seed="String(store.id)"
          @close="closeModal"
          @save="handleIdentityModalSave"
        />
        <StoreSalesTargetsModal
          :is-open="activeModal === 'salesTargets'"
          :initial-daily="store.dailySalesTarget"
          :initial-monthly="store.monthlySalesTarget"
          @close="closeModal"
          @save="handleSalesTargetsModalSave"
        />
        <StoreSchedulesModal
          :is-open="activeModal === 'schedules'"
          :schedules="store.schedules"
          @close="closeModal"
        />
      </template>
    </div>
  </div>
</template>
