import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import UserStories from './user-stories.vue';

describe('User stories', () => {
  const createWrapper = (): VueWrapper => shallowMount(UserStories);

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });
});
