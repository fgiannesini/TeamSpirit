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

  test('Should have a radio button for random mode', () => {
    const wrapper = createWrapper();
    const randomRadio = wrapper.get('[data-testid=random-radio]');
    expect(randomRadio.isVisible()).toBe(true);
  });

  test('Should have a radio button for custom mode', () => {
    const wrapper = createWrapper();
    const customRadio = wrapper.get('[data-testid=custom-radio]');
    expect(customRadio.isVisible()).toBe(true);
  });
});
