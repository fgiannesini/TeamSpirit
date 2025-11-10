import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import DoubleSlider from './double-slider.vue';

describe('Double slider', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(DoubleSlider);
  };

  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });
});
