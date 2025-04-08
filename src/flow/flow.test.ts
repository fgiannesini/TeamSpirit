import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { StructureEvent } from '../simulate/simulation-structure.ts';
import { State } from '../simulate/user-story.ts';
import {
  getCompute,
  getComputeAll,
  getThread,
  getThreadState,
  getThreadTitle,
  getThreadUserStory,
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

      const threadUserStory0 = getThreadUserStory(0);
      expect(threadUserStory0).not.toBeNull();

      const threadState0 = getThreadState(0);
      expect(threadState0?.textContent).toEqual('Wait');

      const thread1 = getThread(1);
      expect(thread1?.className).toEqual('thread');

      const threadTitle1 = getThreadTitle(1);
      expect(threadTitle1?.textContent).toEqual('dev1');

      const threadUserStory1 = getThreadUserStory(1);
      expect(threadUserStory1).not.toBeNull();

      const threadState1 = getThreadState(1);
      expect(threadState1?.textContent).toEqual('Wait');
    });

    test('Should set thread state to "Develop" when in progress', async () => {
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Done,
          },
        ],
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
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Review,
          },
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Done,
          },
        ],
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
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.ToReview,
          },
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();

      expect(getThreadState(0)?.textContent).toEqual('Develop');
    });

    test('Should set thread state to "Wait" when idle', async () => {
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.ToReview,
          },
          {
            time: 2,
            userStoryId: 'idle',
            threadId: 0,
            state: State.Done,
          },
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
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          {
            time: 1,
            userStoryId: 'userStory2',
            threadId: 1,
            state: State.InProgress,
          },
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');
      const userStory1 = getUserStory('userStory1');
      expect(userStory1?.className).toEqual('userStory');
      expect(userStory1?.textContent).toEqual('userStory1');

      const userStory2 = getUserStory('userStory2');
      expect(userStory2?.className).toEqual('userStory');
      expect(userStory2?.textContent).toEqual('userStory2');
    });

    test('Should move userStories to thread when in progress, then done', async () => {
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Done,
          },
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.advanceTimersToNextTimerAsync();
      expect(
        document.querySelector('#thread-user-story-0 #userStory1'),
      ).not.toBeNull();

      await vi.advanceTimersToNextTimerAsync();
      expect(document.querySelector('#done #userStory1')).not.toBeNull();
    });

    test('Should move userStories to thread when in review, then done', async () => {
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Review,
          },
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Done,
          },
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.advanceTimersToNextTimerAsync();
      expect(
        document.querySelector('#thread-user-story-0 #userStory1'),
      ).not.toBeNull();

      await vi.advanceTimersToNextTimerAsync();
      expect(document.querySelector('#done #userStory1')).not.toBeNull();
    });

    test('Should move userStories to the backlog area when to review', async () => {
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.ToReview,
          },
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();

      expect(document.querySelector('#backlog #userStory1')).not.toBeNull();
    });

    test('Should move userStories to the corresponding threads when reviewed by several threads', async () => {
      saveStructureEvents(
        [createThread0(), createThread1()],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Review,
          },
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 1,
            state: State.Review,
          },
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();
      expect(
        document.querySelector('#thread-user-story-0 #userStory1_0'),
      ).not.toBeNull();
      expect(
        document.querySelector('#thread-user-story-1 #userStory1_1'),
      ).not.toBeNull();
      expect(document.querySelector('#backlog #userStory1')).toBeNull();
    });

    test('Should keep only one review when the other one is completed', async () => {
      saveStructureEvents(
        [createThread0(), createThread1()],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Review,
          },
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 1,
            state: State.Review,
          },
          {
            time: 2,
            userStoryId: 'idle',
            threadId: 0,
            state: State.Done,
          },
          {
            time: 2,
            userStoryId: 'userStory1',
            threadId: 1,
            state: State.Review,
          },
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();

      getCompute()?.click();
      await vi.runAllTimersAsync();

      expect(
        document.querySelector('#thread-user-story-1 #userStory1'),
      ).not.toBeNull();
      expect(
        document.querySelector('#thread-user-story-0 #userStory1_0'),
      ).toBeNull();
      expect(
        document.querySelector('#thread-user-story-1 #userStory1_1'),
      ).toBeNull();
    });

    test('Should keep two reviews when reviews last', async () => {
      saveStructureEvents(
        [createThread0(), createThread1()],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Review,
          },
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 1,
            state: State.Review,
          },
          {
            time: 2,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Review,
          },
          {
            time: 2,
            userStoryId: 'userStory1',
            threadId: 1,
            state: State.Review,
          },
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();

      getCompute()?.click();
      await vi.runAllTimersAsync();

      expect(
        document.querySelectorAll('#thread-user-story-0 #userStory1_0').length,
      ).toEqual(1);
      expect(
        document.querySelectorAll('#thread-user-story-1 #userStory1_1').length,
      ).toEqual(1);
      expect(document.querySelector('#userStory1')).toBeNull();
    });

    test('Should not display "idle" user story', async () => {
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          { time: 1, userStoryId: 'idle', threadId: 1, state: State.Done },
          {
            time: 2,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          {
            time: 2,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Done,
          },
          { time: 2, userStoryId: 'idle', threadId: 1, state: State.Done },
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
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          {
            time: 2,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          {
            time: 2,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Done,
          },
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );

      await import('./flow.ts');

      getComputeAll()?.click();
      await vi.runAllTimersAsync();

      expect(document.querySelector(' #done #userStory1')).not.toBeNull();
    });

    test('Should disable "compute" button during display', async () => {
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          {
            time: 2,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          {
            time: 2,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Done,
          },
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
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Done,
          },
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );

      await import('./flow.ts');

      getCompute()?.click();
      await vi.runAllTimersAsync();

      expect(getCompute()?.disabled).toBeTruthy();
    });

    test('Should disable "compute all" button when finished', async () => {
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.InProgress,
          },
          {
            time: 1,
            userStoryId: 'userStory1',
            threadId: 0,
            state: State.Done,
          },
        ],
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
              userStoryId: 'US1',
              threadId: 1,
              state: State.InProgress,
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
