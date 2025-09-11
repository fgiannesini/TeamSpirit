import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Team from './team.vue';

describe('Team', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(Team);
  };

  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });
});
