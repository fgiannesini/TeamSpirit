import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import TeamModificator from './team-modificator.vue';

describe('Team Modificator', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(TeamModificator);
  };

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });
});
