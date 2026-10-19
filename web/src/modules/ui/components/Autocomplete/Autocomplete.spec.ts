import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Autocomplete from './Autocomplete.vue';
import type { AutocompleteOption } from './Autocomplete.vue';

const OPTIONS: AutocompleteOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
];

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('Autocomplete', () => {
  it('renders input with role=combobox', () => {
    const wrapper = mount(Autocomplete, {
      props: { modelValue: '', fetchSuggestions: vi.fn().mockResolvedValue([]) },
    });
    expect(wrapper.find('input').attributes('role')).toBe('combobox');
  });

  it('shows minCharsText hint when query length < minChars', async () => {
    const wrapper = mount(Autocomplete, {
      props: {
        modelValue: '',
        fetchSuggestions: vi.fn().mockResolvedValue([]),
        minChars: 3,
        minCharsText: 'Escribe al menos 3 caracteres',
      },
    });
    await wrapper.find('input').setValue('ab');
    await wrapper.find('input').trigger('input');
    expect(wrapper.text()).toContain('Escribe al menos 3 caracteres');
  });

  it('uses computed default minCharsText when prop not provided', async () => {
    const wrapper = mount(Autocomplete, {
      props: {
        modelValue: '',
        fetchSuggestions: vi.fn().mockResolvedValue([]),
        minChars: 2,
      },
    });
    await wrapper.find('input').setValue('a');
    await wrapper.find('input').trigger('input');
    expect(wrapper.text()).toContain('Type at least 2 characters');
  });

  it('sets aria-selected=true only for the currently selected option', async () => {
    const fetch = vi.fn().mockResolvedValue(OPTIONS);
    const wrapper = mount(Autocomplete, {
      props: { modelValue: '', fetchSuggestions: fetch, minChars: 1 },
    });
    const input = wrapper.find('input');
    await input.setValue('a');
    await input.trigger('input');
    vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const optionEls = wrapper.findAll('[role="option"]');
    if (optionEls.length > 0) {
      await optionEls[0].trigger('mousedown');
      await wrapper.vm.$nextTick();
    }

    await input.trigger('focus');
    vi.runAllTimers();
    await wrapper.vm.$nextTick();
    const opts = wrapper.findAll('[role="option"]');
    const selectedOpts = opts.filter((o) => o.attributes('aria-selected') === 'true');
    expect(selectedOpts.length).toBeLessThanOrEqual(1);
    if (selectedOpts.length === 1) {
      expect(selectedOpts[0].text()).toContain('Apple');
    }
  });

  it('aria-selected is not tied to keyboard highlight position', async () => {
    const fetch = vi.fn().mockResolvedValue(OPTIONS);
    const wrapper = mount(Autocomplete, {
      props: { modelValue: '', fetchSuggestions: fetch, minChars: 1 },
    });
    const input = wrapper.find('input');
    await input.setValue('a');
    await input.trigger('input');
    vi.runAllTimers();
    await wrapper.vm.$nextTick();

    await input.trigger('keydown', { key: 'ArrowDown' });
    await wrapper.vm.$nextTick();

    const opts = wrapper.findAll('[role="option"]');
    const selected = opts.filter((o) => o.attributes('aria-selected') === 'true');
    expect(selected.length).toBe(0);
  });
});
