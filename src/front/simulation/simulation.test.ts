import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Simulation from './simulation.vue';

describe('Simulation', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(Simulation);
  };

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });
});
