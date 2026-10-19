<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMotion } from '@vueuse/motion';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useTheme } from '@/modules/shared/composables/useTheme';
import TitleCard from '@/modules/shared/components/TitleCard/TitleCard.vue';
import { Button, Card, Input, Select, Stepper, Textarea } from '@/modules/ui';
import type { StepperStep, SelectOption } from '@/modules/ui';

type RoleId = 'customer' | 'delivery' | 'cashier';

interface DeliveryLocation {
  name: string;
  address: string;
  reference: string;
  isDefault: boolean;
}

interface ProfileType {
  id: RoleId;
  title: string;
  description: string;
  icon: string;
  colorClass: string;
}

const USER_FORM_WIZARD_STEP = {
  ROLE: 1,
  BASIC: 2,
  DETAILS: 3,
} as const;

const SECTION_DIVIDER_CLASSES = 'flex flex-col divide-y divide-gray-200 dark:divide-gray-700';

const PROFILE_TYPES: readonly ProfileType[] = [
  {
    id: 'customer',
    title: 'Customer',
    description: 'Standard customer profile for placing orders.',
    icon: 'user',
    colorClass: 'bg-info',
  },
  {
    id: 'delivery',
    title: 'Delivery',
    description: 'Delivery agent profile with zones and vehicle details.',
    icon: 'truck',
    colorClass: 'bg-success',
  },
  {
    id: 'cashier',
    title: 'Cashier',
    description: 'Store cashier profile with shift and branch assignment.',
    icon: 'cash-register',
    colorClass: 'bg-primary',
  },
];

const DEPARTMENT_OPTIONS: SelectOption[] = [
  { label: 'Sales', value: 'sales' },
  { label: 'Operations', value: 'operations' },
  { label: 'Customer Service', value: 'customer-service' },
  { label: 'Logistics', value: 'logistics' },
];

const STORE_OPTIONS: SelectOption[] = [
  { label: 'Main Store', value: 'main-store' },
  { label: 'Downtown Branch', value: 'downtown-branch' },
  { label: 'Shopping Mall', value: 'shopping-mall' },
  { label: 'Express Store', value: 'express-store' },
];

const VEHICLE_OPTIONS: SelectOption[] = [
  { label: 'Motorcycle', value: 'motorcycle' },
  { label: 'Car', value: 'car' },
  { label: 'Bicycle', value: 'bicycle' },
];

const DELIVERY_ZONES = [
  { label: 'North Zone', value: 'north' },
  { label: 'South Zone', value: 'south' },
  { label: 'East Zone', value: 'east' },
  { label: 'West Zone', value: 'west' },
];

const wizardSteps: StepperStep[] = [
  { id: 1, title: 'User role', shortTitle: 'Role', icon: 'users' },
  { id: 2, title: 'Basic information', shortTitle: 'Data', icon: 'id-card' },
  { id: 3, title: 'Role details', shortTitle: 'Details', icon: 'sliders' },
];

const router = useRouter();
const { isDark } = useTheme();

const formPageRef = ref<HTMLElement | null>(null);

useMotion(formPageRef, {
  initial: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
});

const currentStep = ref<number>(USER_FORM_WIZARD_STEP.ROLE);
const isSubmitting = ref(false);
const successMessage = ref('');

const formData = reactive({
  role: 'customer' as RoleId,
  name: '',
  email: '',
  phone: '',
  department: '',
  store: '',
  notes: '',
  delivery: {
    vehicleType: '',
    licensePlate: '',
    preferredZones: [] as string[],
  },
  cashier: {
    cashierNumber: '',
    shiftStartTime: '',
    shiftEndTime: '',
  },
  locations: [] as DeliveryLocation[],
});

const totalSteps = wizardSteps.length;
const isDeliveryRole = computed(() => formData.role === 'delivery');
const isCashierRole = computed(() => formData.role === 'cashier');

const selectRole = (roleId: RoleId) => {
  formData.role = roleId;
};

const addLocation = () => {
  formData.locations.push({
    name: '',
    address: '',
    reference: '',
    isDefault: formData.locations.length === 0,
  });
};

const removeLocation = (index: number) => {
  formData.locations.splice(index, 1);
  if (formData.locations.length > 0 && !formData.locations.some((location) => location.isDefault))
    formData.locations[0].isDefault = true;
};

const setDefaultLocation = (index: number) => {
  formData.locations.forEach((location, locationIndex) => {
    location.isDefault = locationIndex === index;
  });
};

