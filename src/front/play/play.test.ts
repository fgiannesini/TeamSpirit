import { describe, expect, test } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import Play from './play.vue';

describe('Play', () => {
  test('Should render component', () => {
    const wrapper = shallowMount(Play);
    expect(wrapper.exists()).toBe(true);
  });
});
