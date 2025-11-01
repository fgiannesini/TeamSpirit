import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Selector from './selector.vue';

describe('Selector', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(Selector);
  };

  test('should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });
});
