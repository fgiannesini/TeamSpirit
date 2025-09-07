import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import DeveloperCard from './developer-card.vue';

describe('DeveloperCard', () => {
  test('Should render', () => {
    const wrapper = mount(DeveloperCard);
    expect(wrapper.exists()).toBe(true);
  });

  const createWrapper = (): VueWrapper => {
    return mount(DeveloperCard);
  };

  test('Should have a button to remove the developer', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=remove-button]').isVisible()).toBe(true);
  });

  test('Should send a remove event on click on remove button', () => {
    const wrapper = createWrapper();
    const button = wrapper.get('[data-testid=remove-button]');
    button.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('remove');
  });

  test('Should render a range to select experience', () => {
    const wrapper = createWrapper();
    const range = wrapper.get('[data-testid=experience-range]');
    expect(range.isVisible()).toBe(true);
  });

  test('Should have the tooltip rendered', () => {
    const wrapper = createWrapper();
    const tooltip = wrapper.get('[data-testid=experience-range-tooltip]');
    expect(tooltip.isVisible()).toBe(true);
  });
});
