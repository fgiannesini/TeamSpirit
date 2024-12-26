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

    vi.advanceTimersByTime(1000);
    expect(task1.style.left).toEqual('0px');
    expect(task2.style.left).toEqual('50px');
  });

  it('Should move tasks to the corresponding thread', () => {
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
        vi.spyOn(element, 'getBoundingClientRect').mockImplementation(() => ({
          width: 200 * (index + 1),
          height: 100 * (index + 1),
          top: 50 * (index + 1),
          left: 30 * (index + 1),
          bottom: 150 * (index + 1),
          right: 230 * (index + 1),
          x: 30 * (index + 1),
          y: 50 * (index + 1),
          toJSON: () => {},
        }));
      });
    getCompute().click();
    const task1 = getTask('task1');
    task1.dispatchEvent(new Event('transitionend'));
    let task1Style = task1.style;
    expect(task1Style.left).toEqual('233px');
    expect(task1Style.top).toEqual('50px');

    const task2 = getTask('task2');
    task2.dispatchEvent(new Event('transitionend'));
    let task2Style = task2.style;
    expect(task2Style.left).toEqual('463px');
    expect(task2Style.top).toEqual('100px');
  });

  it('Should move tasks to the done area', () => {
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
    vi.spyOn(doneElement, 'getBoundingClientRect').mockImplementation(() => ({
      width: 200,
      height: 100,
      top: 50,
      left: 30,
      bottom: 150,
      right: 230,
      x: 30,
      y: 50,
      toJSON: () => {},
    }));
    getCompute().click();
    let task1Style = getTask('task1').style;
    expect(task1Style.left).toEqual('33px');
    expect(task1Style.top).toEqual('50px');

    let task2Style = getTask('task2').style;
    expect(task2Style.left).toEqual('86px');
    expect(task2Style.top).toEqual('50px');
  });
});
