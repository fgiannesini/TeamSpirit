import {flushPromises, shallowMount, type VueWrapper} from '@vue/test-utils';
import {describe, expect, test} from 'vitest';
import RemoveButton from '../shared/remove-button.vue';
import type Slider from '../shared/slider.vue';
import UserStoryCard from './user-story-card.vue';

describe('User Story Card', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(UserStoryCard, {
      props: {
        id: 1,
        complexity: 3,
        reviewComplexity: 2,
        priority: 5,
      },
    });
  };

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should have a title', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=title]').text()).toBe('User story 1');
  });

  test('Should have a button to remove the user story', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent(RemoveButton).exists()).toBe(true);
  });

  test('Should send a remove event on click on remove button', () => {
    const wrapper = createWrapper();
    const button = wrapper.getComponent(RemoveButton);
    button.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('remove');
  });

  describe('Complexity', () => {
    test('Should have a label', () => {
      const wrapper = createWrapper();
      const label = wrapper.get('[data-testid=complexity-label]');
      expect(label.text()).toBe('Complexity');
    });

    test('Should bind slider properties', () => {
      const wrapper = createWrapper();
      const slider = wrapper.getComponent<typeof Slider>(
        '[data-testid=complexity-slider]',
      );
      expect(slider.props()).toStrictEqual({
        min: 1,
        max: 10,
        value: 3,
      });
    });

    test('Should send an update event on complexity change', async () => {
      const wrapper = createWrapper();
      const slider = wrapper.getComponent<typeof Slider>(
        '[data-testid=complexity-slider]',
      );
      slider.vm.$emit('update:value', 2);
      await flushPromises();

      const emitted = wrapper.emitted('update:complexity');
      expect(emitted?.[0]).toStrictEqual([2]);
    });
  });

  describe('Review complexity', () => {
    test('Should have a label', () => {
      const wrapper = createWrapper();
      const label = wrapper.get('[data-testid=review-complexity-label]');
      expect(label.text()).toBe('Review complexity');
    });

    test('Should bind slider properties', () => {
      const wrapper = createWrapper();
      const slider = wrapper.getComponent<typeof Slider>(
        '[data-testid=review-complexity-slider]',
      );
      expect(slider.props()).toStrictEqual({
        min: 1,
        max: 10,
        value: 2,
      });
    });

    test('Should send an update event on review complexity change', async () => {
      const wrapper = createWrapper();
      const slider = wrapper.getComponent<typeof Slider>(
        '[data-testid=review-complexity-slider]',
      );
      slider.vm.$emit('update:value', 1);
      await flushPromises();

      const emitted = wrapper.emitted('update:review-complexity');
      expect(emitted?.[0]).toStrictEqual([1]);
    });
  });

  describe('Priority', () => {
    test('Should have a label', () => {
      const wrapper = createWrapper();
      const label = wrapper.get('[data-testid=priority-label]');
      expect(label.text()).toBe('Priority');
    });

    test('Should bind slider properties', () => {
      const wrapper = createWrapper();
      const slider = wrapper.getComponent<typeof Slider>(
        '[data-testid=priority-slider]',
      );
      expect(slider.props()).toStrictEqual({
        min: 1,
        max: 10,
        value: 5,
      });
    });

    test('Should send an update event on priority change', async () => {
      const wrapper = createWrapper();
      const slider = wrapper.getComponent<typeof Slider>(
        '[data-testid=priority-slider]',
      );
      slider.vm.$emit('update:value', 1);
      await flushPromises();

      const emitted = wrapper.emitted('update:priority');
      expect(emitted?.[0]).toStrictEqual([1]);
    });
  });
});
