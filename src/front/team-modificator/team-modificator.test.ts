import { createTestingPinia } from '@pinia/testing';
import { flushPromises, shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { type State, useFormStore } from '../form-store.ts';
import Selector from '../selector.vue';
import CustomTeamModificator from './custom-team-modificator.vue';
import TeamModificator from './team-modificator.vue';

describe('Team Modificator', () => {
  const createWrapper = (state: Partial<State> = {}): VueWrapper => {
    return shallowMount(TeamModificator, {
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

  test('Should update random mode in store', async () => {
    const wrapper = createWrapper();
    wrapper.findComponent(Selector).vm.$emit('update:selectedMode', 'random');
    await flushPromises();

    const formStore = useFormStore();
    expect(formStore.teamModificatorMode).toStrictEqual('random');
  });

  test('Should select custom mode', async () => {
    const wrapper = createWrapper();
    wrapper.findComponent(Selector).vm.$emit('update:selectedMode', 'custom');
    await flushPromises();

    const formStore = useFormStore();
    expect(formStore.teamModificatorMode).toStrictEqual('custom');
  });

  test('Should select custom mode on loading', () => {
    const wrapper = createWrapper({ teamModificatorMode: 'custom' });

    const selector = wrapper.findComponent(Selector);
    expect(selector.props()).toMatchObject({
      selectedMode: 'custom',
    });
  });

  test('Should select random mode on loading', () => {
    const wrapper = createWrapper({ teamModificatorMode: 'random' });

    const selector = wrapper.findComponent(Selector);
    expect(selector.props()).toMatchObject({
      selectedMode: 'random',
    });
  });

  test('Should render Custom Team Modificator', () => {
    const wrapper = createWrapper({ teamModificatorMode: 'custom' });
    expect(wrapper.findComponent(CustomTeamModificator).exists()).toBe(true);
  });

  test('Should set mode selection not mandatory', () => {
    const wrapper = createWrapper();

    const selector = wrapper.findComponent(Selector);
    expect(selector.props()).toMatchObject({
      mandatory: false,
    });
  });
});
