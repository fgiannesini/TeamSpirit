import {createTestingPinia} from '@pinia/testing';
import {flushPromises, shallowMount, type VueWrapper} from '@vue/test-utils';
import {describe, expect, test} from 'vitest';
import {type State, useFormStore} from '../form-store.ts';
import Selector from '../shared/selector.vue';
import CustomUserStories from './custom-user-stories.vue';
import UserStories from './user-stories.vue';

describe('User stories', () => {
  const createWrapper = (state: Partial<State> = {}): VueWrapper => {
    return shallowMount(UserStories, {
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
    expect(formStore.userStoriesMode).toStrictEqual('random');
  });

  test('Should select custom mode', async () => {
    const wrapper = createWrapper();
    wrapper.findComponent(Selector).vm.$emit('update:selectedMode', 'custom');
    await flushPromises();

    const formStore = useFormStore();
    expect(formStore.userStoriesMode).toStrictEqual('custom');
  });

  test('Should select custom mode on loading', () => {
    const wrapper = createWrapper({ userStoriesMode: 'custom' });

    const selector = wrapper.findComponent(Selector);
    expect(selector.props()).toMatchObject({
      selectedMode: 'custom',
    });
  });

  test('Should set selector as mandatory', () => {
    const wrapper = createWrapper();

    const selector = wrapper.findComponent(Selector);
    expect(selector.props()).toMatchObject({
      mandatory: true,
    });
  });

  test('Should render Custom User Stories', () => {
    const wrapper = createWrapper({ userStoriesMode: 'custom' });
    expect(wrapper.findComponent(CustomUserStories).exists()).toBe(true);
  });
});
