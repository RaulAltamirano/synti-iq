<script lang="ts" src="./StoreScheduleEditor.ts" />

<template>
  <div class="store-schedule-editor flex flex-col gap-6 sm:gap-8">
    <!-- Validation error -->
    <p
      v-if="validationError"
      class="store-schedule-editor__error text-sm text-error py-1"
      role="alert"
      aria-live="polite"
    >
      {{ validationError }}
    </p>

    <!-- Quick apply -->
    <div class="store-schedule-editor__section">
      <p class="text-sm font-medium mb-3" :class="labelClasses">Same hours for several days</p>
      <div class="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          class="min-h-[44px] min-w-[44px] touch-manipulation px-4"
          :disabled="disabled"
          @click="openQuickApply('weekdays')"
        >
          Mon–Fri
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          class="min-h-[44px] min-w-[44px] touch-manipulation px-4"
          :disabled="disabled"
          @click="openQuickApply('weekends')"
        >
          Sat–Sun
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          class="min-h-[44px] min-w-[44px] touch-manipulation px-4"
          :disabled="disabled"
          @click="openQuickApply('all')"
        >
          All days
        </Button>
      </div>
    </div>

    <!-- Quick apply panel (when open) -->
    <div
      v-if="showQuickApply && quickApplyTarget"
      class="store-schedule-editor__quick-apply p-4 sm:p-5 rounded-xl border flex flex-col gap-4"
      :class="quickApplyPanelClasses"
    >
      <p class="text-sm" :class="quickApplyTextClasses">
        {{ quickApplyTargetLabel }}
      </p>
      <div class="grid grid-cols-2 gap-4">
        <Input
          v-model="quickApplyOpen"
          type="time"
          label="Open"
          full-width
          name="quick-apply-open"
        />
        <Input
          v-model="quickApplyClose"
          type="time"
          label="Close"
          full-width
          name="quick-apply-close"
        />
      </div>
      <div class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          class="min-h-[44px] w-full sm:w-auto touch-manipulation"
          @click="cancelQuickApply"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          class="min-h-[44px] w-full sm:w-auto touch-manipulation"
          @click="submitQuickApply"
        >
          Apply
        </Button>
      </div>
    </div>

    <!-- Schedule per day -->
    <div class="store-schedule-editor__section">
      <p class="text-sm font-medium mb-4" :class="labelClasses">Schedule per day</p>
      <div class="flex flex-col gap-3 sm:gap-4">
        <div
          v-for="row in modelValue.scheduleRows"
          :key="row.dayOfWeek"
          class="store-schedule-editor__day rounded-xl border p-4 sm:p-4 transition-colors"
          :class="[
            dayRowClasses,
            row.enabled
              ? 'store-schedule-editor__day--open'
              : ['border-l-4', dayRowDisabledBorderClasses],
          ]"
        >
          <!-- Day name + status indicator + toggle (stack on mobile, row on sm+) -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div class="flex items-center gap-2 shrink-0">
              <span
                class="shrink-0 w-2.5 h-2.5 rounded-full ring-2"
                :class="[statusIndicatorClasses, { [statusIndicatorBgClasses]: !row.enabled }]"
                :style="{ backgroundColor: row.enabled ? '#22c55e' : undefined }"
                :title="row.enabled ? 'Open' : 'Closed'"
                aria-hidden="true"
              />
              <span class="text-sm font-medium" :class="labelClasses">
                {{ dayLabels[row.dayOfWeek] }}
              </span>
            </div>
            <Toggle
              :model-value="row.enabled"
              :disabled="disabled"
              :label="row.enabled ? 'Open' : 'Closed'"
              label-position="left"
              class="min-h-[44px] touch-manipulation w-fit shrink-0"
              @update:model-value="toggleDay(row.dayOfWeek)"
            />
          </div>
          <!-- Open / Close times -->
          <div
            class="grid grid-cols-2 gap-3 sm:gap-4"
            :class="{ 'pointer-events-none': !row.enabled }"
          >
            <Input
              :model-value="row.openTimeHHMM"
              type="time"
              label="Open"
              :disabled="disabled || !row.enabled"
              full-width
              :name="`schedule-${row.dayOfWeek}-open`"
              :error="
                row.enabled &&
                !!row.openTimeHHMM &&
                !!row.closeTimeHHMM &&
                timeInvalid(row.openTimeHHMM, row.closeTimeHHMM)
              "
              :aria-invalid="
                row.enabled &&
                !!row.openTimeHHMM &&
                !!row.closeTimeHHMM &&
                timeInvalid(row.openTimeHHMM, row.closeTimeHHMM)
              "
              @update:model-value="setTime(row.dayOfWeek, 'openTimeHHMM', $event)"
            />
            <Input
              :model-value="row.closeTimeHHMM"
              type="time"
              label="Close"
              :disabled="disabled || !row.enabled"
              full-width
              :name="`schedule-${row.dayOfWeek}-close`"
              :error="
                row.enabled &&
                !!row.openTimeHHMM &&
                !!row.closeTimeHHMM &&
                timeInvalid(row.openTimeHHMM, row.closeTimeHHMM)
              "
              :aria-invalid="
                row.enabled &&
                !!row.openTimeHHMM &&
                !!row.closeTimeHHMM &&
                timeInvalid(row.openTimeHHMM, row.closeTimeHHMM)
              "
              @update:model-value="setTime(row.dayOfWeek, 'closeTimeHHMM', $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div
      v-if="enabledRows.length > 0"
      class="store-schedule-editor__summary p-4 sm:p-5 rounded-xl border"
      :class="summaryPanelClasses"
    >
      <h4 class="text-sm font-medium mb-3" :class="labelClasses">Summary</h4>
      <ul class="space-y-2 text-sm" :class="summaryTextClasses">
        <li
          v-for="row in enabledRows"
          :key="row.dayOfWeek"
          class="flex justify-between items-baseline gap-3"
        >
          <span>{{ dayLabels[row.dayOfWeek] }}</span>
          <span class="tabular-nums font-medium shrink-0" :class="summaryValueClasses">
            {{ row.openTimeHHMM }} – {{ row.closeTimeHHMM }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.store-schedule-editor {
  min-width: 0; /* allow flex children to shrink on mobile */
}
.store-schedule-editor__day--open {
  border-left-width: 4px;
  border-left-color: #22c55e;
  background-color: rgba(34, 197, 94, 0.08);
}
:global(.dark) .store-schedule-editor__day--open {
  background-color: rgba(34, 197, 94, 0.15);
}
.store-schedule-editor__day .pointer-events-none input {
  cursor: not-allowed;
}
</style>
