import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  doneEvent,
  inProgressEvent,
  reviewEvent,
  toReviewEvent,
} from '../simulate/factory.ts';
import type { StructureEvent } from '../simulate/simulation-structure.ts';
import {
  getCompute,
  getComputeAll,
  getThread,
  getThreadState,
  getThreadTitle,
  getThreadUserStoryContainer,
  getUserStory,
} from './selector.ts';
import {
  saveStatEvents,
  saveStructureEvents,
  saveTimeEvents,
} from './storage/session-storage.ts';

describe('Flow', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      assign: vi.fn(),
      search: '?id=e4567-e89b-12d3-a456-426614174000',
    } as unknown as Location);
    const htmlPath = resolve(__dirname, './flow.html');
    document.body.innerHTML = readFileSync(htmlPath, 'utf-8');
    vi.useFakeTimers();
    sessionStorage.clear();
  });

  test('Should render the page without time events', async () => {
    saveTimeEvents([], 'e4567-e89b-12d3-a456-426614174000');
    await import('./flow.ts');

    const threads = document.querySelector('#threads');
    expect(threads).not.toBeNull();
    const backlog = document.querySelector('#backlog');
    expect(backlog).not.toBeNull();
    const done = document.querySelector('#done');
    expect(done).not.toBeNull();
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

  const setThreadOff = (
    options: Partial<Pick<StructureEvent, 'id' | 'time'>>,
  ): StructureEvent => ({
    id: 0,
    action: 'ThreadOff',
    time: 1,
    ...options,
  });

  const setThreadIn = (
    options: Partial<Pick<StructureEvent, 'id' | 'time'>>,
  ): StructureEvent => ({
    id: 0,
    action: 'ThreadIn',
    time: 1,
    ...options,
  });

  const createUserStory = (
    options: Partial<StructureEvent>,
  ): StructureEvent => ({
    id: 0,
    name: 'user-story-0',
    action: 'CreateUserStory',
    time: 1,
    ...options,
  });

  describe('Thread', () => {
    test('Should initialize 2 thread elements', async () => {
      saveStructureEvents(
        [createThread0(), createThread1()],
        'e4567-e89b-12d3-a456-426614174000',
      );

      await import('./flow.ts');
      const thread0 = getThread(0);
      expect(thread0?.className).toEqual('thread');

      const threadTitle0 = getThreadTitle(0);
      expect(threadTitle0?.textContent).toEqual('dev0');

      const threadUserStory0 = getThreadUserStoryContainer(0);
      expect(threadUserStory0).not.toBeNull();

      const threadState0 = getThreadState(0);
      expect(threadState0?.textContent).toEqual('Wait');

      const thread1 = getThread(1);
      expect(thread1?.className).toEqual('thread');

      const threadTitle1 = getThreadTitle(1);
      expect(threadTitle1?.textContent).toEqual('dev1');

      const threadUserStory1 = getThreadUserStoryContainer(1);
      expect(threadUserStory1).not.toBeNull();

      const threadState1 = getThreadState(1);
      expect(threadState1?.textContent).toEqual('Wait');
    });

    test('Should set thread off on computation click', async () => {
      saveStructureEvents(
        [createThread0(), setThreadOff({ id: 0, time: 2 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      expect(getThread(0)?.style.opacity).toEqual('');

      getCompute()?.click();
      await vi.advanceTimersToNextTimerAsync();

      expect(getThread(0)?.style.opacity).toEqual('50%');
    });

    test('Should set thread off on all computation click', async () => {
      saveStructureEvents(
        [createThread0(), setThreadOff({ id: 0, time: 2 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [doneEvent({ time: 2 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      expect(getThread(0)?.style.opacity).toEqual('');

      getComputeAll()?.click();
      await vi.runAllTimersAsync();

      expect(getThread(0)?.style.opacity).toEqual('50%');
    });

    test('Should set thread in on computation click', async () => {
      saveStructureEvents(
        [createThread0(), setThreadIn({ id: 0, time: 2 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      expect(getThread(0)?.style.opacity).toEqual('');

      getCompute()?.click();
      await vi.advanceTimersToNextTimerAsync();

      expect(getThread(0)?.style.opacity).toEqual('100%');
    });

    test('Should set thread in on all computation click', async () => {
      saveStructureEvents(
        [createThread0(), setThreadIn({ id: 0, time: 2 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [doneEvent({ time: 2 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      expect(getThread(0)?.style.opacity).toEqual('');

      getComputeAll()?.click();
      await vi.runAllTimersAsync();

      expect(getThread(0)?.style.opacity).toEqual('100%');
    });

    test('Should set thread state to "Develop" when in progress', async () => {
      saveStructureEvents(
        [createThread0(), createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [inProgressEvent(), doneEvent()],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.advanceTimersToNextTimerAsync();
      expect(getThreadState(0)?.textContent).toEqual('Develop');

      await vi.advanceTimersToNextTimerAsync();
      expect(getThreadState(0)?.textContent).toEqual('Develop');
    });

    test('Should set thread state to "Review" when in review', async () => {
      saveStructureEvents(
        [createThread0(), createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [reviewEvent(), doneEvent()],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.advanceTimersToNextTimerAsync();
      expect(getThreadState(0)?.textContent).toEqual('Review');

      await vi.advanceTimersToNextTimerAsync();
      expect(getThreadState(0)?.textContent).toEqual('Review');
    });

    test('Should set thread state to "Develop" when to review', async () => {
      saveStructureEvents(
        [createThread0(), createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [inProgressEvent(), toReviewEvent()],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();

      expect(getThreadState(0)?.textContent).toEqual('Develop');
    });

    test('Should set thread state to "Wait" when idle', async () => {
      saveStructureEvents(
        [createThread0(), createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          inProgressEvent(),
          toReviewEvent(),
          doneEvent({ time: 2, userStoryId: -1 }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getComputeAll()?.click();
      await vi.runAllTimersAsync();

      expect(getThreadState(0)?.textContent).toEqual('Wait');
    });
  });

  describe('User story', () => {
    test('Should initialize 2 userStories elements', async () => {
      saveStructureEvents(
        [
          createUserStory({ id: 0, name: 'US0' }),
          createUserStory({ id: 1, name: 'US1' }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          inProgressEvent({ userStoryId: 0 }),
          inProgressEvent({ userStoryId: 1 }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');
      const userStory1 = getUserStory(0);
      expect(userStory1?.className).toEqual('userStory');
      expect(userStory1?.textContent).toEqual('US0');

      const userStory2 = getUserStory(1);
      expect(userStory2?.className).toEqual('userStory');
      expect(userStory2?.textContent).toEqual('US1');
    });

    test('Should add a user story on computation click', async () => {
      saveStructureEvents(
        [createUserStory({ id: 0, time: 2 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      expect(getUserStory(0)).toBeNull();

      getCompute()?.click();
      await vi.advanceTimersToNextTimerAsync();

      expect(getUserStory(0)).not.toBeNull();
    });

    test('Should add a user story on all computation click', async () => {
      saveStructureEvents(
        [createUserStory({ id: 0, time: 2 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [doneEvent({ time: 2 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      expect(getUserStory(0)).toBeNull();

      getComputeAll()?.click();
      await vi.runAllTimersAsync();

      expect(getUserStory(0)).not.toBeNull();
    });

    test('Should move userStories to thread when in progress, then done', async () => {
      saveStructureEvents(
        [createThread0(), createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [inProgressEvent(), doneEvent()],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.advanceTimersToNextTimerAsync();
      expect(
        document.querySelector('#thread-user-story-0 #user-story-0-0'),
      ).not.toBeNull();

      await vi.advanceTimersToNextTimerAsync();
      expect(document.querySelector('#done #user-story-0')).not.toBeNull();
    });

    test('Should move userStories with id >10 to thread when in progress, then done', async () => {
      saveStructureEvents(
        [
          createThread0(),
          createThread1(),
          createUserStory({ id: 1, name: 'US1' }),
          createUserStory({ id: 10, name: 'US10' }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          inProgressEvent({ userStoryId: 1, threadId: 0 }),
          inProgressEvent({ userStoryId: 10, threadId: 1 }),
          doneEvent({ userStoryId: 1, threadId: 0 }),
          doneEvent({ userStoryId: 10, threadId: 1 }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();

      await vi.advanceTimersToNextTimerAsync();
      expect(
        document.querySelector('#thread-user-story-0 #user-story-1-0'),
      ).not.toBeNull();
      await vi.advanceTimersToNextTimerAsync();
      expect(
        document.querySelector('#thread-user-story-1 #user-story-10-1'),
      ).not.toBeNull();

      await vi.advanceTimersToNextTimerAsync();
      expect(document.querySelector('#done #user-story-1')).not.toBeNull();
      await vi.advanceTimersToNextTimerAsync();
      expect(document.querySelector('#done #user-story-10')).not.toBeNull();
    });

    test('Should keep userStories to thread when in progress', async () => {
      saveStructureEvents(
        [createThread0(), createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [inProgressEvent(), inProgressEvent()],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();
      expect(
        document.querySelector('#thread-user-story-0 #user-story-0-0'),
      ).not.toBeNull();
    });

    test('Should move userStories to thread when in review, then done', async () => {
      saveStructureEvents(
        [createThread1(), createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [reviewEvent({ threadId: 1 }), doneEvent({ threadId: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.advanceTimersToNextTimerAsync();
      expect(
        document.querySelector('#thread-user-story-1 #user-story-0-1'),
      ).not.toBeNull();

      await vi.advanceTimersToNextTimerAsync();
      expect(document.querySelector('#done #user-story-0')).not.toBeNull();
    });

    test('Should remove userStories from thread that was in review when done', async () => {
      saveStructureEvents(
        [createThread0(), createThread1(), createUserStory({ id: 2 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          reviewEvent({ threadId: 0, userStoryId: 2 }),
          reviewEvent({ threadId: 1, userStoryId: 2 }),
          doneEvent({ threadId: 2, userStoryId: 2 }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();
      expect(
        document.querySelector('#thread-user-story-1 #user-story-2-1'),
      ).toBeNull();
      expect(
        document.querySelector('#thread-user-story-0 #user-story-2-0'),
      ).toBeNull();
      expect(document.querySelector('#done #user-story-2')).not.toBeNull();
    });

    test('Should remove userStories from thread that was in review when to review', async () => {
      saveStructureEvents(
        [createThread0(), createThread1(), createUserStory({ id: 2 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          reviewEvent({ threadId: 0, userStoryId: 2 }),
          reviewEvent({ threadId: 1, userStoryId: 2 }),
          toReviewEvent({ threadId: 2, userStoryId: 2 }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();
      expect(
        document.querySelector('#thread-user-story-1 #user-story-2-1'),
      ).toBeNull();
      expect(
        document.querySelector('#thread-user-story-0 #user-story-2-0'),
      ).toBeNull();
      expect(document.querySelector('#backlog #user-story-2')).not.toBeNull();
    });

    test('Should move userStories to the backlog area when to review', async () => {
      saveStructureEvents(
        [createThread0(), createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [inProgressEvent(), toReviewEvent()],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();

      expect(document.querySelector('#backlog #user-story-0')).not.toBeNull();
    });

    test('Should move userStories to the corresponding threads when reviewed by several threads', async () => {
      saveStructureEvents(
        [
          createThread0(),
          createThread1(),
          createUserStory({ id: 0, name: 'US0' }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [reviewEvent({ threadId: 0 }), reviewEvent({ threadId: 1 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();
      const firstDiv = document.querySelector(
        '#thread-user-story-0 #user-story-0-0',
      );
      expect(firstDiv).not.toBeNull();
      expect(firstDiv?.textContent).toEqual('US0');
      const secondDiv = document.querySelector(
        '#thread-user-story-1 #user-story-0-1',
      );
      expect(secondDiv).not.toBeNull();
      expect(secondDiv?.textContent).toEqual('US0');
      expect(document.querySelector('#backlog #user-story-0')).toBeNull();
    });

    test('Should keep only one review when the other one is completed', async () => {
      saveStructureEvents(
        [createThread0(), createThread1(), createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          reviewEvent({ threadId: 0 }),
          reviewEvent({ threadId: 1 }),
          doneEvent({ time: 2, threadId: 0, userStoryId: -1 }),
          reviewEvent({ time: 2, threadId: 1 }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();

      getCompute()?.click();
      await vi.runAllTimersAsync();

      expect(
        document.querySelector('#thread-user-story-1 #user-story-0-1'),
      ).not.toBeNull();
      expect(
        document.querySelector('#thread-user-story-0 #user-story-0-0'),
      ).toBeNull();
    });

    test('Should remove ended review when a in progress task starts', async () => {
      saveStructureEvents(
        [
          createThread0(),
          createThread1(),
          createUserStory({ id: 0 }),
          createUserStory({ id: 1 }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          reviewEvent({ threadId: 0 }),
          reviewEvent({ threadId: 1 }),
          inProgressEvent({ time: 2, threadId: 0, userStoryId: 1 }),
          reviewEvent({ time: 2, threadId: 1 }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();

      getCompute()?.click();
      await vi.runAllTimersAsync();

      expect(
        document.querySelector('#thread-user-story-1 #user-story-0-1'),
      ).not.toBeNull();
      expect(
        document.querySelector('#thread-user-story-0 #user-story-0-0'),
      ).toBeNull();
    });

    test('Should keep two reviews when reviews last', async () => {
      saveStructureEvents(
        [createThread0(), createThread1(), createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          reviewEvent({ time: 1, threadId: 0 }),
          reviewEvent({ time: 1, threadId: 1 }),
          reviewEvent({ time: 2, threadId: 0 }),
          reviewEvent({ time: 2, threadId: 1 }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();

      getCompute()?.click();
      await vi.runAllTimersAsync();

      expect(
        document.querySelectorAll('#thread-user-story-0 #user-story-0-0')
          .length,
      ).toEqual(1);
      expect(
        document.querySelectorAll('#thread-user-story-1 #user-story-0-1')
          .length,
      ).toEqual(1);
      expect(document.querySelector('#user-story-0')).toBeNull();
    });

    test('Should not display "idle" user story', async () => {
      saveStructureEvents(
        [createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          inProgressEvent({ time: 1, threadId: 0 }),
          doneEvent({ time: 1, threadId: 1, userStoryId: -1 }),
          inProgressEvent({ time: 2, threadId: 0 }),
          doneEvent({ time: 2, threadId: 0 }),
          doneEvent({ time: 2, threadId: 1, userStoryId: -1 }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );

      await import('./flow.ts');

      getComputeAll()?.click();
      await vi.runAllTimersAsync();

      expect(document.querySelector('#idle')).toBeNull();
    });
  });

  describe('Compute', () => {
    test('Should compute all on click on compute All button', async () => {
      saveStructureEvents(
        [createThread0(), createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          inProgressEvent({ time: 1 }),
          inProgressEvent({ time: 2 }),
          doneEvent({ time: 2 }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );

      await import('./flow.ts');

      getComputeAll()?.click();
      await vi.runAllTimersAsync();

      expect(document.querySelector('#done #user-story-0')).not.toBeNull();
    });

    test('Should disable "compute" button during display', async () => {
      saveStructureEvents(
        [createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          inProgressEvent({ time: 1 }),
          inProgressEvent({ time: 2 }),
          doneEvent({ time: 2 }),
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );

      await import('./flow.ts');

      getCompute()?.click();
      expect(getCompute()?.disabled).toBeTruthy();
      await vi.runAllTimersAsync();

      expect(getCompute()?.disabled).toBeFalsy();
    });

    test('Should disable "compute" button when finished', async () => {
      saveStructureEvents(
        [createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [inProgressEvent(), doneEvent()],
        'e4567-e89b-12d3-a456-426614174000',
      );

      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();

      expect(getCompute()?.disabled).toBeTruthy();
    });

    test('Should disable "compute all" button when finished', async () => {
      saveStructureEvents(
        [createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [inProgressEvent(), doneEvent()],
        'e4567-e89b-12d3-a456-426614174000',
      );

      await import('./flow.ts');

      getComputeAll()?.click();
      await vi.runAllTimersAsync();

      expect(getComputeAll()?.disabled).toBeTruthy();
    });
  });

  describe('Stats', () => {
    test('Should render the page without stat events', async () => {
      saveTimeEvents([], 'e4567-e89b-12d3-a456-426614174000');
      saveStatEvents([], 'e4567-e89b-12d3-a456-426614174000');
      await import('./flow.ts');

      const leadTime = document.querySelector('#lead-time');
      expect(leadTime).not.toBeNull();
      expect(leadTime?.textContent).toEqual('');

      const time = document.querySelector('#time');
      expect(time).not.toBeNull();
      expect(time?.textContent).toEqual('');
    });

    test.each([
      [1 / 3, '0.33'],
      [Number.NaN, 'NaN'],
    ])(
      'Should render the page with a stat event',
      async (leadTimeProvided, leadTimeDisplayed) => {
        saveTimeEvents(
          [
            {
              time: 1,
              userStoryId: 1,
              threadId: 1,
              state: 'InProgress',
            },
          ],
          'e4567-e89b-12d3-a456-426614174000',
        );
        saveStatEvents(
          [
            {
              time: 1,
              leadTime: leadTimeProvided,
            },
          ],
          'e4567-e89b-12d3-a456-426614174000',
        );
        await import('./flow.ts');

        getCompute()?.click();
        await vi.runAllTimersAsync();

        const leadTime = document.querySelector('#lead-time');
        expect(leadTime?.textContent).toEqual(leadTimeDisplayed);

        const time = document.querySelector('#time');
        expect(time?.textContent).toEqual('1/1');
      },
    );
  });
});
