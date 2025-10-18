import { createTestingPinia } from '@pinia/testing';
import { flushPromises, shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { type State, useFormStore } from '../form-store.ts';
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

  test('Should render a slider with default value', () => {
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

  test('Should bind reviewers value', () => {
    const wrapper = createWrapper({
      developers: [
        { id: 0, experience: 2 },
        { id: 1, experience: 3 },
      ],
      reviewers: 1,
    });
    const slider = wrapper.getComponent(Slider);
    expect(slider.props()).toStrictEqual({
      min: 0,
      max: 1,
      value: 1,
    });
  });

  test('Should update reviewers value', async () => {
    const wrapper = createWrapper({
      developers: [
        { id: 0, experience: 2 },
        { id: 1, experience: 3 },
      ],
    });
    const slider = wrapper.getComponent(Slider);
    slider.vm.$emit('update:value', 1);
    await flushPromises();

    expect(useFormStore().reviewers).toEqual(1);
  });

  test('Should render a title', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid="title"]').text()).toBe('Reviewers');
  });
});
