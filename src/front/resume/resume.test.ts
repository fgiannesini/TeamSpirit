import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import type { State } from '../form-store.ts';
import Resume from './resume.vue';

describe('Resume', () => {
  const createWrapper = (state: Partial<State> = {}): VueWrapper => {
    return shallowMount(Resume, {
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

  test('Should display team mode', () => {
    const wrapper = createWrapper({ teamMode: 'random' });
    const teamMode = wrapper.get('[data-testid=team-mode]');
    expect(teamMode.text()).toBe('random');
  });
});
