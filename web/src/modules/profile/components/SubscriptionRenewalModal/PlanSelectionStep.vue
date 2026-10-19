<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Badge, Button } from '@/modules/ui';
import type { SubscriptionPlan } from '../../composables/useSubscriptionWizard';

interface Props {
  selectedPlan: SubscriptionPlan | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:selectedPlan': [value: SubscriptionPlan | null];
}>();

const plans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 29.99,
    period: 'monthly',
    features: [
      'Hasta 100 productos',
      '1 tienda',
      'Soporte por email',
      'Reportes básicos',
      'Actualizaciones mensuales',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79.99,
    period: 'monthly',
    popular: true,
    features: [
      'Productos ilimitados',
      'Hasta 5 tiendas',
      'Soporte prioritario',
      'Reportes avanzados',
      'Actualizaciones semanales',
      'API access',
      'Integraciones premium',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199.99,
    period: 'monthly',
    features: [
      'Productos ilimitados',
      'Tiendas ilimitadas',
      'Soporte 24/7',
      'Reportes personalizados',
      'Actualizaciones diarias',
      'API access completo',
      'Todas las integraciones',
      'Cuenta manager dedicado',
      'Onboarding personalizado',
    ],
  },
];

const isSelected = (plan: SubscriptionPlan) => props.selectedPlan?.id === plan.id;

const selectPlan = (plan: SubscriptionPlan) => {
  emit('update:selectedPlan', plan);
};
</script>

<template>
  <div
    v-motion="{
      initial: { opacity: 0, y: 10 },
      enter: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    }"
    class="flex flex-col gap-6"
  >
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">Elige tu plan</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Puedes cambiar de plan más adelante. El pago se completa en Stripe.
      </p>
    </div>

    <div
      class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"
      role="radiogroup"
      aria-label="Planes de suscripción"
    >
      <article
        v-for="plan in plans"
        :key="plan.id"
        role="radio"
        tabindex="0"
        :aria-checked="isSelected(plan)"
        :aria-label="`${plan.name}, $${plan.price} por ${plan.period === 'monthly' ? 'mes' : 'año'}`"
        class="group relative flex min-h-[44px] cursor-pointer flex-col rounded-xl border bg-[var(--color-bg-elevated,#fff)] p-5 transition-all duration-200 touch-manipulation dark:bg-gray-800/80"
        :class="
          isSelected(plan)
            ? 'border-primary shadow-md ring-2 ring-primary/30 dark:border-primary-400 dark:ring-primary-400/35'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600'
        "
        @click="selectPlan(plan)"
        @keydown.enter.prevent="selectPlan(plan)"
        @keydown.space.prevent="selectPlan(plan)"
      >
        <div v-if="plan.popular" class="absolute -top-2.5 left-4 z-10">
          <Badge variant="warning" size="sm">Más popular</Badge>
        </div>

        <div class="mb-4 flex items-start justify-between gap-3 pt-1">
          <div class="min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ plan.name }}
            </h3>
            <p
              v-if="isSelected(plan)"
              class="mt-0.5 text-xs font-medium text-primary dark:text-primary-300"
            >
              Plan seleccionado
            </p>
          </div>

          <span
            class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200"
            :class="
              isSelected(plan)
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 bg-transparent dark:border-gray-500'
            "
            aria-hidden="true"
          >
            <FontAwesomeIcon v-if="isSelected(plan)" :icon="['fas', 'check']" class="h-3 w-3" />
          </span>
        </div>

        <div class="mb-5">
          <span
            class="text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white"
          >
            ${{ plan.price.toFixed(2) }}
          </span>
          <span class="ml-1 text-sm text-gray-500 dark:text-gray-400">
            /{{ plan.period === 'monthly' ? 'mes' : 'año' }}
          </span>
        </div>

        <ul class="mb-6 flex flex-1 flex-col gap-2.5">
          <li
            v-for="(feature, index) in plan.features"
            :key="index"
            class="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <FontAwesomeIcon
              :icon="['fas', 'check']"
              class="mt-1 h-3.5 w-3.5 shrink-0 text-success"
              aria-hidden="true"
            />
            <span>{{ feature }}</span>
          </li>
        </ul>

        <Button
          :variant="isSelected(plan) ? 'primary' : 'secondary'"
          full-width
          type="button"
          class="min-h-11 touch-manipulation"
          @click.stop="selectPlan(plan)"
        >
          {{ isSelected(plan) ? 'Seleccionado' : 'Seleccionar' }}
        </Button>
      </article>
    </div>
  </div>
</template>
