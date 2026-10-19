import type { Ref } from 'vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';

/** OAuth / seed accounts often use these; skip personalization. */
const PLACEHOLDER_FIRST_NAMES = new Set(
  ['system', 'user', 'admin', 'guest', 'test', 'usuario', 'default'].map((s) => s.toLowerCase())
);

function resolveDisplayFirstName(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  if (PLACEHOLDER_FIRST_NAMES.has(trimmed.toLowerCase())) return null;
  return trimmed;
}

export function useGreeting(firstName?: Ref<string | null | undefined>) {
  const currentHour = ref(new Date().getHours());
  let intervalId: number | null = null;

  const greetingPrefix = computed(() =>
    currentHour.value < 12
      ? 'Good morning'
      : currentHour.value < 19
        ? 'Good afternoon'
        : 'Good evening'
  );

  const displayName = computed(() => resolveDisplayFirstName(firstName?.value));

  /** Full phrase for tests, analytics, or `aria-label` when needed */
  const greeting = computed(() => {
    const base = greetingPrefix.value;
    const name = displayName.value;
    if (name) return `${base}, ${name}`;
    return `${base}.`;
  });

  const adaptiveGradient = computed(() => {
    const gradients = {
      morning: 'bg-gradient-to-r from-yellow-300 via-orange-400 to-rose-300',
      afternoon: 'bg-gradient-to-r from-blue-400 via-sky-500 to-teal-400',
      evening: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500',
    };

    const isMorning = currentHour.value < 12;
    const isAfternoon = currentHour.value >= 12 && currentHour.value < 19;

    const timeKey = isMorning ? 'morning' : isAfternoon ? 'afternoon' : 'evening';

    return gradients[timeKey];
  });

  onMounted(() => {
    const updateHour = () => (currentHour.value = new Date().getHours());
    intervalId = window.setInterval(updateHour, 60000);
  });

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  });

  return {
    currentHour,
    greetingPrefix,
    displayName,
    greeting,
    adaptiveGradient,
  };
}
