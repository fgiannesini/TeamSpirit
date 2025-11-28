import { flushPromises, shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import RemoveButton from '../remove-button.vue';
import Slider from '../slider.vue';
import DeveloperCard from './developer-card.vue';

describe('DeveloperCard', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(DeveloperCard, {
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
    expect(wrapper.findComponent(RemoveButton).exists()).toBe(true);
  });

  test('Should send a remove event on click on remove button', () => {
    const wrapper = createWrapper();
    const button = wrapper.getComponent(RemoveButton);
    button.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('remove');
  });

  describe('Experience', () => {
    test('Should have a label', () => {
      const wrapper = createWrapper();
      const label = wrapper.get('[data-testid=experience-label]');
      expect(label.text()).toBe('Experience');
    });

    test('Should bind slider properties', () => {
      const wrapper = createWrapper();
      const slider = wrapper.getComponent(Slider);
      expect(slider.props()).toStrictEqual({
        min: 1,
        max: 7,
        value: 4,
      });
    });

    test('Should send an update event on experience change', async () => {
      const wrapper = createWrapper();
      const slider = wrapper.getComponent(Slider);
      slider.vm.$emit('update:value', 2);
      await flushPromises();

      const emitted = wrapper.emitted('update:experience');
      expect(emitted?.[0]).toStrictEqual([2]);
    });
  });
});
