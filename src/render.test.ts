import { describe, expect, it, vi } from 'vitest';
import { State } from './task.ts';
import { render } from './render.ts';
import { getCompute, getDone, getTask, getThread } from './selector.ts';

describe('Render', () => {
  vi.useFakeTimers();
  it('Should render the page without events', () => {
    render([]);
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
        taskName: 'task1',
        thread: 0,
        previousState: State.TODO,
        newState: State.IN_PROGRESS,
      },
      {
        time: 1,
        taskName: 'task2',
        thread: 1,
        previousState: State.IN_PROGRESS,
        newState: State.DONE,
      },
      {
        time: 2,
        taskName: 'task1',
        thread: 0,
        previousState: State.IN_PROGRESS,
        newState: State.DONE,
      },
    ]);
    let thread0 = getThread(0);
    expect(thread0.className).toEqual('thread');
    expect(thread0.textContent).toEqual('thread 0');

    let thread1 = getThread(1);
    expect(thread1.className).toEqual('thread');
    expect(thread1.textContent).toEqual('thread 1');
  });

  it('Should create 2 task elements', () => {
    render([
      {
        time: 1,
        taskName: 'task1',
        thread: 0,
        previousState: State.TODO,
        newState: State.IN_PROGRESS,
      },
      {
        time: 1,
        taskName: 'task1',
        thread: 0,
        previousState: State.IN_PROGRESS,
        newState: State.DONE,
      },
      {
        time: 1,
        taskName: 'task2',
        thread: 1,
        previousState: State.IN_PROGRESS,
        newState: State.DONE,
      },
    ]);
    let task1 = getTask('task1');
    expect(task1.className).toEqual('task');
    expect(task1.textContent).toEqual('task1');
    expect(task1.style.left).toEqual('');
    expect(task1.style.top).toEqual('0px');

    let task2 = getTask('task2');
    expect(task2.className).toEqual('task');
    expect(task2.textContent).toEqual('task2');
    expect(task2.style.left).toEqual('');
    expect(task2.style.top).toEqual('0px');

    vi.advanceTimersToNextTimer();
    expect(task1.style.left).toEqual('0px');
    expect(task2.style.left).toEqual('50px');
  });

  it('Should move tasks to the corresponding thread', async () => {
    render([
      {
        time: 1,
        taskName: 'task1',
        thread: 0,
        previousState: State.TODO,
        newState: State.IN_PROGRESS,
      },
      {
        time: 1,
        taskName: 'task2',
        thread: 1,
        previousState: State.TODO,
        newState: State.IN_PROGRESS,
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

    await expectTaskAt('task1', '50px', '233px');
    await expectTaskAt('task2', '100px', '463px');
  });

  it('Should move tasks to the done area', async () => {
    render([
      {
        time: 1,
        taskName: 'task1',
        thread: 0,
        previousState: State.IN_PROGRESS,
        newState: State.DONE,
      },
      {
        time: 1,
        taskName: 'task2',
        thread: 1,
        previousState: State.IN_PROGRESS,
        newState: State.DONE,
      },
    ]);

    let doneElement = getDone();
    mockPosition(doneElement, { top: 50, left: 30 });
    vi.advanceTimersToNextTimer();
    getCompute().click();

    await expectTaskAt('task1', '50px', '33px');
    await expectTaskAt('task2', '50px', '86px');
  });

  const expectTaskAt = async (taskName: string, top: string, left: string) => {
    const task = getTask(taskName);
    task.dispatchEvent(new Event('transitionend'));
    await vi.advanceTimersToNextTimerAsync();

    let task1Style = task.style;
    expect(task1Style.left).toEqual(left);
    expect(task1Style.top).toEqual(top);
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
