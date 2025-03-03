import { beforeEach, describe, expect, it, vi } from 'vitest';
import { State } from '../compute/user-story.ts';
import { getCompute, getThread, getUserStory } from './selector.ts';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { saveTimeEvents } from './session-storage.ts';

describe('Flow', () => {
  beforeEach(async () => {
    vi.resetModules();
    const htmlPath = resolve(__dirname, './flow.html');
    document.body.innerHTML = readFileSync(htmlPath, 'utf-8');
    vi.useFakeTimers();
  });

  it('Should render the page without events', async () => {
    saveTimeEvents([]);
    await import('./flow.ts');

    let threads = document.querySelector('#threads');
    expect(threads).not.toBeNull();
    let backlog = document.querySelector('#backlog');
    expect(backlog).not.toBeNull();
    let done = document.querySelector('#done');
    expect(done).not.toBeNull();
  });

  it('Should create 2 thread elements', async () => {
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
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
    ]);
    await import('./flow.ts');
    let thread0 = getThread(0)!;
    expect(thread0.className).toEqual('thread');
    expect(thread0.textContent).toEqual('thread 0');

    let thread1 = getThread(1)!;
    expect(thread1.className).toEqual('thread');
    expect(thread1.textContent).toEqual('thread 1');
  });

  it('Should create 2 userStories elements', async () => {
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
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.DONE,
      },
    ]);
    await import('./flow.ts');
    let userStory1 = getUserStory('userStory1')!;
    expect(userStory1.className).toEqual('userStory');
    expect(userStory1.textContent).toEqual('userStory1');

    let userStory2 = getUserStory('userStory2')!;
    expect(userStory2.className).toEqual('userStory');
    expect(userStory2.textContent).toEqual('userStory2');
  });

  it('Should move userStories to the corresponding thread when in progress', async () => {
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

    getCompute()!.click();
    await vi.runAllTimersAsync();
    expect(document.querySelector('#thread0 #userStory1')).not.toBeNull();
    expect(document.querySelector('#thread1 #userStory2')).not.toBeNull();
  });

  it('Should move userStories to the done area', async () => {
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
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.REVIEW,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.DONE,
      },
    ]);
    await import('./flow.ts');

    getCompute()!.click();
    await vi.runAllTimersAsync();
    expect(document.querySelector('#done #userStory1')).not.toBeNull();
    expect(document.querySelector('#done #userStory2')).not.toBeNull();
    expect(document.querySelector('[id^="userStory1_"]')).toBeNull();
    expect(document.querySelector('[id^="userStory2_"]')).toBeNull();
  });

  it('Should move userStories to the backlog area when to review', async () => {
    saveTimeEvents([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.TO_REVIEW,
      },
    ]);
    await import('./flow.ts');

    getCompute()!.click();

    expect(document.querySelector('#backlog #userStory1')).not.toBeNull();
  });

  it('Should move userStories to the corresponding thread when reviewed', async () => {
    saveTimeEvents([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.REVIEW,
      },
    ]);
    await import('./flow.ts');

    getCompute()!.click();

    expect(document.querySelector('#thread0 #userStory1')).not.toBeNull();
  });

  it('Should move userStories to the corresponding threads when reviewed by several threads', async () => {
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

    getCompute()!.click();
    await vi.runAllTimersAsync();
    expect(document.querySelector('#thread1 #userStory1_1')).not.toBeNull();
    expect(document.querySelector('#thread2 #userStory1_2')).not.toBeNull();
    expect(document.querySelector('#backlog #userStory1')).toBeNull();
  });
});
