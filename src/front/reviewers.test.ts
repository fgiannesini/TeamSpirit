import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Reviewers from './reviewers.vue';

describe('Reviewers', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(Reviewers);
  };
  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });
});
