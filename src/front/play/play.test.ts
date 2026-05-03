import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('gsap/Flip', () => ({
  Flip: {
    getState: () => ({}),
    from: (_state: unknown, opts?: { onComplete?: () => void }) => {
      setTimeout(() => opts?.onComplete?.(), 0);
    },
  },
}));
vi.mock('gsap', () => ({ gsap: { registerPlugin: () => {} } }));
import {
  createChangePriority,
  createUserStory,
  doneEvent,
  inProgressEvent,
  reviewEvent,
  setThreadIn,
  setThreadOff,
  todoEvent,
  toReviewEvent,
} from '../../simulate/factory.ts';
import type { StructureEvent } from '../../simulate/simulation-structure.ts';
import type { State } from '../form-store.ts';
import Play from './play.vue';

describe('Play', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  const createWrapper = (state: Partial<State> = {}): VueWrapper => {
    return shallowMount(Play, {
      props: { id: 0 },
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

  test('Should render the page without time events', async () => {
    const wrapper = createWrapper({
      simulationOutputs: [
        {
          timeEvents: [],
          statEvents: [],
          structureEvents: [],
          teamType: 'Parallel',
        },
      ],
    });
    expect(wrapper.find("[data-testid='threads']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='backlog']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='done']").exists()).toBe(true);
  });

  const createThread0 = (): StructureEvent => ({
    id: 0,
    name: 'dev0',
    action: 'CreateThread',
    time: 1,
  });
  const createThread1 = (): StructureEvent => ({
    id: 1,
    name: 'dev1',
    action: 'CreateThread',
    time: 1,
  });

  describe('Thread', () => {
    test('Should initialize 2 thread elements', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createThread0(), createThread1()],
            teamType: 'Parallel',
          },
        ],
      });
      expect(wrapper.get(`[data-testid=thread0]`).classes()).toContain('thread');
      expect(wrapper.get(`[data-testid=thread-title-0]`).text()).toStrictEqual('dev0');
      expect(wrapper.find(`[data-testid=thread-user-story-0]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid=thread-state-0]`).text()).toBe('Wait');

      expect(wrapper.get(`[data-testid=thread1]`).classes()).toContain('thread');
      expect(wrapper.get(`[data-testid=thread-title-1]`).text()).toStrictEqual('dev1');
      expect(wrapper.find(`[data-testid=thread-user-story-1]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid=thread-state-1]`).text()).toBe('Wait');
    });

    test('Should set thread off by default', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createThread0(), setThreadOff({ id: 0, time: 1 })],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get(`[data-testid=thread0]`).classes()).toContain('off');
    });

    test('Should set thread off on computation click', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createThread0(), setThreadOff({ id: 0, time: 2 })],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get(`[data-testid=thread0]`).classes()).not.toContain('off');

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.advanceTimersToNextTimerAsync();

      expect(wrapper.get(`[data-testid=thread0]`).classes()).toContain('off');
    });

    test('Should set thread off on all computation click', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [doneEvent({ time: 2 })],
            statEvents: [],
            structureEvents: [createThread0(), setThreadOff({ id: 0, time: 2 })],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get(`[data-testid=thread0]`).classes()).not.toContain('off');

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.get(`[data-testid=thread0]`).classes()).toContain('off');
    });

    test('Should set thread in on computation click', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createThread0(),
              setThreadOff({ id: 0, time: 1 }),
              setThreadIn({ id: 0, time: 2 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.advanceTimersToNextTimerAsync();
      expect(wrapper.get(`[data-testid=thread0]`).classes()).not.toContain('off');
    });

    test('Should set thread in on all computation click', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [doneEvent({ time: 2 })],
            statEvents: [],
            structureEvents: [
              createThread0(),
              setThreadOff({ id: 0, time: 1 }),
              setThreadIn({ id: 0, time: 2 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.get(`[data-testid=thread0]`).classes()).not.toContain('off');
    });

    test('Should set thread state to "Develop" when in progress', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent(), doneEvent()],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');

      await vi.advanceTimersToNextTimerAsync();
      expect(wrapper.find(`[data-testid=thread-state-0]`).text()).toBe('Develop');

      await vi.advanceTimersToNextTimerAsync();
      expect(wrapper.find(`[data-testid=thread-state-0]`).text()).toBe('Develop');
    });

    test('Should set thread state to "Review" when in review', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [reviewEvent(), doneEvent()],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');

      await vi.advanceTimersToNextTimerAsync();
      expect(wrapper.find(`[data-testid=thread-state-0]`).text()).toBe('Review');

      await vi.advanceTimersToNextTimerAsync();
      expect(wrapper.find(`[data-testid=thread-state-0]`).text()).toBe('Review');
    });

    test('Should set thread state to "Develop" when to review', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent(), toReviewEvent()],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.find(`[data-testid=thread-state-0]`).text()).toBe('Develop');
    });

    test('Should set thread state to "Wait" when idle', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              inProgressEvent(),
              toReviewEvent(),
              doneEvent({ time: 2, userStoryId: -1 }),
            ],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();
      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.find(`[data-testid=thread-state-0]`).text()).toBe('Wait');
    });
  });

  describe('User story', () => {
    test('Should initialize 2 userStories elements', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent({ userStoryId: 0 }), inProgressEvent({ userStoryId: 1 })],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0, name: 'US0' }),
              createChangePriority({ id: 0, value: 1 }),
              createUserStory({ id: 1, name: 'US1' }),
              createChangePriority({ id: 1, value: 2 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });
      const userStory1 = wrapper.get('[data-testid=user-story-0]');
      expect(userStory1.classes()).toContain('userStory');
      expect(userStory1.get('.name').text()).toStrictEqual('US0');
      expect(userStory1.get('.priority').text()).toStrictEqual('(1)');

      const userStory2 = wrapper.get('[data-testid=user-story-1]');
      expect(userStory2.classes()).toContain('userStory');
      expect(userStory2.get('.name').text()).toStrictEqual('US1');
      expect(userStory2.get('.priority').text()).toStrictEqual('(2)');
    });

    test('Should add a user story on computation click', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createUserStory({ id: 0, time: 2 })],
            teamType: 'Parallel',
          },
        ],
      });
      expect(wrapper.find('[data-testid=user-story-0]').exists()).toBe(false);

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.advanceTimersToNextTimerAsync();

      expect(wrapper.find('[data-testid=user-story-0]').exists()).toBe(true);
    });

    test('Should add a user story on all computation click', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [doneEvent({ time: 2 })],
            statEvents: [],
            structureEvents: [createUserStory({ id: 0, time: 2 })],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.find('[data-testid=user-story-0]').exists()).toBe(false);

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.find('[data-testid=user-story-0]').exists()).toBe(true);
    });

    test('Should move userStories to thread when in progress, then done', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent(), doneEvent()],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      const threadUserStory = wrapper.get('[data-testid=thread-user-story-0]');
      expect(threadUserStory.find('[data-testid=user-story-0-0]').exists()).toBe(true);

      await vi.runAllTimersAsync();
      const done = wrapper.get('[data-testid=done]');
      expect(done.find('[data-testid=user-story-0]').exists()).toBe(true);
    });

    test('Should move userStory to backlog when todo', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              inProgressEvent({ userStoryId: 0 }),
              todoEvent({ userStoryId: 0, time: 2 }),
            ],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      const backlog = wrapper.get('[data-testid=backlog]');
      expect(backlog.find('[data-testid=user-story-0-0]').exists()).toBe(true);
    });

    test('Should move userStories with id >10 to thread when in progress, then done', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              inProgressEvent({ userStoryId: 1, threadId: 0 }),
              inProgressEvent({ userStoryId: 10, threadId: 1 }),
              doneEvent({ userStoryId: 1, threadId: 0 }),
              doneEvent({ userStoryId: 10, threadId: 1 }),
            ],
            statEvents: [],
            structureEvents: [
              createThread0(),
              createThread1(),
              createUserStory({ id: 1, name: 'US1' }),
              createUserStory({ id: 10, name: 'US10' }),
            ],
            teamType: 'Parallel',
          },
        ],
      });
      await wrapper.get('[data-testid=compute]').trigger('click');

      const threadUserStory0 = wrapper.get('[data-testid=thread-user-story-0]');
      expect(threadUserStory0.find('[data-testid=user-story-1-0]').exists()).toBe(true);

      await vi.advanceTimersToNextTimerAsync();
      const threadUserStory1 = wrapper.get('[data-testid=thread-user-story-1]');
      expect(threadUserStory1.find('[data-testid=user-story-10-1]').exists()).toBe(true);

      const done = wrapper.get('[data-testid=done]');

      await vi.advanceTimersToNextTimerAsync();
      expect(done.find('[data-testid=user-story-1]').exists()).toBe(true);

      await vi.advanceTimersToNextTimerAsync();
      expect(done.find('[data-testid=user-story-10]').exists()).toBe(true);
    });

    test('Should keep userStories to thread when in progress', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent(), inProgressEvent()],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });
      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();
      const threadUserStory0 = wrapper.get('[data-testid=thread-user-story-0]');
      expect(threadUserStory0.find('[data-testid=user-story-0-0]').exists()).toBe(true);
    });

    test('Should move userStories to thread when in review, then done', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [reviewEvent({ threadId: 1 }), doneEvent({ threadId: 0 })],
            statEvents: [],
            structureEvents: [createThread1(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      const threadUserStory1 = wrapper.get('[data-testid=thread-user-story-1]');
      expect(threadUserStory1.find('[data-testid=user-story-0-1]').exists()).toBe(true);

      await vi.runAllTimersAsync();

      const done = wrapper.get('[data-testid=done]');
      expect(done.find('[data-testid=user-story-0]').exists()).toBe(true);
    });

    test('Should remove userStories from thread that was in review when done', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              reviewEvent({ threadId: 0, userStoryId: 2 }),
              reviewEvent({ threadId: 1, userStoryId: 2 }),
              doneEvent({ threadId: 2, userStoryId: 2 }),
            ],
            statEvents: [],
            structureEvents: [createThread0(), createThread1(), createUserStory({ id: 2 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();
      const threadUserStory1 = wrapper.get('[data-testid=thread-user-story-1]');
      expect(threadUserStory1.find('[data-testid=user-story-2-1]').exists()).toBe(false);
      const threadUserStory0 = wrapper.get('[data-testid=thread-user-story-0]');
      expect(threadUserStory0.find('[data-testid=user-story-2-0]').exists()).toBe(false);
      const done = wrapper.get('[data-testid=done]');
      expect(done.find('[data-testid=user-story-2]').exists()).toBe(true);
    });

    test('Should remove userStories from thread that was in review when to review', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              reviewEvent({ threadId: 0, userStoryId: 2 }),
              reviewEvent({ threadId: 1, userStoryId: 2 }),
              toReviewEvent({ threadId: 2, userStoryId: 2 }),
            ],
            statEvents: [],
            structureEvents: [createThread0(), createThread1(), createUserStory({ id: 2 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();
      const threadUserStory1 = wrapper.get('[data-testid=thread-user-story-1]');
      expect(threadUserStory1.find('[data-testid=user-story-2-1]').exists()).toBe(false);
      const threadUserStory0 = wrapper.get('[data-testid=thread-user-story-0]');
      expect(threadUserStory0.find('[data-testid=user-story-2-0]').exists()).toBe(false);
      const backlog = wrapper.get('[data-testid=backlog]');
      expect(backlog.find('[data-testid=user-story-2]').exists()).toBe(true);
    });

    test('Should move userStories to the backlog area when to review', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent(), toReviewEvent()],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });
      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      const backlog = wrapper.get('[data-testid=backlog]');
      expect(backlog.find('[data-testid=user-story-0]').exists()).toBe(true);
    });

    test('Should move userStories to the corresponding threads when reviewed by several threads', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [reviewEvent({ threadId: 0 }), reviewEvent({ threadId: 1 })],
            statEvents: [],
            structureEvents: [
              createThread0(),
              createThread1(),
              createUserStory({ id: 0, name: 'US0' }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      const threadUserStory0 = wrapper.get('[data-testid=thread-user-story-0]');
      const firstDiv = threadUserStory0.find('[data-testid=user-story-0-0]');
      expect(firstDiv.exists()).toBe(true);
      expect(firstDiv.text()).toBe('US0');
      const threadUserStory1 = wrapper.get('[data-testid=thread-user-story-1]');
      const secondDiv = threadUserStory1.find('[data-testid=user-story-0-1]');
      expect(secondDiv.exists()).toBe(true);
      expect(secondDiv.text()).toBe('US0');

      const backlog = wrapper.get('[data-testid=backlog]');
      expect(backlog.find('[data-testid=user-story-0]').exists()).toBe(false);
    });

    test('Should keep only one review when the other one is completed', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              reviewEvent({ threadId: 0 }),
              reviewEvent({ threadId: 1 }),
              doneEvent({ time: 2, threadId: 0, userStoryId: -1 }),
              reviewEvent({ time: 2, threadId: 1 }),
            ],
            statEvents: [],
            structureEvents: [createThread0(), createThread1(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      const threadUserStory1 = wrapper.get('[data-testid=thread-user-story-1]');
      expect(threadUserStory1.find('[data-testid=user-story-0-1]').exists()).toBe(true);
      const threadUserStory0 = wrapper.get('[data-testid=thread-user-story-0]');
      expect(threadUserStory0.find('[data-testid=user-story-0-0]').exists()).toBe(false);
    });

    test('Should remove ended review when a in progress task starts', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              reviewEvent({ threadId: 0 }),
              reviewEvent({ threadId: 1 }),
              inProgressEvent({ time: 2, threadId: 0, userStoryId: 1 }),
              reviewEvent({ time: 2, threadId: 1 }),
            ],
            statEvents: [],
            structureEvents: [
              createThread0(),
              createThread1(),
              createUserStory({ id: 0 }),
              createUserStory({ id: 1 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      const threadUserStory1 = wrapper.get('[data-testid=thread-user-story-1]');
      expect(threadUserStory1.find('[data-testid=user-story-0-1]').exists()).toBe(true);
      const threadUserStory0 = wrapper.get('[data-testid=thread-user-story-0]');
      expect(threadUserStory0.find('[data-testid=user-story-0-0]').exists()).toBe(false);
    });

    test('Should keep two reviews when reviews last', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              reviewEvent({ time: 1, threadId: 0 }),
              reviewEvent({ time: 1, threadId: 1 }),
              reviewEvent({ time: 2, threadId: 0 }),
              reviewEvent({ time: 2, threadId: 1 }),
            ],
            statEvents: [],
            structureEvents: [createThread0(), createThread1(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      const threadUserStory0 = wrapper.get('[data-testid=thread-user-story-0]');
      expect(threadUserStory0.findAll('[data-testid=user-story-0-0]').length).toStrictEqual(1);
      const threadUserStory1 = wrapper.get('[data-testid=thread-user-story-1]');
      expect(threadUserStory1.findAll('[data-testid=user-story-0-1]').length).toStrictEqual(1);
      expect(wrapper.find('[data-testid=user-story-0]').exists()).toBe(false);
    });

    test('Should not display "idle" user story', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              inProgressEvent({ time: 1, threadId: 0 }),
              doneEvent({ time: 1, threadId: 1, userStoryId: -1 }),
              inProgressEvent({ time: 2, threadId: 0 }),
              doneEvent({ time: 2, threadId: 0 }),
              doneEvent({ time: 2, threadId: 1, userStoryId: -1 }),
            ],
            statEvents: [],
            structureEvents: [createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.find('[data-testid=idle]').exists()).toBe(false);
    });

    test('Should change priority on computation click', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0, name: 'US0' }),
              createChangePriority({ id: 0, value: 1 }),
              createChangePriority({ id: 0, value: 2, time: 2 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.advanceTimersToNextTimerAsync();

      expect(wrapper.get('[data-testid=user-story-0]').text()).toBe('US0(2)');
    });
  });

  describe('Compute', () => {
    test('Should compute all on click on compute All button', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              inProgressEvent({ time: 1 }),
              inProgressEvent({ time: 2 }),
              doneEvent({ time: 2 }),
            ],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      const done = wrapper.get('[data-testid=done]');
      expect(done.find('[data-testid=user-story-0]').exists()).toBe(true);
    });

    test('Should disable "compute" button during display', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              inProgressEvent({ time: 1 }),
              inProgressEvent({ time: 2 }),
              doneEvent({ time: 2 }),
            ],
            statEvents: [],
            structureEvents: [createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      const compute = wrapper.get('[data-testid=compute]');
      await compute.trigger('click');

      expect(compute.attributes().disabled).toBeDefined();
      await vi.runAllTimersAsync();

      expect(compute.attributes().disabled).not.toBeDefined();
    });

    test('Should disable "compute" button when finished', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent(), doneEvent()],
            statEvents: [],
            structureEvents: [createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });
      const compute = wrapper.get('[data-testid=compute]');
      await compute.trigger('click');
      await vi.runAllTimersAsync();

      expect(compute.attributes().disabled).toBeDefined();
    });

    test('Should disable "compute all" button when finished', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent(), doneEvent()],
            statEvents: [],
            structureEvents: [createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      const computeAll = wrapper.get('[data-testid=compute-all]');
      await computeAll.trigger('click');
      await vi.runAllTimersAsync();

      expect(computeAll.attributes().disabled).toBeDefined();
    });
  });

  describe('Stats', () => {
    test('Should render the page without stat events', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [],
            teamType: 'Parallel',
          },
        ],
      });

      const leadTime = wrapper.find('[data-testid=lead-time]');
      expect(leadTime.exists()).toBe(true);
      expect(leadTime.text()).toEqual('');

      const time = wrapper.find('[data-testid=time]');
      expect(time.exists()).toBe(true);
      expect(time.text()).toEqual('');
    });

    test.each([
      [1 / 3, '0.33'],
      [Number.NaN, 'NaN'],
    ])('Should render the page with a stat event', async (leadTimeProvided, leadTimeDisplayed) => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              {
                time: 1,
                userStoryId: 1,
                threadId: 1,
                state: 'InProgress',
              },
            ],
            statEvents: [
              {
                time: 1,
                leadTime: leadTimeProvided,
              },
            ],
            structureEvents: [],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      const leadTime = wrapper.get('[data-testid=lead-time]');
      expect(leadTime.text()).toEqual(leadTimeDisplayed);

      const time = wrapper.find('[data-testid=time]');
      expect(time.text()).toEqual('1/1');
    });
  });
});
