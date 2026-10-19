<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Card, InfoBanner } from '@/modules/ui';
import type { SubscriptionPlan } from '../../composables/useSubscriptionWizard';

interface Props {
  selectedPlan: SubscriptionPlan | null;
  isRenewal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isRenewal: false,
});

const periodLabel = computed(() => (props.selectedPlan?.period === 'yearly' ? 'Anual' : 'Mensual'));

const actionNoun = computed(() => (props.isRenewal ? 'renovación' : 'contratación'));
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
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
        Confirma y paga
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Revisa el resumen. El cobro se procesa de forma segura en Stripe.
      </p>
    </div>

    <Card variant="default" padding="lg">
      <div class="flex flex-col gap-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Plan
            </p>
            <p class="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
              {{ selectedPlan?.name ?? '—' }}
            </p>
            <p class="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              Facturación {{ periodLabel.toLowerCase() }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total
            </p>
            <p class="mt-1 text-2xl font-bold tabular-nums text-primary dark:text-primary-300">
              ${{ selectedPlan?.price.toFixed(2) ?? '0.00' }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              /{{ selectedPlan?.period === 'yearly' ? 'año' : 'mes' }}
            </p>
          </div>
        </div>

        <div
          class="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
        >
          <FontAwesomeIcon :icon="['fas', 'shield-alt']" class="h-4 w-4 shrink-0 text-success" />
          <span>Pago cifrado · Stripe Checkout</span>
        </div>
      </div>
    </Card>

    <InfoBanner
      variant="info"
      title="Serás redirigido a Stripe"
      :description="`Al continuar abriremos el checkout de Stripe para completar la ${actionNoun}. SyntiIQ no solicita datos de tarjeta en esta pantalla.`"
      :icon="['fas', 'external-link-alt']"
    />
  </div>
</template>
