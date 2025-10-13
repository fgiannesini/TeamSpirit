import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import type { State } from '../form-store.ts';
import Slider from '../slider.vue';
import Reviewers from './reviewers.vue';

describe('Reviewers', () => {
  const createWrapper = (state: Partial<State> = {}): VueWrapper => {
    return shallowMount(Reviewers, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              form: { ...state },
            },
          }),
        ],
      },
    });
  };
  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should render a slider', () => {
    const wrapper = createWrapper({
      developers: [
        { id: 0, experience: 2 },
        { id: 1, experience: 3 },
      ],
    });
    const slider = wrapper.getComponent(Slider);
    expect(slider.props()).toStrictEqual({
      min: 0,
      max: 1,
      value: 0,
    });
  });
});
