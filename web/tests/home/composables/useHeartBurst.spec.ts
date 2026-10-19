import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { burstMotionVars, useHeartBurst } from '@/modules/home/composables/useHeartBurst';

describe('useHeartBurst', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('spawnBurst appends particles with gradient ids', () => {
    const { particles, spawnBurst } = useHeartBurst();
    spawnBurst(4);
    expect(particles.value).toHaveLength(4);
    expect(particles.value[0].gradientId).toMatch(/^hb-grad-/);
    expect(particles.value[0].colorFrom).toMatch(/^#/);
    expect(particles.value[0].colorTo).toMatch(/^#/);
  });

  it('spawnBurst does nothing when reduced motion is preferred', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
    const { particles, spawnBurst } = useHeartBurst();
    spawnBurst(5);
    expect(particles.value).toHaveLength(0);
  });

  it('removes particles after max duration', () => {
    const { particles, spawnBurst } = useHeartBurst();
    spawnBurst(2);
    expect(particles.value).toHaveLength(2);
    const maxDur = Math.max(...particles.value.map((p) => p.durationMs)) + 150;
    vi.advanceTimersByTime(maxDur);
    expect(particles.value).toHaveLength(0);
  });
});

describe('burstMotionVars', () => {
  it('maps particle to CSS custom properties', () => {
    const p = {
      id: '1-0',
      gradientId: 'hb-grad-1-0',
      angle: 0,
      distance: 10,
      durationMs: 1000,
      colorFrom: '#000000',
      colorTo: '#ffffff',
      sizePx: 12,
      spin: 90,
    };
    const vars = burstMotionVars(p);
    expect(vars['--hb-dur']).toBe('1000ms');
    expect(vars['--hb-spin']).toBe('90.0deg');
    expect(vars['--hb-tx']).toBe('10.0px');
    expect(vars['--hb-ty']).toBe('0.0px');
  });
});
