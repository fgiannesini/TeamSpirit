import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Slider from './slider.vue';

describe('Slider', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(Slider);
  };

  it('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });
});
