/**
 * StoreScheduleEditor – UI for editing store opening hours per day.
 * Used in the store creation wizard (step 3).
 *
 * @props modelValue - { scheduleTimezone, scheduleRows }; v-model binding
 * @props disabled - when true, all controls are disabled (e.g. when step !== 3)
 * @props validationError - message shown when parent validation fails (e.g. open >= close)
 * @emits update:modelValue - when timezone or schedule data changes
 */

import { ref, computed } from 'vue';
import { useTheme } from '@/modules/shared/composables/useTheme';
import { Button, Input, Toggle } from '@/modules/ui';
import {
  applyScheduleToDays,
  setScheduleTime,
  toggleScheduleDay,
} from '@/modules/store/composables/useStoreScheduleForm';
import { DAY_LABELS, DAYS_OF_WEEK } from '@/modules/store/constants/schedule.constants';
import type { DayOfWeek, StoreScheduleFormRow } from '@/modules/store/types/store-form.types';

export interface StoreScheduleModelValue {
  scheduleTimezone: string;
  scheduleRows: StoreScheduleFormRow[];
}

const WEEKDAY_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const WEEKEND_DAYS: DayOfWeek[] = ['saturday', 'sunday'];

export default {
  name: 'StoreScheduleEditor',
  components: {
    Button,
    Input,
    Toggle,
  },
  props: {
    modelValue: {
      type: Object as () => StoreScheduleModelValue,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    /** When set, this error message is shown (e.g. from parent validation). */
    validationError: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(
    props: { modelValue: StoreScheduleModelValue; disabled: boolean; validationError: string },
    { emit }: { emit: (e: 'update:modelValue', v: StoreScheduleModelValue) => void }
  ) {
    const { isDark } = useTheme();

    function commitScheduleRows(scheduleRows: StoreScheduleFormRow[]): void {
      emit('update:modelValue', {
        scheduleTimezone: props.modelValue.scheduleTimezone,
        scheduleRows,
      });
    }

    function toggleDay(dayOfWeek: DayOfWeek): void {
      commitScheduleRows(toggleScheduleDay(props.modelValue.scheduleRows, dayOfWeek));
    }

    function setTime(
      dayOfWeek: DayOfWeek,
      field: 'openTimeHHMM' | 'closeTimeHHMM',
      value: string
    ): void {
      commitScheduleRows(setScheduleTime(props.modelValue.scheduleRows, dayOfWeek, field, value));
    }

    const showQuickApply = ref(false);
    const quickApplyTarget = ref<'weekdays' | 'weekends' | 'all' | null>(null);
    const quickApplyOpen = ref('09:00');
    const quickApplyClose = ref('18:00');

    const dayLabels = DAY_LABELS;

    const enabledRows = computed(() => props.modelValue.scheduleRows.filter((r) => r.enabled));

    const quickApplyTargetLabel = computed(() => {
      const t = quickApplyTarget.value;
      if (t === 'weekdays') return 'Set the same hours for Monday–Friday.';
      if (t === 'weekends') return 'Set the same hours for Saturday and Sunday.';
      if (t === 'all') return 'Set the same hours for every day.';
      return '';
    });

    function openQuickApply(target: 'weekdays' | 'weekends' | 'all') {
      quickApplyTarget.value = target;
      const first = props.modelValue.scheduleRows.find((r) => r.enabled);
      if (first) {
        quickApplyOpen.value = first.openTimeHHMM;
        quickApplyClose.value = first.closeTimeHHMM;
      } else {
        quickApplyOpen.value = '09:00';
        quickApplyClose.value = '18:00';
      }
      showQuickApply.value = true;
    }

    function submitQuickApply() {
      const target = quickApplyTarget.value;
      if (!target) return;
      const open = quickApplyOpen.value;
      const close = quickApplyClose.value;
      if (!open || !close) return;
      if (target === 'weekdays') {
        commitScheduleRows(
          applyScheduleToDays(props.modelValue.scheduleRows, WEEKDAY_DAYS, open, close)
        );
      } else if (target === 'weekends') {
        commitScheduleRows(
          applyScheduleToDays(props.modelValue.scheduleRows, WEEKEND_DAYS, open, close)
        );
      } else {
        commitScheduleRows(
          applyScheduleToDays(props.modelValue.scheduleRows, [...DAYS_OF_WEEK], open, close)
        );
      }
      showQuickApply.value = false;
      quickApplyTarget.value = null;
    }

    function cancelQuickApply() {
      showQuickApply.value = false;
      quickApplyTarget.value = null;
    }

    /** True if open time is not before close time (invalid for that row). */
    function timeInvalid(openHHMM: string, closeHHMM: string): boolean {
      if (!openHHMM || !closeHHMM) return false;
      const [oh, om] = openHHMM.split(':').map(Number);
      const [ch, cm] = closeHHMM.split(':').map(Number);
      const openMins = oh * 60 + om;
      const closeMins = ch * 60 + cm;
      return openMins >= closeMins;
    }

    const labelClasses = computed(() => (isDark.value ? 'text-gray-300' : 'text-gray-700'));
    const quickApplyPanelClasses = computed(() =>
      isDark.value ? 'border-gray-600 bg-gray-700/40' : 'border-gray-200 bg-gray-50'
    );
    const quickApplyTextClasses = computed(() =>
      isDark.value ? 'text-gray-400' : 'text-gray-600'
    );
    const dayRowClasses = computed(() => (isDark.value ? 'border-gray-600' : 'border-gray-200'));
    const dayRowDisabledBorderClasses = computed(() =>
      isDark.value ? 'border-l-gray-500' : 'border-l-gray-400'
    );
    const statusIndicatorClasses = computed(() => (isDark.value ? 'ring-gray-800' : 'ring-white'));
    const statusIndicatorBgClasses = computed(() => (isDark.value ? 'bg-gray-500' : 'bg-gray-400'));
    const summaryPanelClasses = computed(() =>
      isDark.value ? 'border-gray-600 bg-gray-700/40' : 'border-gray-200 bg-gray-50'
    );
    const summaryTextClasses = computed(() => (isDark.value ? 'text-gray-400' : 'text-gray-600'));
    const summaryValueClasses = computed(() => (isDark.value ? 'text-gray-300' : 'text-gray-700'));

    return {
      toggleDay,
      setTime,
      dayLabels,
      labelClasses,
      quickApplyPanelClasses,
      quickApplyTextClasses,
      dayRowClasses,
      dayRowDisabledBorderClasses,
      statusIndicatorClasses,
      statusIndicatorBgClasses,
      summaryPanelClasses,
      summaryTextClasses,
      summaryValueClasses,
      enabledRows,
      showQuickApply,
      quickApplyTarget,
      quickApplyOpen,
      quickApplyClose,
      openQuickApply,
      submitQuickApply,
      cancelQuickApply,
      timeInvalid,
      quickApplyTargetLabel,
    };
  },
};
