import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import type { State } from '../form-store.ts';
import { developer } from '../front-factory-for-test.ts';
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
    expect(teamMode.text()).toBe('Random');
  });

  test('Should display not set label', () => {
    const wrapper = createWrapper({ teamMode: 'notSet' });
    expect(wrapper.get('[data-testid=team-mode]').text()).toBe('Not set');
  });

  test('Should display the developers', () => {
    const wrapper = createWrapper({
      teamMode: 'custom',
      developers: [developer(), developer({ id: 1, experience: 2 })],
    });
    expect(wrapper.get('[data-testid=developer-0]').text()).toBe('Dev 0 — exp. 3');
    expect(wrapper.get('[data-testid=developer-1]').text()).toBe('Dev 1 — exp. 2');
  });

  test('Should not display developers when mode is random', () => {
    const wrapper = createWrapper({ teamMode: 'random', developers: [developer()] });
    expect(wrapper.find('[data-testid=developer-0]').exists()).toBe(false);
  });

  test('Should not display developers when mode is notSet', () => {
    const wrapper = createWrapper({ teamMode: 'notSet', developers: [developer()] });
    expect(wrapper.find('[data-testid=developer-0]').exists()).toBe(false);
  });

  test('Should display the reviewers count', () => {
    const wrapper = createWrapper({
      reviewers: 1,
    });
    expect(wrapper.get('[data-testid=reviewers]').text()).toBe('1');
  });
});
