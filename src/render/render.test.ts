import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { State } from '../compute/user-story.ts';
import { render } from './render.ts';
import {
  getBacklog,
  getCompute,
  getDone,
  getThread,
  getUserStory,
} from './selector.ts';

describe('Render', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    expect(vi.getTimerCount()).toEqual(0);
    vi.clearAllTimers();
  });

  it('Should render the page without events', () => {
    render([]);
    vi.advanceTimersToNextTimer();
    let threads = document.querySelector('#threads');
    expect(threads).not.toBeNull();
    let backlog = document.querySelector('#backlog');
    expect(backlog).not.toBeNull();
    let done = document.querySelector('#done');
    expect(done).not.toBeNull();
  });

  it('Should create 2 thread elements', () => {
    render([
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
    vi.advanceTimersToNextTimer();
    let thread0 = getThread(0);
    expect(thread0.className).toEqual('thread');
    expect(thread0.textContent).toEqual('thread 0');

    let thread1 = getThread(1);
    expect(thread1.className).toEqual('thread');
    expect(thread1.textContent).toEqual('thread 1');
  });

  it('Should create 2 userStories elements', () => {
    render([
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
    let userStory1 = getUserStory('userStory1');
    expect(userStory1.className).toEqual('userStory');
    expect(userStory1.textContent).toEqual('userStory1');
    expect(userStory1.style.left).toEqual('');
    expect(userStory1.style.top).toEqual('0px');

    let userStory2 = getUserStory('userStory2');
    expect(userStory2.className).toEqual('userStory');
    expect(userStory2.textContent).toEqual('userStory2');
    expect(userStory2.style.left).toEqual('');
    expect(userStory2.style.top).toEqual('0px');

    vi.advanceTimersToNextTimer();
    expect(userStory1.style.left).toEqual('0px');
    expect(userStory2.style.left).toEqual('50px');
  });

  it('Should move userStories to the corresponding thread when in progress', async () => {
    render([
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
    document
      .querySelectorAll<HTMLElement>('.thread')
      .forEach((element, index) => {
        mockPosition(element, {
          top: 50 * (index + 1),
          right: 230 * (index + 1),
        });
      });
    vi.advanceTimersToNextTimer();
    getCompute().click();

    await expectUserStoryAt('userStory1', '50px', '233px');
    await expectUserStoryAt('userStory2', '100px', '463px');
  });

  it('Should not move user story in progress twice', async () => {
    render([
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
    ]);
    mockPosition(getThread(0), {
      top: 50,
      right: 230,
    });
    vi.advanceTimersToNextTimer();
    getCompute().click();
    await expectUserStoryAt('userStory1', '50px', '233px');
    getCompute().click();
    const userStory = getUserStory('userStory1');
    let userStory1Style = userStory.style;
    expect(userStory1Style.left).toEqual('233px');
    expect(userStory1Style.top).toEqual('50px');
  });

  it('Should move userStories to the done area', async () => {
    render([
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

    let doneElement = getDone();
    mockPosition(doneElement, { top: 50, left: 30 });
    vi.advanceTimersToNextTimer();
    getCompute().click();

    await expectUserStoryAt('userStory1', '50px', '33px');
    await expectUserStoryAt('userStory2', '50px', '86px');
  });

  it('Should move userStories to the backlog area when to review', async () => {
    render([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.TO_REVIEW,
      },
    ]);

    mockPosition(getBacklog(), { top: 50, left: 30 });
    vi.advanceTimersToNextTimer();
    getCompute().click();

    await expectUserStoryAt('userStory1', '50px', '33px');
  });

  it('Should move userStories to the corresponding thread when reviewed', async () => {
    render([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.REVIEW,
      },
    ]);

    mockPosition(getThread(0), { top: 50, right: 230 });
    vi.advanceTimersToNextTimer();
    getCompute().click();

    await expectUserStoryAt('userStory1', '50px', '233px');
  });

  const expectUserStoryAt = async (
    userStoryName: string,
    top: string,
    left: string
  ) => {
    const userStory = getUserStory(userStoryName);
    userStory.dispatchEvent(new Event('transitionend'));
    await vi.advanceTimersToNextTimerAsync();

    let userStory1Style = userStory.style;
    expect(userStory1Style.left).toEqual(left);
    expect(userStory1Style.top).toEqual(top);
  };

  const mockPosition = (
    element: HTMLElement,
    {
      top = 50,
      left = 30,
      right = 230,
    }: {
      top?: number;
      left?: number;
      right?: number;
    } = {}
  ) => {
    vi.spyOn(element, 'getBoundingClientRect').mockImplementation(() => ({
      width: 200,
      height: 100,
      top: top,
      left: left,
      bottom: 150,
      right: right,
      x: 30,
      y: 50,
      toJSON: () => {},
    }));
  };
});