const togglePreferredZone = (zoneValue: string) => {
  if (formData.delivery.preferredZones.includes(zoneValue)) {
    formData.delivery.preferredZones = formData.delivery.preferredZones.filter(
      (existingZone) => existingZone !== zoneValue
    );
    return;
  }
  formData.delivery.preferredZones.push(zoneValue);
};

const goBack = () => {
  if (currentStep.value > USER_FORM_WIZARD_STEP.ROLE) currentStep.value -= 1;
};

const cancelForm = () => {
  router.back();
};

const handleFormSubmit = async () => {
  successMessage.value = '';

  if (currentStep.value < totalSteps) {
    currentStep.value += 1;
    return;
  }

  isSubmitting.value = true;
  await new Promise((resolve) => setTimeout(resolve, 700));
  isSubmitting.value = false;
  successMessage.value = 'User data is ready. Endpoint integration is pending.';
};
</script>

<template>
  <div
    class="min-h-screen w-full px-4 py-8 transition-colors duration-300"
    :class="isDark ? 'text-white' : 'text-gray-800'"
  >
    <div ref="formPageRef" class="mx-auto flex w-full max-w-4xl flex-col gap-6 sm:gap-8">
      <TitleCard title="New user" icon="user-plus" :actions="[]" />

      <Stepper v-model="currentStep" :steps="wizardSteps" :animated="true" />

      <form class="flex flex-col pb-6" aria-label="Create user form" @submit.prevent="handleFormSubmit">
        <div v-if="currentStep === USER_FORM_WIZARD_STEP.ROLE" class="flex flex-col gap-4">
          <Card variant="default" padding="lg">
            <div :class="SECTION_DIVIDER_CLASSES">
              <section class="space-y-5 py-6 first:pt-0">
                <header class="space-y-1">
                  <h2 class="text-lg font-semibold">Choose a profile type</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Keep all users in one flow, including delivery users.
                  </p>
                </header>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <button
                    v-for="profile in PROFILE_TYPES"
                    :key="profile.id"
                    type="button"
                    class="rounded-xl border p-4 text-left transition-all"
                    :class="
                      formData.role === profile.id
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/20'
                        : 'border-gray-200 hover:border-primary/40 dark:border-gray-700 dark:hover:border-primary/50'
                    "
                    @click="selectRole(profile.id)"
                  >
                    <div
                      class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-white"
                      :class="profile.colorClass"
                    >
                      <FontAwesomeIcon :icon="profile.icon" />
                    </div>
                    <h3 class="font-semibold">{{ profile.title }}</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {{ profile.description }}
                    </p>
                  </button>
                </div>
              </section>
            </div>
          </Card>
        </div>

        <div v-else-if="currentStep === USER_FORM_WIZARD_STEP.BASIC" class="flex flex-col gap-4">
          <Card variant="default" padding="lg">
            <div :class="SECTION_DIVIDER_CLASSES">
              <section class="grid grid-cols-1 gap-4 py-6 first:pt-0 md:grid-cols-2">
                <Input
                  v-model="formData.name"
                  full-width
                  label="Name"
                  placeholder="Enter full name"
                  required
                />
                <Input
                  v-model="formData.email"
                  type="email"
                  full-width
                  label="Email"
                  placeholder="user@synti-iq.com"
                  required
                />
                <Input
                  v-model="formData.phone"
                  type="tel"
                  full-width
                  label="Phone"
                  placeholder="+1 000 000 0000"
                />
                <Select
                  v-model="formData.department"
                  :options="DEPARTMENT_OPTIONS"
                  full-width
                  label="Department"
                  placeholder="Select department"
                />
              </section>

              <section class="grid grid-cols-1 gap-4 py-6 md:grid-cols-2">
                <Select
                  v-if="isDeliveryRole || isCashierRole"
                  v-model="formData.store"
                  :options="STORE_OPTIONS"
                  full-width
                  label="Assigned store"
                  placeholder="Select store"
                />
                <Textarea
                  v-model="formData.notes"
                  full-width
                  :class="isDeliveryRole || isCashierRole ? 'md:col-span-1' : 'md:col-span-2'"
                  label="Internal notes"
                  placeholder="Optional notes for this user"
                  :rows="3"
                />
              </section>
            </div>
          </Card>
        </div>

        <div v-else class="flex flex-col gap-4">
          <Card variant="default" padding="lg">
            <div :class="SECTION_DIVIDER_CLASSES">
              <section v-if="isDeliveryRole" class="space-y-4 py-6 first:pt-0">
                <header class="space-y-1">
                  <h2 class="text-lg font-semibold">Delivery settings</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Configure vehicle details, zones, and delivery locations.
                  </p>
                </header>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Select
                    v-model="formData.delivery.vehicleType"
                    :options="VEHICLE_OPTIONS"
                    full-width
                    label="Vehicle type"
                    placeholder="Select vehicle"
                  />
                  <Input
                    v-model="formData.delivery.licensePlate"
                    full-width
                    label="License plate"
                    placeholder="ABC-123"
                  />
                </div>

                <div class="space-y-2">
                  <p class="text-sm font-medium">Preferred zones</p>
                  <div class="flex flex-wrap gap-2">
                    <Button
                      v-for="zone in DELIVERY_ZONES"
                      :key="zone.value"
                      type="button"
                      size="sm"
                      :variant="
                        formData.delivery.preferredZones.includes(zone.value) ? 'primary' : 'secondary'
                      "
                      @click="togglePreferredZone(zone.value)"
                    >
                      {{ zone.label }}
                    </Button>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="font-medium">Delivery locations</h3>
                    <Button type="button" size="sm" icon="plus" @click="addLocation"> Add location </Button>
                  </div>

                  <div v-if="formData.locations.length === 0" class="rounded-lg border border-dashed p-4 text-sm">
                    No locations added yet.
                  </div>

                  <div v-else class="space-y-3">
                    <Card
                      v-for="(location, index) in formData.locations"
                      :key="`location-${index}`"
                      variant="outlined"
                      padding="md"
                    >
                      <div class="space-y-3">
                        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <Input
                            v-model="location.name"
                            full-width
                            :label="`Location ${index + 1}`"
                            placeholder="Home, Work, etc."
                          />
                          <Input
                            v-model="location.reference"
                            full-width
                            label="Reference"
                            placeholder="Optional reference"
                          />
                        </div>
                        <Textarea
                          v-model="location.address"
                          full-width
                          label="Address"
                          placeholder="Full delivery address"
                          :rows="2"
                        />
                        <div class="flex flex-wrap justify-end gap-2">
                          <Button
                            v-if="!location.isDefault"
                            type="button"
                            size="sm"
                            variant="secondary"
                            icon="star"
                            @click="setDefaultLocation(index)"
                          >
                            Set default
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="error"
                            icon="trash"
                            @click="removeLocation(index)"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </section>

              <section v-else-if="isCashierRole" class="space-y-4 py-6 first:pt-0">
                <header class="space-y-1">
                  <h2 class="text-lg font-semibold">Cashier settings</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Assign branch info and define work shift.
                  </p>
                </header>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    v-model="formData.cashier.cashierNumber"
                    full-width
                    label="Cashier number"
                    placeholder="CA-001"
                  />
                  <Input
                    v-model="formData.cashier.shiftStartTime"
                    full-width
                    type="time"
                    label="Shift start"
                  />
                  <Input
                    v-model="formData.cashier.shiftEndTime"
                    full-width
                    type="time"
                    label="Shift end"
                  />
                </div>
              </section>

              <section v-else class="space-y-2 py-6 first:pt-0">
                <h2 class="text-lg font-semibold">Customer profile ready</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  No extra fields are required for customer users.
                </p>
              </section>
            </div>
          </Card>
        </div>

        <div class="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            v-if="currentStep > USER_FORM_WIZARD_STEP.ROLE"
            type="button"
            variant="secondary"
            class="min-h-11 w-full touch-manipulation sm:w-auto"
            @click="goBack"
          >
            Back
          </Button>

          <Button
            v-if="currentStep === USER_FORM_WIZARD_STEP.ROLE"
            type="button"
            variant="ghost"
            class="min-h-11 w-full touch-manipulation sm:order-first sm:w-auto"
            @click="cancelForm"
          >
            Cancel
          </Button>

          <div class="flex flex-1 gap-3 sm:justify-end">
            <Button
              v-if="currentStep < totalSteps"
              type="submit"
              variant="primary"
              class="min-h-11 flex-1 touch-manipulation sm:flex-none"
            >
              Next
            </Button>
            <Button
              v-else
              type="submit"
              variant="primary"
              class="min-h-11 flex-1 touch-manipulation sm:flex-none"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              Create user
            </Button>
          </div>
        </div>

        <button
          v-if="currentStep > USER_FORM_WIZARD_STEP.ROLE"
          type="button"
          class="mt-3 min-h-11 rounded text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation sm:mt-2 sm:min-h-0"
          :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          @click="cancelForm"
        >
          Cancel
        </button>

        <p v-if="successMessage" class="mt-4 text-sm font-medium text-success">
          {{ successMessage }}
        </p>
      </form>
    </div>
  </div>
</template>
