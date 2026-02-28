import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it, test } from 'vitest';
import Slider from './slider.vue';

describe('Slider', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(Slider, {
      props: {
        max: 7,
        min: 1,
        value: 3,
      },
    });
  };

  it('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should render a range', () => {
    const wrapper = createWrapper();
    const range = wrapper.get('[data-testid=range]');
    expect(range.isVisible()).toBe(true);
  });

  test('Should have the tooltip rendered', () => {
    const wrapper = createWrapper();
    const tooltip = wrapper.get('[data-testid=range-tooltip]');
    expect(tooltip.isVisible()).toBe(true);
  });

  test('Should show minimum of the range', () => {
    const wrapper = createWrapper();
    const minimum = wrapper.get('[data-testid=minimum]');
    expect(minimum.text()).toBe('1');
  });

  test('Should show maximum of the range', () => {
    const wrapper = createWrapper();
    const minimum = wrapper.get('[data-testid=maximum]');
    expect(minimum.text()).toBe('7');
  });

  test('Should bind value', () => {
    const wrapper = createWrapper();
    const input = wrapper.get<HTMLInputElement>('[data-testid=input]');
    expect(input.element.value).toBe('3');
  });

  test('Should send an update event on value change', () => {
    const wrapper = createWrapper();
    const input = wrapper.get<HTMLInputElement>('[data-testid=input]');
    input.setValue(2);
    const emitted = wrapper.emitted('update:value');
    expect(emitted?.[0]).toStrictEqual([2]);
  });
});
