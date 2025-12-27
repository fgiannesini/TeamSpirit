import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import CustomUserStories from './custom-user-stories.vue';

describe('Custom User Stories', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(CustomUserStories);
  };

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });
});
