import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Router } from 'vue-router';
import { useRouter } from 'vue-router';

vi.mock('gsap', () => ({
  gsap: {
    timeline: (opts?: { onComplete?: () => void }) => {
      setTimeout(() => opts?.onComplete?.(), 0);
      return { fromTo: () => {} };
    },
  },
}));

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));
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
      expect(wrapper.find(`[data-testid=thread-state-label-0]`).text()).toBe('Wait');

      expect(wrapper.get(`[data-testid=thread1]`).classes()).toContain('thread');
      expect(wrapper.get(`[data-testid=thread-title-1]`).text()).toStrictEqual('dev1');
      expect(wrapper.find(`[data-testid=thread-user-story-1]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid=thread-state-label-1]`).text()).toBe('Wait');
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
      expect(wrapper.find(`[data-testid=thread-state-label-0]`).text()).toBe('Develop');

      await vi.advanceTimersToNextTimerAsync();
      expect(wrapper.find(`[data-testid=thread-state-label-0]`).text()).toBe('Develop');
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
      expect(wrapper.find(`[data-testid=thread-state-label-0]`).text()).toBe('Review');

      await vi.advanceTimersToNextTimerAsync();
      expect(wrapper.find(`[data-testid=thread-state-label-0]`).text()).toBe('Review');
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

      expect(wrapper.find(`[data-testid=thread-state-label-0]`).text()).toBe('Develop');
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

      expect(wrapper.find(`[data-testid=thread-state-label-0]`).text()).toBe('Wait');
    });
  });

  describe('Thread state badge variant', () => {
    test('Should have develop badge variant when state is Develop', async () => {
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
      await vi.runAllTimersAsync();

      expect(wrapper.get('[data-testid=thread-state-0]').classes()).toContain(
        'thread-state-badge--develop',
      );
    });

    test('Should have review badge variant when state is Review', async () => {
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
      await vi.runAllTimersAsync();

      expect(wrapper.get('[data-testid=thread-state-0]').classes()).toContain(
        'thread-state-badge--review',
      );
    });

    test('Should have wait badge variant when state is Wait', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createThread0()],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=thread-state-0]').classes()).toContain(
        'thread-state-badge--wait',
      );
    });

    test('Should have off badge variant when thread is Off', () => {
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

      expect(wrapper.get('[data-testid=thread-state-0]').classes()).toContain(
        'thread-state-badge--off',
      );
    });
  });

  describe('Thread state label', () => {
    test('Should show "Wait" when thread has no off event', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createThread0()],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=thread-state-label-0]').text()).toBe('Wait');
    });

    test('Should show "Off" when thread is off', () => {
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

      expect(wrapper.get('[data-testid=thread-state-label-0]').text()).toBe('Off');
    });
  });

  describe('Thread state icon', () => {
    test('Should display pause icon in Wait state', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createThread0()],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=thread-state-icon-0]').text()).toBe('pause');
    });

    test('Should display code icon in Develop state', async () => {
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
      await vi.runAllTimersAsync();

      expect(wrapper.get('[data-testid=thread-state-icon-0]').text()).toBe('code');
    });

    test('Should display rate_review icon in Review state', async () => {
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
      await vi.runAllTimersAsync();

      expect(wrapper.get('[data-testid=thread-state-icon-0]').text()).toBe('rate_review');
    });

    test('Should display power_settings_new icon in Off state', () => {
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

      expect(wrapper.get('[data-testid=thread-state-icon-0]').text()).toBe('power_settings_new');
    });

    test('Should have role="status" on thread state badge', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createThread0()],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=thread-state-0]').attributes('role')).toBe('status');
    });
  });

  describe('Thread state tooltip', () => {
    test('Should show "Waiting for work" tooltip in Wait state', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createThread0()],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=thread-state-0]').attributes('title')).toBe(
        'Waiting for work',
      );
    });

    test('Should show "Developing a user story" tooltip in Develop state', async () => {
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

      expect(wrapper.get('[data-testid=thread-state-0]').attributes('title')).toBe(
        'Developing a user story',
      );
    });

    test('Should show "Reviewing a user story" tooltip in Review state', async () => {
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

      expect(wrapper.get('[data-testid=thread-state-0]').attributes('title')).toBe(
        'Reviewing a user story',
      );
    });

    test('Should show "Thread is unavailable" tooltip when thread is off', () => {
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

      expect(wrapper.get('[data-testid=thread-state-0]').attributes('title')).toBe(
        'Thread is unavailable',
      );
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
      expect(userStory1.classes()).toContain('story-card');
      expect(userStory1.get('[data-testid=story-name]').text()).toStrictEqual('US0');
      expect(userStory1.get('[data-testid=priority-0] span').text()).toStrictEqual('1');

      const userStory2 = wrapper.get('[data-testid=user-story-1]');
      expect(userStory2.classes()).toContain('story-card');
      expect(userStory2.get('[data-testid=story-name]').text()).toStrictEqual('US1');
      expect(userStory2.get('[data-testid=priority-1] span').text()).toStrictEqual('2');
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
      expect(backlog.find('[data-testid=user-story-0]').exists()).toBe(true);
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
      const threadUserStory1 = wrapper.get('[data-testid=thread-user-story-1]');
      expect(threadUserStory0.find('[data-testid=user-story-1-0]').exists()).toBe(true);
      expect(threadUserStory1.find('[data-testid=user-story-10-1]').exists()).toBe(true);

      const done = wrapper.get('[data-testid=done]');

      await vi.runAllTimersAsync();
      expect(done.find('[data-testid=user-story-1]').exists()).toBe(true);
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
      expect(firstDiv.get('[data-testid=story-name]').text()).toBe('US0');
      const threadUserStory1 = wrapper.get('[data-testid=thread-user-story-1]');
      const secondDiv = threadUserStory1.find('[data-testid=user-story-0-1]');
      expect(secondDiv.exists()).toBe(true);
      expect(secondDiv.get('[data-testid=story-name]').text()).toBe('US0');

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

    test('Should not duplicate story when transitioning from in-progress to review by another thread', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              inProgressEvent({ time: 1, threadId: 0, userStoryId: 0 }),
              reviewEvent({ time: 2, threadId: 1, userStoryId: 0 }),
            ],
            statEvents: [],
            structureEvents: [createThread0(), createThread1(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      expect(
        wrapper
          .get('[data-testid=thread-user-story-0]')
          .find('[data-testid=user-story-0-0]')
          .exists(),
      ).toBe(false);
      expect(
        wrapper
          .get('[data-testid=thread-user-story-1]')
          .find('[data-testid=user-story-0-1]')
          .exists(),
      ).toBe(true);
      expect(wrapper.findAll('[data-flip-id="story-0"]').length).toStrictEqual(1);
    });

    test('Should not duplicate story across multi-turn review after in-progress', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              inProgressEvent({ time: 1, threadId: 0, userStoryId: 0 }),
              reviewEvent({ time: 2, threadId: 1, userStoryId: 0 }),
              reviewEvent({ time: 3, threadId: 1, userStoryId: 0 }),
              doneEvent({ time: 4, threadId: 1, userStoryId: 0 }),
            ],
            statEvents: [],
            structureEvents: [createThread0(), createThread1(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();
      expect(wrapper.findAll('[data-flip-id="story-0"]').length).toStrictEqual(1);
      expect(
        wrapper
          .get('[data-testid=thread-user-story-0]')
          .find('[data-testid=user-story-0-0]')
          .exists(),
      ).toBe(true);
      expect(wrapper.get('[data-testid=backlog]').find('[data-testid=user-story-0]').exists()).toBe(
        false,
      );

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();
      expect(wrapper.findAll('[data-flip-id="story-0"]').length).toStrictEqual(1);
      expect(
        wrapper
          .get('[data-testid=thread-user-story-1]')
          .find('[data-testid=user-story-0-1]')
          .exists(),
      ).toBe(true);
      expect(
        wrapper
          .get('[data-testid=thread-user-story-0]')
          .find('[data-testid=user-story-0-0]')
          .exists(),
      ).toBe(false);

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();
      expect(wrapper.findAll('[data-flip-id="story-0"]').length).toStrictEqual(1);

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();
      expect(wrapper.findAll('[data-flip-id="story-0"]').length).toStrictEqual(1);
      expect(wrapper.get('[data-testid=done]').find('[data-testid=user-story-0]').exists()).toBe(
        true,
      );
      expect(
        wrapper
          .get('[data-testid=thread-user-story-1]')
          .find('[data-testid=user-story-0-1]')
          .exists(),
      ).toBe(false);
    });

    test('Should move story to review when same thread transitions from in-progress to review', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              inProgressEvent({ time: 1, threadId: 0, userStoryId: 0 }),
              reviewEvent({ time: 2, threadId: 0, userStoryId: 0 }),
            ],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.findAll('[data-flip-id="story-0"]').length).toStrictEqual(1);
      expect(
        wrapper
          .get('[data-testid=thread-user-story-0]')
          .find('[data-testid=user-story-0-0]')
          .exists(),
      ).toBe(true);
      expect(wrapper.get('[data-testid=thread-state-label-0]').text()).toBe('Review');
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

      const story = wrapper.get('[data-testid=user-story-0]');
      expect(story.get('[data-testid=story-name]').text()).toStrictEqual('US0');
      expect(story.get('[data-testid=priority-0] span').text()).toBe('2');
    });
  });

  describe('Story id surface', () => {
    test('Should show story name unchanged', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createUserStory({ id: 0, name: 'US0' })],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=story-name]').text()).toBe('US0');
    });

    test('Should surface story id as title on story-name in backlog', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createUserStory({ id: 0, name: 'US0' })],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=story-name]').attributes('title')).toBe('#0');
    });

    test('Should surface story id as title on story-name in thread in-progress', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent({ userStoryId: 0, threadId: 0 })],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0, name: 'US0' })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      expect(
        wrapper
          .get('[data-testid=user-story-0-0]')
          .get('[data-testid=story-name]')
          .attributes('title'),
      ).toBe('#0');
    });

    test('Should surface story id as title on story-name in thread review', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [reviewEvent({ threadId: 0, userStoryId: 0 })],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0, name: 'US0' })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      expect(
        wrapper
          .get('[data-testid=user-story-0-0]')
          .get('[data-testid=story-name]')
          .attributes('title'),
      ).toBe('#0');
    });

    test('Should surface story id as title on story-name in done', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [doneEvent({ userStoryId: 0, threadId: 0 })],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0, name: 'US0' })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      expect(
        wrapper
          .get('[data-testid=user-story-0]')
          .get('[data-testid=story-name]')
          .attributes('title'),
      ).toBe('#0');
    });
  });

  describe('Story card state icon', () => {
    test('Should display code icon on in-progress story card', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent()],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');

      const storyCard = wrapper.get('[data-testid=user-story-0-0]');
      expect(storyCard.get('[data-testid=story-state-icon]').text()).toBe('code');
    });

    test('Should display rate_review icon on review story card', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [reviewEvent()],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');

      const storyCard = wrapper.get('[data-testid=user-story-0-0]');
      expect(storyCard.get('[data-testid=story-state-icon]').text()).toBe('rate_review');
    });
  });

  describe('Priority chip', () => {
    test('Should have aria-label "Priority 1" when priority is 1', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0, name: 'US0' }),
              createChangePriority({ id: 0, value: 1 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=priority-0]').attributes('aria-label')).toEqual(
        'Priority 1',
      );
    });

    test('Should display flag icon inside priority chip', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0, name: 'US0' }),
              createChangePriority({ id: 0, value: 1 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.find('[data-testid=priority-0] i').exists()).toBe(true);
    });

    test('Should show priority chip on in-progress story', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent({ userStoryId: 0, threadId: 0 })],
            statEvents: [],
            structureEvents: [
              createThread0(),
              createUserStory({ id: 0 }),
              createChangePriority({ id: 0, value: 3 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      const card = wrapper.get('[data-testid=user-story-0-0]');
      expect(card.get('[data-testid=priority-0]').attributes('aria-label')).toEqual('Priority 3');
    });

    test('Should show priority chip on review story', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [reviewEvent({ userStoryId: 0, threadId: 0 })],
            statEvents: [],
            structureEvents: [
              createThread0(),
              createUserStory({ id: 0 }),
              createChangePriority({ id: 0, value: 5 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      const card = wrapper.get('[data-testid=user-story-0-0]');
      expect(card.get('[data-testid=priority-0]').attributes('aria-label')).toEqual('Priority 5');
    });

    test('Should show priority chip on done story', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              inProgressEvent({ userStoryId: 0, threadId: 0 }),
              doneEvent({ userStoryId: 0, threadId: 0 }),
            ],
            statEvents: [],
            structureEvents: [
              createThread0(),
              createUserStory({ id: 0 }),
              createChangePriority({ id: 0, value: 2 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      const card = wrapper.get('[data-testid=user-story-0]');
      expect(card.get('[data-testid=priority-0]').attributes('aria-label')).toEqual('Priority 2');
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

    test('Should have aria-label "Advance one step" on compute button', () => {
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

      expect(wrapper.get('[data-testid=compute]').attributes('aria-label')).toEqual(
        'Advance one step',
      );
    });

    test('Should have aria-label "Run full simulation" on compute-all button', () => {
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

      expect(wrapper.get('[data-testid=compute-all]').attributes('aria-label')).toEqual(
        'Run full simulation',
      );
    });
  });

  describe('Progress bar', () => {
    test('Should render progress bar with correct max and initial value', async () => {
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
            statEvents: [],
            structureEvents: [],
            teamType: 'Parallel',
          },
        ],
      });

      const progress = wrapper.get('[data-testid=progress]');
      expect(progress.attributes('max')).toEqual('1');
      expect(progress.attributes('value')).toEqual('0');
    });

    test('Should update progress bar value after compute', async () => {
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
            statEvents: [],
            structureEvents: [],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      const progress = wrapper.get('[data-testid=progress]');
      expect(progress.attributes('value')).toEqual('1');
    });

    test('Should have aria-live on stats container', async () => {
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
            statEvents: [],
            structureEvents: [],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=stats]').attributes('aria-live')).toEqual('polite');
    });

    test('Should have aria-label on stats container', () => {
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

      expect(wrapper.get('[data-testid=stats]').attributes('aria-label')).toEqual(
        'Simulation statistics',
      );
    });

    test('Should have aria-hidden on timer icon', () => {
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

      const timerIcon = wrapper.findAll('i').find((i) => i.text() === 'timer');
      expect(timerIcon).toBeDefined();
      expect(timerIcon!.attributes('aria-hidden')).toEqual('true');
    });

    test('Should have aria-hidden on inbox icon in backlog nav', () => {
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

      const inboxIcons = wrapper.findAll('i').filter((i) => i.text() === 'inbox');
      expect(inboxIcons.every((i) => i.attributes('aria-hidden') === 'true')).toBe(true);
    });
  });

  describe('Time display', () => {
    test('Should show empty time before first step', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [{ time: 2, userStoryId: 1, threadId: 1, state: 'InProgress' }],
            statEvents: [],
            structureEvents: [],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=time]').text()).toEqual('');
    });

    test('Should update time display after compute even without stat event', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [{ time: 2, userStoryId: 1, threadId: 1, state: 'InProgress' }],
            statEvents: [],
            structureEvents: [],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.get('[data-testid=time]').text()).toEqual('1/2');
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
      expect(leadTime.text()).toEqual('—');

      const time = wrapper.find('[data-testid=time]');
      expect(time.exists()).toBe(true);
      expect(time.text()).toEqual('');
    });

    test.each([
      [1 / 3, '0.33'],
      [Number.NaN, '—'],
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

  describe('Empty states', () => {
    test('Should show backlog-empty when backlog has no stories', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          { timeEvents: [], statEvents: [], structureEvents: [], teamType: 'Parallel' },
        ],
      });

      expect(wrapper.find('[data-testid=backlog-empty]').exists()).toBe(true);
    });

    test('Should hide backlog-empty when backlog has stories', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createUserStory({ id: 0, time: 1 })],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.find('[data-testid=backlog-empty]').exists()).toBe(false);
    });

    test('Should show done-empty when no story is completed', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          { timeEvents: [], statEvents: [], structureEvents: [], teamType: 'Parallel' },
        ],
      });

      expect(wrapper.find('[data-testid=done-empty]').exists()).toBe(true);
    });

    test('Should hide done-empty when a story is completed', async () => {
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

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.find('[data-testid=done-empty]').exists()).toBe(false);
    });
  });

  describe('Team type', () => {
    test('Should show Parallel team type', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          { timeEvents: [], statEvents: [], structureEvents: [], teamType: 'Parallel' },
        ],
      });

      expect(wrapper.get('[data-testid=team-type]').text()).toContain('Parallel');
    });

    test('Should show Ensemble team type', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          { timeEvents: [], statEvents: [], structureEvents: [], teamType: 'Ensemble' },
        ],
      });

      expect(wrapper.get('[data-testid=team-type]').text()).toContain('Ensemble');
    });
  });

  describe('Threads count and sort', () => {
    test('Should show "2 threads" chip with two threads', () => {
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

      expect(wrapper.get('[data-testid=threads-count]').text()).toEqual('2 threads');
    });
  });

  describe('Backlog count', () => {
    test('Should show "0 story" when backlog is empty', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          { timeEvents: [], statEvents: [], structureEvents: [], teamType: 'Parallel' },
        ],
      });

      expect(wrapper.get('[data-testid=backlog-count]').text()).toEqual('0 story');
    });

    test('Should show "1 story" when backlog has one story', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createUserStory({ id: 0, time: 1 })],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=backlog-count]').text()).toEqual('1 story');
    });

    test('Should show "2 stories" when backlog has two stories', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0, time: 1 }),
              createUserStory({ id: 1, time: 1 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=backlog-count]').text()).toEqual('2 stories');
    });
  });

  describe('Backlog sort by priority', () => {
    test('Should render story with highest priority first', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0 }),
              createChangePriority({ id: 0, value: 1 }),
              createUserStory({ id: 1 }),
              createChangePriority({ id: 1, value: 5 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      const cards = wrapper.get('[data-testid=backlog]').findAll('[data-testid^=user-story-]');
      expect(cards[0].attributes('data-testid')).toBe('user-story-1');
      expect(cards[1].attributes('data-testid')).toBe('user-story-0');
    });

    test('Should render story with null priority after stories with a priority', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0 }),
              createUserStory({ id: 1 }),
              createChangePriority({ id: 1, value: 3 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      const cards = wrapper.get('[data-testid=backlog]').findAll('[data-testid^=user-story-]');
      expect(cards[0].attributes('data-testid')).toBe('user-story-1');
      expect(cards[1].attributes('data-testid')).toBe('user-story-0');
    });
  });

  describe('Done count', () => {
    test('Should show "0 story" when no story is completed', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          { timeEvents: [], statEvents: [], structureEvents: [], teamType: 'Parallel' },
        ],
      });

      expect(wrapper.get('[data-testid=done-count]').text()).toEqual('0 story');
    });

    test('Should show "2 stories" when two stories are completed', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              inProgressEvent({ userStoryId: 0, threadId: 0 }),
              inProgressEvent({ userStoryId: 1, threadId: 1 }),
              doneEvent({ userStoryId: 0, threadId: 0 }),
              doneEvent({ userStoryId: 1, threadId: 1 }),
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

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.get('[data-testid=done-count]').text()).toEqual('2 stories');
    });
  });

  describe('Loader spinner', () => {
    test('Should not show loader at mount', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          { timeEvents: [], statEvents: [], structureEvents: [], teamType: 'Parallel' },
        ],
      });

      expect(wrapper.get('[data-testid=loader]').classes()).toContain('loader-hidden');
    });

    test('Should show loader after compute click while animation runs', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [doneEvent({ time: 1 }), doneEvent({ time: 2 })],
            statEvents: [],
            structureEvents: [],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');

      expect(wrapper.get('[data-testid=loader]').classes()).not.toContain('loader-hidden');
    });

    test('Should hide loader after compute animation completes', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [doneEvent({ time: 1 }), doneEvent({ time: 2 })],
            statEvents: [],
            structureEvents: [],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.get('[data-testid=loader]').classes()).toContain('loader-hidden');
    });

    test('Should hide loader after last compute step', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [doneEvent({ time: 1 })],
            statEvents: [],
            structureEvents: [],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.get('[data-testid=loader]').classes()).toContain('loader-hidden');
    });

    test('Should show loader after compute-all click while animation runs', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [doneEvent({ time: 1 }), doneEvent({ time: 2 })],
            statEvents: [],
            structureEvents: [],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute-all]').trigger('click');

      expect(wrapper.get('[data-testid=loader]').classes()).not.toContain('loader-hidden');
    });

    test('Should hide loader after compute-all animation completes', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [doneEvent({ time: 1 }), doneEvent({ time: 2 })],
            statEvents: [],
            structureEvents: [],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute-all]').trigger('click');
      await vi.runAllTimersAsync();

      expect(wrapper.get('[data-testid=loader]').classes()).toContain('loader-hidden');
    });
  });

  describe('Priority flash', () => {
    test('Should add priority-flash class to story card after ChangePriority event', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0, name: 'US0' }),
              createChangePriority({ id: 0, value: 1 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=user-story-0]').classes()).toContain('priority-flash');
    });

    test('Should remove priority-flash class after 800ms', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0, name: 'US0' }),
              createChangePriority({ id: 0, value: 1 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      await vi.advanceTimersByTimeAsync(801);

      expect(wrapper.get('[data-testid=user-story-0]').classes()).not.toContain('priority-flash');
    });

    test('Should add priority-flash class to in-progress story after ChangePriority event', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent({ userStoryId: 0, threadId: 0, time: 1 })],
            statEvents: [],
            structureEvents: [
              createThread0(),
              createUserStory({ id: 0, name: 'US0' }),
              createChangePriority({ id: 0, value: 1, time: 2 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.advanceTimersToNextTimerAsync();

      expect(wrapper.get('[data-testid=user-story-0-0]').classes()).toContain('priority-flash');
    });

    test('Should add priority-flash class to review story after ChangePriority event', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [reviewEvent({ userStoryId: 0, threadId: 0, time: 1 })],
            statEvents: [],
            structureEvents: [
              createThread0(),
              createUserStory({ id: 0, name: 'US0' }),
              createChangePriority({ id: 0, value: 1, time: 2 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.advanceTimersToNextTimerAsync();

      expect(wrapper.get('[data-testid=user-story-0-0]').classes()).toContain('priority-flash');
    });

    test('Should add priority-flash class to done story after ChangePriority event', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [
              inProgressEvent({ userStoryId: 0, threadId: 0, time: 1 }),
              doneEvent({ userStoryId: 0, threadId: 0, time: 2 }),
            ],
            statEvents: [],
            structureEvents: [
              createThread0(),
              createUserStory({ id: 0, name: 'US0' }),
              createChangePriority({ id: 0, value: 1, time: 3 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.advanceTimersToNextTimerAsync();
      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.advanceTimersToNextTimerAsync();

      expect(wrapper.get('[data-testid=user-story-0]').classes()).toContain('priority-flash');
    });
  });

  describe('Accessibility', () => {
    const makeWrapper = () =>
      createWrapper({
        simulationOutputs: [
          { timeEvents: [], statEvents: [], structureEvents: [], teamType: 'Parallel' },
        ],
      });

    test('Should have aria-hidden on timer icon', () => {
      const wrapper = makeWrapper();
      const timerIcon = wrapper.findAll('i').find((i) => i.text() === 'timer');
      expect(timerIcon).toBeDefined();
      expect(timerIcon!.attributes('aria-hidden')).toEqual('true');
    });

    test('Should have aria-hidden on inbox column header icon', () => {
      const wrapper = makeWrapper();
      const inboxIcons = wrapper.findAll('i').filter((i) => i.text() === 'inbox');
      expect(inboxIcons.length).toBeGreaterThan(0);
      expect(inboxIcons.every((i) => i.attributes('aria-hidden') === 'true')).toBe(true);
    });

    test('Should have aria-label "Simulation statistics" on stats container', () => {
      const wrapper = makeWrapper();
      expect(wrapper.get('[data-testid=stats]').attributes('aria-label')).toEqual(
        'Simulation statistics',
      );
    });
  });

  describe('Compute buttons accessibility', () => {
    test('Should have aria-label "Advance one step" on compute button', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          { timeEvents: [], statEvents: [], structureEvents: [], teamType: 'Parallel' },
        ],
      });
      expect(wrapper.get('[data-testid=compute]').attributes('aria-label')).toEqual(
        'Advance one step',
      );
    });

    test('Should have aria-label "Run full simulation" on compute-all button', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          { timeEvents: [], statEvents: [], structureEvents: [], teamType: 'Parallel' },
        ],
      });
      expect(wrapper.get('[data-testid=compute-all]').attributes('aria-label')).toEqual(
        'Run full simulation',
      );
    });
  });

  describe('Back button', () => {
    test('Should render back button with correct aria-label', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          { timeEvents: [], statEvents: [], structureEvents: [], teamType: 'Parallel' },
        ],
      });

      const btn = wrapper.get('[data-testid=back-button]');
      expect(btn.attributes('aria-label')).toEqual('Back to simulations');
    });

    test('Should navigate to /simulate on back button click', async () => {
      const mockPush = vi.fn();
      vi.mocked(useRouter).mockReturnValueOnce({ push: mockPush } as unknown as Router);

      const wrapper = createWrapper({
        simulationOutputs: [
          { timeEvents: [], statEvents: [], structureEvents: [], teamType: 'Parallel' },
        ],
      });

      await wrapper.get('[data-testid=back-button]').trigger('click');

      expect(mockPush).toHaveBeenCalledWith('/simulate');
    });
  });

  describe('Thread header structure', () => {
    test('Should wrap thread name and state in a header element', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createThread0()],
            teamType: 'Parallel',
          },
        ],
      });

      const thread = wrapper.get('[data-testid=thread0]');
      expect(thread.find('.thread-header').exists()).toBe(true);
      expect(thread.find('.thread-header [data-testid=thread-title-0]').exists()).toBe(true);
      expect(thread.find('.thread-header [data-testid=thread-state-0]').exists()).toBe(true);
    });
  });

  describe('Priority chip color', () => {
    test('Should apply primary class to priority 5+', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0 }),
              createChangePriority({ id: 0, value: 5 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=priority-0]').classes()).toContain(
        'priority-badge--primary',
      );
    });

    test('Should apply secondary class to priority 2 (lower bound)', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0 }),
              createChangePriority({ id: 0, value: 2 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=priority-0]').classes()).toContain(
        'priority-badge--secondary',
      );
    });

    test('Should apply secondary class to priority 4 (upper bound)', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0 }),
              createChangePriority({ id: 0, value: 4 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=priority-0]').classes()).toContain(
        'priority-badge--secondary',
      );
    });

    test('Should apply tertiary class to priority 1', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [
              createUserStory({ id: 0 }),
              createChangePriority({ id: 0, value: 1 }),
            ],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.get('[data-testid=priority-0]').classes()).toContain(
        'priority-badge--tertiary',
      );
    });
  });

  describe('Thread idle hint', () => {
    test('Should show "No story assigned" hint when thread is Wait and no stories', () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [],
            statEvents: [],
            structureEvents: [createThread0()],
            teamType: 'Parallel',
          },
        ],
      });

      expect(wrapper.find('[data-testid=thread-idle-0]').exists()).toBe(true);
    });

    test('Should hide hint when thread has in-progress story', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [inProgressEvent(), doneEvent({ time: 2 })],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.advanceTimersToNextTimerAsync();

      expect(wrapper.find('[data-testid=thread-idle-0]').exists()).toBe(false);
    });

    test('Should hide hint when thread has review story', async () => {
      const wrapper = createWrapper({
        simulationOutputs: [
          {
            timeEvents: [reviewEvent(), doneEvent({ time: 2 })],
            statEvents: [],
            structureEvents: [createThread0(), createUserStory({ id: 0 })],
            teamType: 'Parallel',
          },
        ],
      });

      await wrapper.get('[data-testid=compute]').trigger('click');
      await vi.advanceTimersToNextTimerAsync();

      expect(wrapper.find('[data-testid=thread-idle-0]').exists()).toBe(false);
    });

    test('Should hide hint when thread is Off', () => {
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

      expect(wrapper.find('[data-testid=thread-idle-0]').exists()).toBe(false);
    });
  });
});
