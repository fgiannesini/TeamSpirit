import { createTestingPinia } from '@pinia/testing';
import { flushPromises, shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { type State, useFormStore } from '../form-store.ts';
import Selector from '../selector.vue';
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

  test('Should have a selector not selected by default', () => {
    const wrapper = createWrapper();
    const selector = wrapper.findComponent(Selector);
    expect(selector.props()).toStrictEqual({
      selectedMode: 'notSet',
    });
  });

  test('Should update random mode in store', async () => {
    const wrapper = createWrapper();
    wrapper.findComponent(Selector).vm.$emit('update:selectedMode', 'random');
    await flushPromises();

    const formStore = useFormStore();
    expect(formStore.teamMode).toStrictEqual('random');
  });

  test('Should select custom mode', async () => {
    const wrapper = createWrapper();
    wrapper.findComponent(Selector).vm.$emit('update:selectedMode', 'custom');
    await flushPromises();

    const formStore = useFormStore();
    expect(formStore.teamMode).toStrictEqual('custom');
  });

  test('Should select custom mode on loading', () => {
    useFormStore().setTeamMode('custom');
    const wrapper = createWrapper({ teamMode: 'custom' });

    const selector = wrapper.findComponent(Selector);
    expect(selector.props()).toStrictEqual({
      selectedMode: 'custom',
    });
  });

  test('Should select random mode on loading', () => {
    useFormStore().setTeamMode('random');
    const wrapper = createWrapper({ teamMode: 'random' });

    const selector = wrapper.findComponent(Selector);
    expect(selector.props()).toStrictEqual({
      selectedMode: 'random',
    });
  });
});
