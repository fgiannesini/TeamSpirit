import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import CustomTeamModificator from './custom-team-modificator.vue';

describe('Custom Team Modificator', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(CustomTeamModificator);
  };

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });
});
