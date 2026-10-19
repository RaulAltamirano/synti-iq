import { ref } from 'vue';

import { colors } from '@/modules/ui/tokens/colors';

export interface HeartBurstParticle {
  readonly id: string;
  readonly gradientId: string;
  readonly angle: number;
  readonly distance: number;
  readonly durationMs: number;
  readonly colorFrom: string;
  readonly colorTo: string;
  readonly sizePx: number;
  readonly spin: number;
}

type BurstFamily = 'orange' | 'blue' | 'violet';

function pickTwoDistinctHex(stops: readonly string[]): [string, string] {
  const list = [...stops];
  if (list.length < 2) {
    const only = list[0] ?? '#f59e0b';
    return [only, only];
  }
  const i = Math.floor(Math.random() * list.length);
  let j = Math.floor(Math.random() * list.length);
  while (j === i) {
    j = Math.floor(Math.random() * list.length);
  }
  const a = list[i];
  const b = list[j];
  return Math.random() < 0.5 ? [a, b] : [b, a];
}

/** Random family per particle; each `spawnBurst` call draws a fresh mix. */
function pickFamilyForParticle(): BurstFamily {
  const r = Math.random();
  if (r < 1 / 3) return 'orange';
  if (r < 2 / 3) return 'blue';
  return 'violet';
}

function gradientForFamily(family: BurstFamily): [string, string] {
  switch (family) {
    case 'orange':
      return pickTwoDistinctHex(Object.values(colors.warning));
    case 'blue': {
      const blues = [...new Set([...Object.values(colors.primary), ...Object.values(colors.info)])];
      return pickTwoDistinctHex(blues);
    }
    case 'violet':
      return pickTwoDistinctHex(Object.values(colors.violet));
    default: {
      const _exhaustive: never = family;
      return _exhaustive;
    }
  }
}

function buildParticle(burstId: number, index: number): HeartBurstParticle {
  const baseAngle = Math.PI + (Math.random() * Math.PI) / 2;
  const jitter = (Math.random() - 0.5) * 0.95;
  const angle = baseAngle + jitter;
  const distance = 36 + Math.random() * 78;
  const family = pickFamilyForParticle();
  const [colorFrom, colorTo] = gradientForFamily(family);

  return {
    id: `${burstId}-${index}`,
    gradientId: `hb-grad-${burstId}-${index}`,
    angle,
    distance,
    durationMs: 820 + Math.random() * 520,
    colorFrom,
    colorTo,
    sizePx: Math.round(12 + Math.random() * 13),
    spin: (Math.random() - 0.5) * 240,
  };
}

export function useHeartBurst() {
  const particles = ref<HeartBurstParticle[]>([]);
  let seq = 0;

  function spawnBurst(count = 14): void {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const burstId = ++seq;
    const batch: HeartBurstParticle[] = [];
    for (let i = 0; i < count; i += 1) {
      batch.push(buildParticle(burstId, i));
    }
    particles.value = [...particles.value, ...batch];
    const maxMs = Math.max(...batch.map((b) => b.durationMs)) + 150;
    window.setTimeout(() => {
      const remove = new Set(batch.map((b) => b.id));
      particles.value = particles.value.filter((p) => !remove.has(p.id));
    }, maxMs);
  }

  return { particles, spawnBurst };
}

export function burstMotionVars(p: HeartBurstParticle): Record<string, string> {
  const tx = Math.cos(p.angle) * p.distance;
  const ty = Math.sin(p.angle) * p.distance;
  return {
    '--hb-tx': `${tx.toFixed(1)}px`,
    '--hb-ty': `${ty.toFixed(1)}px`,
    '--hb-dur': `${p.durationMs}ms`,
    '--hb-spin': `${p.spin.toFixed(1)}deg`,
  };
}
