import { createTestingPinia } from '@pinia/testing';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { type State, useFormStore } from '../form-store.ts';
import Resume from '../resume/resume.vue';
import { createTestRouter } from '../router-test.ts';
import Simulation from './simulation.vue';

describe('Simulation', () => {
  const createWrapper = async (state: Partial<State> = {}) => {
    const router = createTestRouter();
    await router.push('/main');
    const wrapper = shallowMount(Simulation, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              form: { ...state },
            },
          }),
          router,
        ],
      },
    });
    return { wrapper, router };
  };

  test('Should render', async () => {
    const { wrapper } = await createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  describe('Resume', () => {
    test('Should render a resume panel', async () => {
      const { wrapper } = await createWrapper();
      expect(wrapper.get('[data-testid=resume-panel]').isVisible()).toBe(true);
    });

    test('Should render a resume component', async () => {
      const { wrapper } = await createWrapper();
      expect(wrapper.findComponent(Resume).isVisible()).toBe(true);
    });
  });

  test('Should render existing outputs', async () => {
    const { wrapper } = await createWrapper({
      simulationOutputs: [
        {
          teamType: 'Parallel',
          statEvents: [{ time: 1, leadTime: 1 }],
          timeEvents: [],
          structureEvents: [
            {
              time: 1,
              id: 0,
              name: 'thread1',
              action: 'CreateThread',
            },
            {
              time: 1,
              id: 0,
              name: 'userStory0',
              action: 'CreateUserStory',
            },
          ],
        },
      ],
    });
    expect(wrapper.find('[data-testid=stats-total-time-0]').exists()).toBe(true);
  });
  describe('Launch', () => {
    const createWrapperWithMocks = async () => {
      const { wrapper, router } = await createWrapper();
      useFormStore().$patch({
        simulationOutputs: [
          {
            teamType: 'Parallel',
            statEvents: [
              { time: 1, leadTime: 1 },
              { time: 2, leadTime: 0.5 },
            ],
            timeEvents: [],
            structureEvents: [
              {
                time: 1,
                id: 0,
                name: 'thread1',
                action: 'CreateThread',
              },
              {
                time: 1,
                id: 0,
                name: 'userStory0',
                action: 'CreateUserStory',
              },
            ],
          },
          {
            teamType: 'Ensemble',
            statEvents: [{ time: 1, leadTime: 0.7 }],
            timeEvents: [],
            structureEvents: [
              {
                time: 1,
                id: 0,
                name: 'thread1',
                action: 'CreateThread',
              },
              {
                time: 1,
                id: 0,
                name: 'userStory0',
                action: 'CreateUserStory',
              },
            ],
          },
        ],
      });
      return { wrapper, router };
    };

    test('Should display a launch button', async () => {
      const { wrapper } = await createWrapperWithMocks();
      expect(wrapper.get('[data-testid=launch-button]').text()).toBe('Launch');
    });

    test('Should display an iteration count label', async () => {
      const { wrapper } = await createWrapperWithMocks();
      expect(wrapper.get('[data-testid=iteration-count-label]').text()).toBe(
        'Iteration count',
      );
    });

    test('Should display an iteration count input', async () => {
      const { wrapper } = await createWrapperWithMocks();
      expect(wrapper.find('[data-testid=iteration-count-input]').exists()).toBe(
        true,
      );
    });

    test('Should display stats container and header', async () => {
      const { wrapper } = await createWrapperWithMocks();
      const launchButton = wrapper.get('[data-testid=launch-button]');
      await launchButton.trigger('click');
      expect(wrapper.find('[data-testid=stats-container]').exists()).toBe(true);
    });

    test('Should display stats total time', async () => {
      const { wrapper } = await createWrapperWithMocks();
      const launchButton = wrapper.get('[data-testid=launch-button]');
      await launchButton.trigger('click');
      expect(wrapper.get('[data-testid=stats-total-time-header]').text()).toBe(
        'Total time',
      );
      expect(wrapper.get('[data-testid=stats-total-time-0]').text()).toBe('2');
      expect(wrapper.get('[data-testid=stats-total-time-1]').text()).toBe('1');
    });

    test('Should display stats lead time', async () => {
      const { wrapper } = await createWrapperWithMocks();
      const launchButton = wrapper.get('[data-testid=launch-button]');
      await launchButton.trigger('click');
      expect(wrapper.get('[data-testid=stats-lead-time-header]').text()).toBe(
        'Lead time',
      );
      expect(wrapper.get('[data-testid=stats-lead-time-0]').text()).toBe('0.5');
      expect(wrapper.get('[data-testid=stats-lead-time-1]').text()).toBe('0.7');
    });

    test('Should display total user stories', async () => {
      const { wrapper } = await createWrapperWithMocks();
      const launchButton = wrapper.get('[data-testid=launch-button]');
      await launchButton.trigger('click');
      expect(wrapper.get('[data-testid=user-story-count-header]').text()).toBe(
        'User story count',
      );
      expect(wrapper.get('[data-testid=user-story-count-0]').text()).toBe('1');
      expect(wrapper.get('[data-testid=user-story-count-1]').text()).toBe('1');
    });

    test('Should display team type', async () => {
      const { wrapper } = await createWrapperWithMocks();
      const launchButton = wrapper.get('[data-testid=launch-button]');
      await launchButton.trigger('click');
      expect(wrapper.get('[data-testid=team-type-header]').text()).toBe('Team');
      expect(wrapper.get('[data-testid=team-type-0]').text()).toBe('Parallel');
      expect(wrapper.get('[data-testid=team-type-1]').text()).toBe('Ensemble');
    });

    test('Should run the simulation', async () => {
      const { wrapper } = await createWrapperWithMocks();
      const launchButton = wrapper.get('[data-testid=launch-button]');
      await launchButton.trigger('click');
      expect(wrapper.get('[data-testid=runner-header]').text()).toBe('Run');
      expect(wrapper.get('[data-testid=runner-0]').text()).toBe('play_arrow');
      expect(wrapper.get('[data-testid=runner-1]').text()).toBe('play_arrow');
    });

    test('Should redirect to play page', async () => {
      const { wrapper, router } = await createWrapperWithMocks();
      await wrapper.get('[data-testid=launch-button]').trigger('click');

      await wrapper.get('[data-testid=runner-button-0]').trigger('click');
      await flushPromises();
      expect(router.currentRoute.value.path).toBe('/play/0');
    });

    test('Should generate several iterations', async () => {
      const { wrapper } = await createWrapperWithMocks();

      const iterationCountInput = wrapper.get(
        '[data-testid=iteration-count-input]',
      );
      await iterationCountInput.setValue(2);

      const launchButton = wrapper.get('[data-testid=launch-button]');
      await launchButton.trigger('click');

      expect(useFormStore().runSimulation).toHaveBeenCalledWith(2);
    });

    test('Should generate one iteration by default', async () => {
      const { wrapper } = await createWrapperWithMocks();

      const launchButton = wrapper.get('[data-testid=launch-button]');
      await launchButton.trigger('click');

      expect(useFormStore().runSimulation).toHaveBeenCalledWith(1);
    });
  });
});
