import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Select from './Select.vue';

const OPTIONS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

describe('Select', () => {
  it('renders a button with aria-haspopup=listbox', () => {
    const wrapper = mount(Select, { props: { modelValue: '', options: OPTIONS } });
    expect(wrapper.find('button').attributes('aria-haspopup')).toBe('listbox');
  });

  it('shows aria-expanded=false when closed', () => {
    const wrapper = mount(Select, { props: { modelValue: '', options: OPTIONS } });
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false');
  });

  it('opens dropdown on click and sets aria-expanded=true', async () => {
    const wrapper = mount(Select, { props: { modelValue: '', options: OPTIONS } });
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
  });

  it('closes on Escape', async () => {
    const wrapper = mount(Select, { props: { modelValue: '', options: OPTIONS } });
    await wrapper.find('button').trigger('click');
    await wrapper.find('button').trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it('emits update:modelValue when option clicked', async () => {
    const wrapper = mount(Select, { props: { modelValue: '', options: OPTIONS } });
    await wrapper.find('button').trigger('click');
    const options = wrapper.findAll('[role="option"]');
    await options[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['apple']);
  });

  it('marks selected option with aria-selected=true', async () => {
    const wrapper = mount(Select, { props: { modelValue: 'banana', options: OPTIONS } });
    await wrapper.find('button').trigger('click');
    const selected = wrapper
      .findAll('[role="option"]')
      .find((o) => o.attributes('aria-selected') === 'true');
    expect(selected?.text()).toContain('Banana');
  });

  it('does not emit when disabled option clicked', async () => {
    const opts = [{ label: 'Apple', value: 'apple', disabled: true }];
    const wrapper = mount(Select, { props: { modelValue: '', options: opts } });
    await wrapper.find('button').trigger('click');
    await wrapper.find('[role="option"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});
