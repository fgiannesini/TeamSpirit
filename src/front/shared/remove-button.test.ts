import {shallowMount, type VueWrapper} from '@vue/test-utils';
import {describe, expect, test} from 'vitest';
import RemoveButton from './remove-button.vue';

describe('Remove button', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(RemoveButton);
  };

  test('Should display a button', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=remove-button]').isVisible()).toBe(true);
  });
});
