<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import TitleCard from '@/modules/shared/components/TitleCard/TitleCard.vue';
import CashierSearchInput from '@/modules/store/components/CashierSearchInput/CashierSearchInput.vue';
import {
  Section,
  Card,
  Button as UiButton,
  Badge,
  Avatar,
  Skeleton,
  InfoBanner,
  Input as UiInput,
  Pagination,
} from '@/modules/ui/components';
import { useStoreCashiersPage } from '../../composables/useStoreCashiersPage';

defineOptions({ name: 'StoreCashiers' });

const {
  store,
  loading,
  cashiersLoading,
  error,
  storeId,
  cashiersToAssign,
  assignedCashierProfileIds,
  assignSubmitting,
  removeSubmitting,
  assignedCashiersCount,
  cashiersList,
  cashiersTotal,
  cashiersPage,
  cashiersTotalPages,
  paginationStart,
  paginationEnd,
  cashierSearchQuery,
  selectedCount,
  allSelected,
  isCashierSelected,
  toggleCashierSelection,
  clearCashierSelection,
  toggleSelectAllCashiers,
  handleRemoveSelectedCashiers,
  retry,
  handleAssignCashier,
  router,
  formatShortDate,
  formatClock,
  scrollToAssignSection,
  fetchCashierAssignSuggestions,
} = useStoreCashiersPage();
</script>

