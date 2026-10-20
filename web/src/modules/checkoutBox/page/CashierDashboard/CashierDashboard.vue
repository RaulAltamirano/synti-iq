<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { useAuthStore } from '@/modules/auth/stores/authStore';

interface QuickAction {
  routeName: string;
  label: string;
  hint: string;
  icon: ['fas', string];
}

const quickActions: QuickAction[] = [
  {
    routeName: 'cashier-sales',
    label: 'Ventas',
    hint: 'Cobrar y gestionar el carrito',
    icon: ['fas', 'cash-register'],
  },
  {
    routeName: 'cashier-register',
    label: 'Caja',
    hint: 'Apertura, arqueo y cierre',
    icon: ['fas', 'money-bill'],
  },
  {
    routeName: 'cashier-returns',
    label: 'Devoluciones',
    hint: 'Procesar devoluciones',
    icon: ['fas', 'undo'],
  },
  {
    routeName: 'cashier-credits',
    label: 'Créditos',
    hint: 'Crédito de clientes',
    icon: ['fas', 'credit-card'],
  },
  {
    routeName: 'cashier-history',
    label: 'Historial',
    hint: 'Ventas anteriores',
    icon: ['fas', 'history'],
  },
  {
    routeName: 'cashier-inventory',
    label: 'Inventario',
    hint: 'Existencias y ajustes',
    icon: ['fas', 'boxes'],
  },
  {
    routeName: 'cashier-reports',
    label: 'Reportes',
    hint: 'Resúmenes y cortes',
    icon: ['fas', 'file'],
  },
];

/** Solo lo que suele evitar errores en caja; sin relleno. */
const cashierReminders: string[] = [
  'Confirma el total en voz alta antes de cobrar.',
  'Cambio: primero monedas, luego billetes.',
  'Tarjeta o transferencia: espera “aprobado” (o equivalente) en pantalla antes de entregar la compra.',
  'Billete dudoso o devolución fuera de lo habitual: llama a encargado.',
  'PC compartido: cierra sesión al alejarte.',
  'Cierra turno solo con caja cuadrada y anota diferencias o incidencias.',
];

const { currentUser } = storeToRefs(useAuthStore());
const router = useRouter();

const displayName = computed(() => {
  const u = currentUser.value;
  if (!u) return 'Usuario';
  const parts = [u.firstName, u.lastName].filter(Boolean) as string[];
  if (parts.length > 0) return parts.join(' ');
  const local = u.email?.split('@')[0];
  return local?.trim() || u.email || 'Usuario';
});

/** Fecha/hora del panel: español por defecto; si el navegador ya está en `es-*`, se respeta su variante. */
const CLOCK_LOCALE =
  typeof navigator !== 'undefined' && /^es/i.test(navigator.language || '')
    ? navigator.language
    : 'es';

const currentTime = ref(new Date());
const showClockSeconds = ref(true);
let intervalId: ReturnType<typeof setInterval> | null = null;

const dateLine = computed(() =>
  new Intl.DateTimeFormat(CLOCK_LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentTime.value)
);

const timeLine = computed(() =>
  new Intl.DateTimeFormat(CLOCK_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    ...(showClockSeconds.value ? { second: '2-digit' as const } : {}),
    hourCycle: 'h23',
  }).format(currentTime.value)
);

const timeZoneShort = computed(() => {
  const parts = new Intl.DateTimeFormat(CLOCK_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).formatToParts(currentTime.value);
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
});

const isoDateTime = computed(() => currentTime.value.toISOString());

function tickClock(): void {
  currentTime.value = new Date();
}

function goToRoute(name: string): void {
  router.push({ name }).catch(() => {
    /* navigation duplicated or aborted */
  });
}

onMounted(() => {
  tickClock();
  const reduced = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
  showClockSeconds.value = !reduced;
  const ms = reduced ? 60_000 : 1000;
  intervalId = globalThis.setInterval(tickClock, ms);
});

onUnmounted(() => {
  if (intervalId !== null) {
    globalThis.clearInterval(intervalId);
    intervalId = null;
  }
});
</script>

