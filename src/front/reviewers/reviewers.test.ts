import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Slider from '../slider.vue';
import Reviewers from './reviewers.vue';

describe('Reviewers', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(Reviewers);
  };
  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should render a slider', () => {
    const wrapper = createWrapper();
    const slider = wrapper.getComponent(Slider);
    expect(slider.props()).toStrictEqual({
      min: 0,
      max: 1,
      value: 0,
    });
  });
});
