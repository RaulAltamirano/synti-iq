import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Toggle from './Toggle.vue';

describe('Toggle', () => {
  it('does not use <label> as wrapper — buttons must not be wrapped in labels', () => {
    const wrapper = mount(Toggle, { props: { modelValue: false, label: 'Enable' } });
    expect(wrapper.find('label').exists()).toBe(false);
  });

  it('button aria-labelledby points to the label span id when label is given', () => {
    const wrapper = mount(Toggle, { props: { modelValue: false, label: 'Enable notifications' } });
    const span = wrapper.find('[id]');
    const button = wrapper.find('[role="switch"]');
    expect(span.exists()).toBe(true);
    expect(button.attributes('aria-labelledby')).toBe(span.attributes('id'));
  });

  it('uses aria-label="Toggle" when no label prop is provided', () => {
    const wrapper = mount(Toggle, { props: { modelValue: false } });
    const button = wrapper.find('[role="switch"]');
    expect(button.attributes('aria-label')).toBe('Toggle');
    expect(button.attributes('aria-labelledby')).toBeUndefined();
  });

  it('emits update:modelValue with toggled value on click', async () => {
    const wrapper = mount(Toggle, { props: { modelValue: false } });
    await wrapper.find('[role="switch"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
  });

  it('does not emit when disabled', async () => {
    const wrapper = mount(Toggle, { props: { modelValue: false, disabled: true } });
    await wrapper.find('[role="switch"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('reflects modelValue in aria-checked', () => {
    const wrapper = mount(Toggle, { props: { modelValue: true } });
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('true');
  });
});
