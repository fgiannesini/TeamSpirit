import { beforeEach, describe, expect, test, vi } from 'vitest';
import { State } from '../compute/user-story.ts';
import {
  getCompute,
  getComputeAll,
  getThread,
  getUserStory,
} from './selector.ts';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { saveStatEvents, saveTimeEvents } from './session-storage.ts';

describe('Flow', () => {
  beforeEach(async () => {
    vi.resetModules();
    const htmlPath = resolve(__dirname, './flow.html');
    document.body.innerHTML = readFileSync(htmlPath, 'utf-8');
    vi.useFakeTimers();
  });

  test('Should render the page without time events', async () => {
    saveTimeEvents([]);
    await import('./flow.ts');

    const threads = document.querySelector('#threads');
    expect(threads).not.toBeNull();
    const backlog = document.querySelector('#backlog');
    expect(backlog).not.toBeNull();
    const done = document.querySelector('#done');
    expect(done).not.toBeNull();
  });

  test('Should render the page without stat events', async () => {
    saveTimeEvents([]);
    saveStatEvents([]);
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
    [NaN, 'NaN'],
  ])(
    'Should render the page with a stat event',
    async (leadTimeProvided, leadTimeDisplayed) => {
      saveTimeEvents([]);
      saveStatEvents([
        {
          time: 1,
          leadTime: leadTimeProvided,
        },
      ]);
      await import('./flow.ts');

      getCompute()?.click();
      await vi.advanceTimersToNextTimerAsync();

      const leadTime = document.querySelector('#lead-time');
      expect(leadTime?.textContent).toEqual(leadTimeDisplayed);

      const time = document.querySelector('#time');
      expect(time?.textContent).toEqual('1');
    },
  );

  test('Should create 2 thread elements', async () => {
    saveTimeEvents([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.DONE,
      },
    ]);
    await import('./flow.ts');
    const thread0 = getThread(0);
    expect(thread0?.className).toEqual('thread');
    expect(thread0?.textContent).toEqual('thread 0');

    const thread1 = getThread(1);
    expect(thread1?.className).toEqual('thread');
    expect(thread1?.textContent).toEqual('thread 1');
  });

  test('Should create 2 userStories elements', async () => {
    saveTimeEvents([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.IN_PROGRESS,
      },
    ]);
    await import('./flow.ts');
    const userStory1 = getUserStory('userStory1');
    expect(userStory1?.className).toEqual('userStory');
    expect(userStory1?.textContent).toEqual('userStory1');

    const userStory2 = getUserStory('userStory2');
    expect(userStory2?.className).toEqual('userStory');
    expect(userStory2?.textContent).toEqual('userStory2');
  });

  test('Should move userStories to thread when in progress, then done', async () => {
    saveTimeEvents([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
    ]);
    await import('./flow.ts');

    getCompute()?.click();
    await vi.advanceTimersToNextTimerAsync();
    expect(document.querySelector('#thread0 #userStory1')).not.toBeNull();

    await vi.advanceTimersToNextTimerAsync();
    expect(document.querySelector('#done #userStory1')).not.toBeNull();
  });

  test('Should move userStories to thread when in review, then done', async () => {
    saveTimeEvents([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.REVIEW,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
    ]);
    await import('./flow.ts');

    getCompute()?.click();
    await vi.advanceTimersToNextTimerAsync();
    expect(document.querySelector('#thread0 #userStory1')).not.toBeNull();

    await vi.advanceTimersToNextTimerAsync();
    expect(document.querySelector('#done #userStory1')).not.toBeNull();
  });

  test('Should move userStories to the backlog area when to review', async () => {
    saveTimeEvents([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.TO_REVIEW,
      },
    ]);
    await import('./flow.ts');

    getCompute()?.click();

    expect(document.querySelector('#backlog #userStory1')).not.toBeNull();
  });

  test('Should move userStories to the corresponding threads when reviewed by several threads', async () => {
    saveTimeEvents([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.REVIEW,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 2,
        state: State.REVIEW,
      },
    ]);
    await import('./flow.ts');

    getCompute()?.click();
    await vi.runAllTimersAsync();
    expect(document.querySelector('#thread1 #userStory1_1')).not.toBeNull();
    expect(document.querySelector('#thread2 #userStory1_2')).not.toBeNull();
    expect(document.querySelector('#backlog #userStory1')).toBeNull();
  });

  test('Should keep only one review when the other one is completed', async () => {
    saveTimeEvents([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.REVIEW,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 2,
        state: State.REVIEW,
      },
      {
        time: 2,
        userStoryName: 'idle',
        thread: 1,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 2,
        state: State.REVIEW,
      },
    ]);
    await import('./flow.ts');

    getCompute()?.click();
    await vi.runAllTimersAsync();

    getCompute()?.click();
    await vi.runAllTimersAsync();

    expect(document.querySelector('#thread2 #userStory1')).not.toBeNull();
    expect(document.querySelector('#thread1 #userStory1_1')).toBeNull();
    expect(document.querySelector('#thread2 #userStory1_2')).toBeNull();
  });

  test('Should keep two reviews when reviews last', async () => {
    saveTimeEvents([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.REVIEW,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 2,
        state: State.REVIEW,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.REVIEW,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 2,
        state: State.REVIEW,
      },
    ]);
    await import('./flow.ts');

    getCompute()?.click();
    await vi.runAllTimersAsync();

    getCompute()?.click();
    await vi.runAllTimersAsync();

    expect(document.querySelectorAll('#thread1 #userStory1_1').length).toEqual(
      1,
    );
    expect(document.querySelectorAll('#thread2 #userStory1_2').length).toEqual(
      1,
    );
    expect(document.querySelector('#userStory1')).toBeNull();
  });

  test('Should compute all on click on compute All button', async () => {
    saveTimeEvents([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      { time: 3, userStoryName: 'userStory1', thread: 0, state: State.DONE },
    ]);

    await import('./flow.ts');

    getComputeAll()?.click();
    await vi.runAllTimersAsync();

    expect(document.querySelector(' #done #userStory1')).not.toBeNull();
  });
});
