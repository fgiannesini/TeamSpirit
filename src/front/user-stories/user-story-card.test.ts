import { flushPromises, shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import RemoveButton from '../remove-button.vue';
import Slider from '../slider.vue';
import UserStoryCard from './user-story-card.vue';

describe('User Story Card', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(UserStoryCard, {
      props: {
        id: 1,
        complexity: 3,
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
      const slider = wrapper.getComponent(Slider);
      expect(slider.props()).toStrictEqual({
        min: 1,
        max: 10,
        value: 3,
      });
    });

    test('Should send an update event on complexity change', async () => {
      const wrapper = createWrapper();
      const slider = wrapper.getComponent(Slider);
      slider.vm.$emit('update:value', 2);
      await flushPromises();

      const emitted = wrapper.emitted('update:complexity');
      expect(emitted?.[0]).toStrictEqual([2]);
    });
  });
});
