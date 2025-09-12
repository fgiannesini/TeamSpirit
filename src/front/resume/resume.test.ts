import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Resume from './resume.vue';

describe('Resume', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(Resume);
  };

  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });
});