<template>
  <main
    class="mx-auto flex max-w-6xl flex-col gap-8 pb-8"
    aria-labelledby="cashier-dashboard-heading"
  >
    <header
      class="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-6 shadow-sm"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <p class="text-sm font-medium text-[var(--color-text-secondary)]">Panel de caja</p>
          <h1
            id="cashier-dashboard-heading"
            class="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-3xl"
          >
            Hola, {{ displayName }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
            Elige una tarea para empezar. Aquí tienes accesos rápidos y recordatorios útiles durante
            el turno.
          </p>
        </div>
        <div
          class="flex shrink-0 flex-col gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] px-4 py-4 sm:min-w-[17rem] sm:flex-row sm:items-stretch sm:gap-4 sm:px-5"
        >
          <div
            class="flex items-start gap-3 border-b border-[var(--color-border-default)] pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary dark:bg-primary-950/50 dark:text-primary-300"
              aria-hidden="true"
            >
              <FontAwesomeIcon :icon="['fas', 'calendar-day']" class="h-5 w-5" />
            </span>
            <div class="min-w-0 text-left">
              <p
                class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]"
              >
                Fecha
              </p>
              <p class="mt-1 text-sm font-medium leading-snug text-[var(--color-text-primary)]">
                {{ dateLine }}
              </p>
            </div>
          </div>
          <div class="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border-default)]"
              aria-hidden="true"
            >
              <FontAwesomeIcon :icon="['fas', 'clock']" class="h-5 w-5" />
            </span>
            <div class="min-w-0 flex-1 text-left">
              <p
                class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]"
              >
                Hora local
                <span
                  v-if="timeZoneShort"
                  class="font-normal normal-case text-[var(--color-text-disabled)]"
                >
                  · {{ timeZoneShort }}
                </span>
              </p>
              <time
                class="mt-0.5 block font-semibold tracking-tight text-[var(--color-text-primary)] tabular-nums"
                :class="showClockSeconds ? 'text-2xl sm:text-3xl' : 'text-2xl'"
                :datetime="isoDateTime"
              >
                {{ timeLine }}
              </time>
              <p v-if="!showClockSeconds" class="mt-1 text-xs text-[var(--color-text-secondary)]">
                Actualización cada minuto (menos movimiento en pantalla)
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section aria-labelledby="quick-actions-heading">
      <h2
        id="quick-actions-heading"
        class="mb-4 text-lg font-semibold text-[var(--color-text-primary)]"
      >
        Accesos rápidos
      </h2>
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="action in quickActions" :key="action.routeName">
          <button
            type="button"
            class="flex h-full w-full cursor-pointer flex-col gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4 text-left transition-colors duration-200 hover:border-primary hover:bg-primary-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-default)] dark:hover:bg-primary-950/25"
            @click="goToRoute(action.routeName)"
          >
            <span class="flex items-center gap-3">
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary dark:bg-primary-950/50 dark:text-primary-300"
              >
                <FontAwesomeIcon :icon="action.icon" class="h-5 w-5" aria-hidden="true" />
              </span>
              <span class="font-semibold text-[var(--color-text-primary)]">{{ action.label }}</span>
            </span>
            <span class="text-sm text-[var(--color-text-secondary)]">{{ action.hint }}</span>
          </button>
        </li>
      </ul>
    </section>

    <section
      class="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-5 sm:p-6"
      aria-labelledby="reminders-heading"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <FontAwesomeIcon
              :icon="['fas', 'circle-check']"
              class="h-5 w-5 shrink-0 text-success"
              aria-hidden="true"
            />
            <h2
              id="reminders-heading"
              class="text-base font-semibold text-[var(--color-text-primary)]"
            >
              Recordatorios
            </h2>
          </div>
          <ul
            class="mt-3 list-inside list-disc space-y-1.5 pl-0.5 text-sm text-[var(--color-text-secondary)] marker:text-success"
          >
            <li v-for="(line, i) in cashierReminders" :key="i" class="leading-snug">
              {{ line }}
            </li>
          </ul>
        </div>
        <RouterLink
          :to="{ name: 'Profile' }"
          class="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-elevated)] sm:self-center"
        >
          <FontAwesomeIcon :icon="['fas', 'user-gear']" class="h-4 w-4" aria-hidden="true" />
          Mi perfil
        </RouterLink>
      </div>
    </section>
  </main>
</template>
