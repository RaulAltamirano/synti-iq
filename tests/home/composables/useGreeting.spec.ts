import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, ref } from 'vue';

import { useGreeting } from '@/modules/home/composables/useGreeting';

describe('useGreeting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mountGreeting = (firstName?: ReturnType<typeof ref<string | null>>) => {
    const app = createApp(
      defineComponent({
        setup() {
          const { greeting } = useGreeting(firstName);
          return () => h('span', greeting.value);
        },
      })
    );
    const el = document.createElement('div');
    document.body.appendChild(el);
    app.mount(el);
    return {
      el,
      getGreeting: () => el.textContent,
      unmount: () => {
        app.unmount();
        el.remove();
      },
    };
  };

  describe('with firstName', () => {
    it('returns "Good morning, John" in morning (before 12)', () => {
      vi.setSystemTime(new Date('2024-01-15T08:00:00'));
      const wrapper = mountGreeting(ref('John'));
      expect(wrapper.getGreeting()).toBe('Good morning, John');
      wrapper.unmount();
    });

    it('returns "Good afternoon, Jane" in afternoon (12-18)', () => {
      vi.setSystemTime(new Date('2024-01-15T14:00:00'));
      const wrapper = mountGreeting(ref('Jane'));
      expect(wrapper.getGreeting()).toBe('Good afternoon, Jane');
      wrapper.unmount();
    });

    it('returns "Good evening, Alex" in evening (19+)', () => {
      vi.setSystemTime(new Date('2024-01-15T20:00:00'));
      const wrapper = mountGreeting(ref('Alex'));
      expect(wrapper.getGreeting()).toBe('Good evening, Alex');
      wrapper.unmount();
    });

    it('treats generic placeholder first names as absent (e.g. System)', () => {
      vi.setSystemTime(new Date('2024-01-15T08:00:00'));
      const wrapper = mountGreeting(ref('System'));
      expect(wrapper.getGreeting()).toBe('Good morning.');
      wrapper.unmount();
    });
  });

  describe('without firstName', () => {
    it('returns "Good morning." when firstName is undefined', () => {
      vi.setSystemTime(new Date('2024-01-15T08:00:00'));
      const wrapper = mountGreeting(undefined);
      expect(wrapper.getGreeting()).toBe('Good morning.');
      wrapper.unmount();
    });

    it('returns "Good afternoon." when firstName is null', () => {
      vi.setSystemTime(new Date('2024-01-15T14:00:00'));
      const wrapper = mountGreeting(ref(null));
      expect(wrapper.getGreeting()).toBe('Good afternoon.');
      wrapper.unmount();
    });

    it('returns "Good evening." when firstName is empty string', () => {
      vi.setSystemTime(new Date('2024-01-15T20:00:00'));
      const wrapper = mountGreeting(ref(''));
      expect(wrapper.getGreeting()).toBe('Good evening.');
      wrapper.unmount();
    });

    it('returns "Good morning." when firstName is only whitespace', () => {
      vi.setSystemTime(new Date('2024-01-15T08:00:00'));
      const wrapper = mountGreeting(ref('   '));
      expect(wrapper.getGreeting()).toBe('Good morning.');
      wrapper.unmount();
    });
  });
});
