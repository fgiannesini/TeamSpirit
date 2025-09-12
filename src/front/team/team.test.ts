import { createTestingPinia } from '@pinia/testing';
import {
  type DOMWrapper,
  shallowMount,
  type VueWrapper,
} from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { type State, useFormStore } from '../form-store.ts';
import Team from './team.vue';

describe('Team', () => {
  const createWrapper = (state: Partial<State> = {}): VueWrapper => {
    return shallowMount(Team, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              form: { ...state },
            },
          }),
        ],
      },
    });
  };

  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  const radio = (
    wrapper: VueWrapper,
    radioName: string,
  ): DOMWrapper<HTMLInputElement> => {
    return wrapper.find<HTMLInputElement>(`[data-testid=${radioName}-radio]`);
  };

  test('Should have a radio not checked by default button for custom mode', () => {
    const wrapper = createWrapper();
    const customRadio = radio(wrapper, 'custom');
    expect(customRadio.isVisible()).toBe(true);
    expect(customRadio.element.checked).toBe(false);
  });

  test('Should have a radio not checked by default button for random mode', () => {
    const wrapper = createWrapper();
    const randomRadio = radio(wrapper, 'random');
    expect(randomRadio.isVisible()).toBe(true);
    expect(randomRadio.element.checked).toBe(false);
  });

  test('Should select random mode', async () => {
    const wrapper = createWrapper();
    const randomRadio = radio(wrapper, 'random');
    await randomRadio.trigger('click');
    expect(randomRadio.element.checked).toBe(true);
  });

  test('Should update random mode in store', async () => {
    const wrapper = createWrapper();
    await radio(wrapper, 'random').trigger('click');
    const formStore = useFormStore();
    expect(formStore.setTeamMode).toHaveBeenCalledWith('random');
  });

  test('Should select custom mode', async () => {
    const wrapper = createWrapper();
    const customRadio = radio(wrapper, 'custom');
    await customRadio.trigger('click');
    expect(customRadio.element.checked).toBe(true);
  });

  test('Should select random mode, then custom mode', async () => {
    const wrapper = createWrapper();
    const randomRadio = radio(wrapper, 'random');
    await randomRadio.trigger('click');

    await radio(wrapper, 'custom').trigger('click');
    expect(randomRadio.element.checked).toBe(false);
  });

  test('Should render custom team component when custom mode is selected', async () => {
    const wrapper = createWrapper();
    await radio(wrapper, 'custom').trigger('click');
    expect(wrapper.get('[data-testid=custom-container]').classes()).toContain(
      'active',
    );
  });

  test('Should not render custom team component when random mode is selected', async () => {
    const wrapper = createWrapper();
    await radio(wrapper, 'random').trigger('click');
    expect(
      wrapper.get('[data-testid=custom-container]').classes(),
    ).not.toContain('active');
  });

  test('Should not render custom team component when random mode is selected after custom mode', async () => {
    const wrapper = createWrapper();
    await radio(wrapper, 'custom').trigger('click');
    expect(wrapper.get('[data-testid=custom-container]').classes()).toContain(
      'active',
    );
    await radio(wrapper, 'random').trigger('click');
    expect(
      wrapper.get('[data-testid=custom-container]').classes(),
    ).not.toContain('active');
  });

  test('Should select custom mode on loading', () => {
    const wrapper = createWrapper({ teamMode: 'custom' });
    const customRadio = radio(wrapper, 'custom');
    expect(customRadio.element.checked).toBe(true);
  });

  test('Should select random mode on loading', () => {
    const wrapper = createWrapper({ teamMode: 'random' });
    const randomRadio = radio(wrapper, 'random');
    expect(randomRadio.element.checked).toBe(true);
  });
});
