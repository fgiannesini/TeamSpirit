import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import { noBugGenerator } from '../../simulate/bug-generator.ts';
import { createBacklog, parallelTeam } from '../../simulate/factory.ts';
import { noPriorityModificator } from '../../simulate/priority-modificator.ts';
import { noTeamModificator } from '../../simulate/team-modificator.ts';
import type { State } from '../form-store.ts';
import Resume from '../resume/resume.vue';
import Simulation from './simulation.vue';

describe('Simulation', () => {
  const createWrapper = (state: Partial<State> = {}): VueWrapper =>
    shallowMount(Simulation, {
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

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  describe('Resume', () => {
    test('Should render a resume panel', () => {
      const wrapper = createWrapper();
      expect(wrapper.get('[data-testid=resume-panel]').isVisible()).toBe(true);
    });

    test('Should render a resume component', () => {
      const wrapper = createWrapper();
      expect(wrapper.findComponent(Resume).isVisible()).toBe(true);
    });
  });

  describe('Launch', () => {
    test('Should display a launch button', () => {
      const wrapper = createWrapper();
      expect(wrapper.get('[data-testid=launch-button]').text()).toBe('Launch');
    });

    test('Should simulate on launch click', () => {
      const { simulateMock } = vi.hoisted(() => ({
        simulateMock: vi.fn(),
      }));
      vi.mock('../../simulate/simulation.ts', () => ({
        simulate: simulateMock,
      }));
      const wrapper = createWrapper();
      const launchButton = wrapper.get('[data-testid=launch-button]');
      launchButton.trigger('click');

      expect(simulateMock).toHaveBeenCalledWith(
        createBacklog(),
        parallelTeam(),
        noBugGenerator,
        noTeamModificator,
        noPriorityModificator,
      );
    });
  });
});