<template>
  <div
    class="min-h-screen w-full min-w-0 overflow-x-hidden px-4 pt-4 pb-8 text-gray-800 transition-colors duration-300 dark:text-white sm:px-6 sm:py-8"
  >
    <div class="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-4 sm:gap-6 lg:gap-8">
      <TitleCard
        :title="store?.name ? `Cajeros - ${store.name}` : 'Asignar cajeros'"
        icon="users"
        :show-back-button="true"
      />

      <!-- Loading -->
      <div v-if="loading" class="flex w-full flex-col gap-4">
        <div
          class="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <Skeleton variant="text" :height="18" class="mb-6 w-48" />
          <Skeleton variant="rectangular" :height="44" class="mb-6 w-full rounded-lg" />
          <div class="space-y-3">
            <div
              v-for="i in 4"
              :key="i"
              class="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-600"
            >
              <Skeleton variant="circular" :width="44" :height="44" class="shrink-0" />
              <div class="flex-1">
                <Skeleton variant="text" :height="14" class="mb-2 w-32" />
                <Skeleton variant="text" :height="12" class="w-48" />
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
            <UiButton
              variant="secondary"
              size="sm"
              class="min-h-11 touch-manipulation sm:min-h-0"
              @click="retry"
            >
              Reintentar
            </UiButton>
            <UiButton
              variant="ghost"
              size="sm"
              class="min-h-11 touch-manipulation sm:min-h-0"
              @click="router.back()"
            >
              Volver
            </UiButton>
          </div>
        </template>
      </InfoBanner>

      <!-- Content -->
      <Section
        v-else-if="store"
        title="Gestionar cajeros"
        subtitle="Asigna cajeros a esta tienda"
        :icon="['fas', 'users']"
        icon-color="blue"
        :collapsible="false"
        class="min-w-0 overflow-visible"
      >
        <!-- Assign form (API: POST /store/:id/cashiers con UUID de perfil de cajero) -->
        <div id="store-cashiers-assign" class="mb-6 min-w-0 scroll-mt-4">
          <CashierSearchInput
            v-model="cashiersToAssign"
            :exclude-ids="assignedCashierProfileIds"
            :fetch-suggestions="fetchCashierAssignSuggestions"
          >
            <template #actions>
              <UiButton
                variant="primary"
                class="min-h-11 w-full touch-manipulation sm:w-auto sm:min-h-0"
                :icon="['fas', 'user-plus']"
                icon-position="left"
                :disabled="cashiersToAssign.length === 0 || assignSubmitting"
                :loading="assignSubmitting"
                @click="handleAssignCashier"
              >
                Asignar{{ cashiersToAssign.length > 0 ? ` (${cashiersToAssign.length})` : '' }}
              </UiButton>
            </template>
          </CashierSearchInput>
        </div>

        <!-- Assigned cashiers list -->
        <div class="min-w-0">
          <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 class="min-w-0 text-sm font-medium leading-snug text-gray-700 dark:text-gray-300">
              Cajeros asignados ({{ assignedCashiersCount }})
            </h3>
            <div v-if="assignedCashiersCount > 0" class="flex w-full sm:w-auto sm:shrink-0">
              <UiButton
                variant="ghost"
                size="sm"
                class="min-h-11 w-full touch-manipulation sm:w-auto sm:min-h-0"
                :icon="['fas', allSelected ? 'square' : 'square-check']"
                icon-position="left"
                @click="toggleSelectAllCashiers"
              >
                {{ allSelected ? 'Deseleccionar todo' : 'Seleccionar todo' }}
              </UiButton>
            </div>
          </div>

          <!-- Buscar por nombre / correo / caja (GET /store/:id/cashiers + filtro local) -->
          <div v-if="assignedCashiersCount > 0" class="mb-4 min-w-0">
            <UiInput
              v-model="cashierSearchQuery"
              name="cashierSearch"
              label="Buscar cajero"
              placeholder="Nombre, apellido, correo, nº de caja o sucursal"
              :prefix-icon="['fas', 'magnifying-glass']"
              autocomplete="off"
              class="w-full"
            />
          </div>

          <!-- Bulk actions -->
          <div
            v-if="selectedCount > 0"
            class="mb-4 flex flex-col gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 dark:border-primary-500/30 dark:bg-primary-500/10 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
          >
            <p class="text-sm font-medium leading-snug text-gray-800 dark:text-gray-200">
              {{ selectedCount }} seleccionado{{ selectedCount === 1 ? '' : 's' }}
            </p>
            <div
              class="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end"
            >
              <UiButton
                variant="danger"
                size="sm"
                class="min-h-11 w-full touch-manipulation sm:w-auto sm:min-h-0"
                :icon="['fas', 'user-minus']"
                icon-position="left"
                :disabled="removeSubmitting"
                :loading="removeSubmitting"
                @click="handleRemoveSelectedCashiers"
              >
                Quitar de la tienda
              </UiButton>
              <UiButton
                variant="ghost"
                size="sm"
                class="min-h-11 w-full touch-manipulation sm:w-auto sm:min-h-0"
                @click="clearCashierSelection"
              >
                Cancelar selección
              </UiButton>
            </div>
          </div>

          <!-- Empty state: sin cajeros en la tienda (mismo patrón que store dashboard) -->
          <Card
            v-if="assignedCashiersCount === 0"
            variant="outlined"
            padding="xl"
            class="border-dashed"
          >
            <div class="mx-auto flex max-w-md flex-col items-center text-center">
              <div
                class="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10"
              >
                <FontAwesomeIcon :icon="['fas', 'users']" class="text-3xl opacity-80" />
              </div>
              <h3 class="text-lg font-medium tracking-tight text-gray-900 dark:text-gray-100">
                Aún no hay cajeros
              </h3>
              <p class="mt-2 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Busca y selecciona perfiles de cajero arriba para asignarlos a esta tienda.
              </p>
              <UiButton
                variant="outline"
                size="md"
                class="mt-8 min-h-11 touch-manipulation rounded-full px-8 py-2.5 font-medium"
                :icon="['fas', 'user-plus']"
                icon-position="left"
                @click="scrollToAssignSection"
              >
                Asignar cajeros
              </UiButton>
            </div>
          </Card>

          <!-- Sin coincidencias con el filtro -->
          <Card
            v-else-if="
              !cashiersLoading && cashiersList.length === 0 && cashierSearchQuery.trim() !== ''
            "
            variant="outlined"
            padding="xl"
            class="border-dashed"
          >
            <div class="mx-auto flex max-w-md flex-col items-center text-center">
              <div
                class="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10"
              >
                <FontAwesomeIcon :icon="['fas', 'filter']" class="text-3xl opacity-80" />
              </div>
              <h3 class="text-lg font-medium tracking-tight text-gray-900 dark:text-gray-100">
                Sin resultados
              </h3>
              <p class="mt-2 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                No hay cajeros que coincidan con «{{ cashierSearchQuery.trim() }}». Prueba con otro
                término.
              </p>
              <UiButton
                variant="outline"
                size="md"
                class="mt-8 min-h-11 touch-manipulation rounded-full px-8 py-2.5 font-medium"
                :icon="['fas', 'eraser']"
                icon-position="left"
                @click="cashierSearchQuery = ''"
              >
                Limpiar búsqueda
              </UiButton>
            </div>
          </Card>

          <!-- Lista: skeleton o cards -->
          <div v-else-if="assignedCashiersCount > 0" class="space-y-3">
            <div v-if="cashiersLoading" class="space-y-3" aria-busy="true">
              <div
                v-for="i in 4"
                :key="i"
                class="flex items-start gap-3 rounded-xl border border-gray-200 p-3 sm:p-4 dark:border-gray-600"
              >
                <Skeleton variant="circular" :width="44" :height="44" class="shrink-0" />
                <div class="min-w-0 flex-1 space-y-1.5">
                  <Skeleton variant="text" :height="16" class="w-40" />
                  <Skeleton variant="text" :height="12" class="w-full max-w-sm" />
                </div>
              </div>
            </div>

            <template v-else>
              <Card
                v-for="cashier in cashiersList"
                :key="cashier.id"
                variant="outlined"
                padding="md"
                hover
                clickable
                :clickable-aria-label="`Seleccionar cajero ${cashier.name}`"
                class="touch-manipulation transition-all duration-200"
                :class="
                  isCashierSelected(cashier.id)
                    ? 'border-primary/40 bg-primary/6 ring-1 ring-inset ring-primary/35 dark:border-primary-500/45 dark:bg-primary-500/8 dark:ring-primary-400/40'
                    : ''
                "
                @click="toggleCashierSelection(cashier.id)"
              >
                <div class="flex min-w-0 items-start gap-2 sm:gap-4">
                  <label
                    class="flex h-11 min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center self-start sm:h-auto sm:min-h-0 sm:min-w-0 sm:justify-start sm:pt-1"
                    @click.stop
                  >
                    <input
                      type="checkbox"
                      class="h-5 w-5 shrink-0 rounded border-[var(--ui-field-border)] bg-transparent text-[var(--ui-focus-ring)] accent-[var(--ui-focus-ring)] focus:outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)] focus:ring-offset-0 sm:h-4 sm:w-4"
                      :checked="isCashierSelected(cashier.id)"
                      :aria-label="`Seleccionar ${cashier.name}`"
                      @click.stop.prevent="toggleCashierSelection(cashier.id)"
                    />
                  </label>
                  <Avatar
                    :name="cashier.name"
                    :color-seed="String(cashier.id)"
                    size="md"
                    class="mt-0.5 shrink-0 sm:mt-0"
                  />
                  <div class="min-w-0 flex-1 space-y-1">
                    <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <p
                        class="min-w-0 max-w-full truncate font-semibold leading-snug text-gray-900 dark:text-gray-100"
                      >
                        {{ cashier.name }}
                      </p>
                      <Badge
                        v-if="cashier.isApproved === false"
                        variant="warning"
                        size="sm"
                        class="shrink-0"
                        title="Caja pendiente de aprobación"
                      >
                        Pendiente
                      </Badge>
                      <Badge
                        v-else-if="cashier.isApproved === true"
                        variant="success"
                        size="sm"
                        class="shrink-0"
                        title="Caja aprobada"
                      >
                        Aprobada
                      </Badge>
                      <Badge
                        v-if="cashier.status === 'inactive'"
                        variant="default"
                        size="sm"
                        class="shrink-0"
                        title="Cuenta inactiva"
                      >
                        Inactiva
                      </Badge>
                    </div>
                    <p
                      v-if="cashier.email || cashier.cashierNumber || cashier.branchOffice"
                      class="min-w-0 truncate text-xs leading-snug text-gray-500 dark:text-gray-400"
                    >
                      <template v-if="cashier.email">{{ cashier.email }}</template>
                      <template v-if="cashier.cashierNumber">
                        <span v-if="cashier.email" class="mx-1 opacity-70" aria-hidden="true"
                          >·</span
                        >
                        <span>Caja {{ cashier.cashierNumber }}</span>
                      </template>
                      <template v-if="cashier.branchOffice">
                        <span
                          v-if="cashier.email || cashier.cashierNumber"
                          class="mx-1 opacity-70"
                          aria-hidden="true"
                          >·</span
                        >
                        <span>{{ cashier.branchOffice }}</span>
                      </template>
                    </p>
                    <p
                      v-if="
                        cashier.shiftStartTime ||
                        cashier.shiftEndTime ||
                        cashier.lastActivityAt ||
                        cashier.lastLogin
                      "
                      class="min-w-0 truncate text-xs leading-snug text-gray-500 dark:text-gray-400"
                    >
                      <template v-if="cashier.shiftStartTime || cashier.shiftEndTime">
                        {{ formatClock(cashier.shiftStartTime) }}–{{
                          formatClock(cashier.shiftEndTime)
                        }}
                      </template>
                      <template v-if="cashier.lastActivityAt">
                        <span
                          v-if="cashier.shiftStartTime || cashier.shiftEndTime"
                          class="mx-1 opacity-70"
                          aria-hidden="true"
                          >·</span
                        >
                        <span class="sr-only">Última actividad: </span>
                        Act. {{ formatShortDate(cashier.lastActivityAt) }}
                      </template>
                      <template v-if="cashier.lastLogin">
                        <span
                          v-if="
                            cashier.shiftStartTime || cashier.shiftEndTime || cashier.lastActivityAt
                          "
                          class="mx-1 opacity-70"
                          aria-hidden="true"
                          >·</span
                        >
                        <span class="sr-only">Último acceso: </span>
                        Acc. {{ formatShortDate(cashier.lastLogin) }}
                      </template>
                    </p>
                  </div>
                </div>
              </Card>
            </template>

            <!-- Paginación (misma ruta que Postman: page & limit) -->
            <div
              v-if="!cashiersLoading && cashiersTotal > 0"
              class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p class="order-2 text-xs text-gray-600 dark:text-gray-400 sm:order-1 sm:text-sm">
                Mostrando {{ paginationStart + 1 }}–{{ paginationEnd }} de {{ cashiersTotal }}
              </p>
              <div
                v-if="cashiersTotalPages > 1"
                class="order-1 flex max-w-full flex-wrap justify-center gap-2 overflow-x-auto sm:order-2"
              >
                <Pagination
                  v-model="cashiersPage"
                  :total-pages="cashiersTotalPages"
                  :max-pages-to-show="5"
                  :show-compact-on-mobile="true"
                />
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <UiButton
            variant="ghost"
            size="sm"
            class="min-h-11 w-full touch-manipulation sm:w-auto sm:min-h-0"
            :icon="['fas', 'arrow-left']"
            @click="router.push({ name: 'StoreDetails', params: { id: String(storeId) } })"
          >
            Volver a detalle de la tienda
          </UiButton>
        </template>
      </Section>
    </div>
  </div>
</template>
