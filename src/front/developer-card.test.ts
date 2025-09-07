import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import DeveloperCard from './developer-card.vue';

describe('DeveloperCard', () => {
  test('Should render', () => {
    const wrapper = mount(DeveloperCard);
    expect(wrapper.exists()).toBe(true);
  });

  test('Should have a button to remove the developer', () => {
    const wrapper = mount(DeveloperCard);
    expect(
      wrapper.get('[data-testid=remove-developer-button]').isVisible(),
    ).toBe(true);
  });
});
