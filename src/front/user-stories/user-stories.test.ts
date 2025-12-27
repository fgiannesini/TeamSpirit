import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Selector from '../selector.vue';
import UserStories from './user-stories.vue';

describe('User stories', () => {
  const createWrapper = (): VueWrapper => shallowMount(UserStories);

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should have a selector not selected by default', () => {
    const wrapper = createWrapper();
    const selector = wrapper.findComponent(Selector);
    expect(selector.props()).toMatchObject({
      selectedMode: 'notSet',
    });
  });
});
