import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import DeveloperCard from './developer-card.vue';

describe('DeveloperCard', () => {
  const createWrapper = (): VueWrapper => {
    return mount(DeveloperCard, {
      props: {
        id: 1,
        experience: 4,
      },
    });
  };

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should have a title', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=title]').text()).toBe('Developer 1');
  });

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

  describe('Experience', () => {
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

    test('Should have a label', () => {
      const wrapper = createWrapper();
      const tooltip = wrapper.get('[data-testid=experience-label]');
      expect(tooltip.isVisible()).toBe(true);
    });

    test('Should show minimum of the range', () => {
      const wrapper = createWrapper();
      const minimum = wrapper.get('[data-testid=experience-minimum]');
      expect(minimum.text()).toBe('1');
    });

    test('Should show maximum of the range', () => {
      const wrapper = createWrapper();
      const minimum = wrapper.get('[data-testid=experience-maximum]');
      expect(minimum.text()).toBe('7');
    });

    test('Should bind experience', () => {
      const wrapper = createWrapper();
      const input = wrapper.get<HTMLInputElement>(
        '[data-testid=experience-input]',
      );
      expect(input.element.value).toBe('4');
    });

    test('Should send an update event on experience change', () => {
      const wrapper = createWrapper();
      const input = wrapper.get<HTMLInputElement>(
        '[data-testid=experience-input]',
      );
      input.setValue(2);
      const emitted = wrapper.emitted('update:experience');
      expect(emitted?.[0]).toStrictEqual([2]);
    });
  });
});
