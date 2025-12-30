import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import type { State } from '../form-store.ts';
import { developer } from '../front-factory-for-test.ts';
import Resume from './resume.vue';

describe('Resume', () => {
  const mockRouter = {
    push: vi.fn(),
  };
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
        mocks: {
          $router: mockRouter,
        },
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

  test('Should display the developers', () => {
    const wrapper = createWrapper({
      developers: [developer(), developer({ id: 1, experience: 2 })],
    });
    expect(wrapper.get('[data-testid=developer-0]').text()).toBe('3');
    expect(wrapper.get('[data-testid=developer-1]').text()).toBe('2');
  });

  test('Should display the reviewers count', () => {
    const wrapper = createWrapper({
      reviewers: 1,
    });
    expect(wrapper.get('[data-testid=reviewers]').text()).toBe('1');
  });

  test('Should display a launch button', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=launch-button]').text()).toBe('Launch');
  });

  test('Should redirect to simulation component on launch click', () => {
    const wrapper = createWrapper();
    const launchButton = wrapper.get('[data-testid=launch-button]');
    launchButton.trigger('click');

    expect(mockRouter.push).toHaveBeenCalledWith('/simulate');
  });
});
