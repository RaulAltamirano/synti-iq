import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Pagination from './Pagination.vue';

describe('Pagination', () => {
  it('renders a nav with aria-label=Pagination', () => {
    const wrapper = mount(Pagination, { props: { modelValue: 1, totalPages: 5 } });
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Pagination');
  });

  it('page buttons have aria-label="Page N"', () => {
    const wrapper = mount(Pagination, { props: { modelValue: 1, totalPages: 3 } });
    const pageBtn = wrapper.findAll('button').find((b) => b.attributes('aria-label') === 'Page 1');
    expect(pageBtn).toBeDefined();
  });

  it('current page button has aria-current=page', () => {
    const wrapper = mount(Pagination, { props: { modelValue: 2, totalPages: 5 } });
    const currentBtn = wrapper
      .findAll('button')
      .find((b) => b.attributes('aria-current') === 'page');
    expect(currentBtn).toBeDefined();
    expect(currentBtn?.attributes('aria-label')).toBe('Page 2');
  });

  it('ellipsis buttons have descriptive aria-label', () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 5, totalPages: 10, maxPagesToShow: 3 },
    });
    const buttons = wrapper.findAll('button');
    const ellipsisBtns = buttons.filter((b) => b.text() === '...');
    ellipsisBtns.forEach((btn) => {
      expect(btn.attributes('aria-label')).toBeTruthy();
      expect(btn.attributes('aria-label')).not.toBe('');
    });
  });

  it('emits update:modelValue when page clicked', async () => {
    const wrapper = mount(Pagination, { props: { modelValue: 1, totalPages: 5 } });
    const nextBtn = wrapper.find('button[aria-label="Next page"]');
    await nextBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2]);
  });

  it('First/Previous buttons are disabled on page 1', () => {
    const wrapper = mount(Pagination, { props: { modelValue: 1, totalPages: 5 } });
    const firstBtn = wrapper.find('button[aria-label="First page"]');
    expect(firstBtn.attributes('disabled')).toBeDefined();
  });
});
