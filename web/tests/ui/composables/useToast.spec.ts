import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useToast } from '@/modules/ui/composables/useToast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToast().hide();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('show sets message and visible', () => {
    const { state, show } = useToast();
    show({ message: 'Hello' });
    expect(state.value.visible).toBe(true);
    expect(state.value.message).toBe('Hello');
  });

  it('hide clears visible', () => {
    const { state, show, hide } = useToast();
    show({ message: 'x' });
    hide();
    expect(state.value.visible).toBe(false);
  });

  it('success uses success variant', () => {
    const { state, success } = useToast();
    success('Done');
    expect(state.value.variant).toBe('success');
    expect(state.value.message).toBe('Done');
  });

  it('error uses error variant', () => {
    const { state, error } = useToast();
    error('Failed');
    expect(state.value.variant).toBe('error');
  });

  it('auto hides after duration', () => {
    const { state, show } = useToast();
    show({ message: 'x', duration: 1000 });
    expect(state.value.visible).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(state.value.visible).toBe(false);
  });

  it('does not auto hide when duration is 0', () => {
    const { state, show } = useToast();
    show({ message: 'stay', duration: 0 });
    expect(state.value.visible).toBe(true);
    vi.advanceTimersByTime(60_000);
    expect(state.value.visible).toBe(true);
  });
});
