import { describe, expect, it, vi } from 'vitest';
import { querySelector, render } from './render.ts';
import { State } from './task.ts';

describe('Render', () => {
  vi.useFakeTimers();
  it('Should render the page without events', () => {
    render([]);
    let threads = document.querySelector('#threads');
    expect(threads).not.toBeNull();
    let backlog = document.querySelector('#backlog');
    expect(backlog).not.toBeNull();
  });

  it('Should render the page with 2 threads', () => {
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
    let thread0 = querySelector('#thread0');
    expect(thread0.className).toEqual('thread');
    expect(thread0.textContent).toEqual('thread 0');

    let thread1 = querySelector('#thread1');
    expect(thread1.className).toEqual('thread');
    expect(thread1.textContent).toEqual('thread 1');
  });

  it('Should render the page with 2 tasks', () => {
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
    let task1 = querySelector<HTMLDivElement>('#task1');
    expect(task1.className).toEqual('task');
    expect(task1.textContent).toEqual('task1');
    expect(task1.style.left).toEqual('');
    expect(task1.style.top).toEqual('0px');

    let task2 = querySelector<HTMLDivElement>('#task2');
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
    querySelector<HTMLButtonElement>('#compute').click();
    let task1Style = querySelector<HTMLDivElement>('#task1').style;
    expect(task1Style.left).toEqual('233px');
    expect(task1Style.top).toEqual('50px');

    let task2Style = querySelector<HTMLDivElement>('#task2').style;
    expect(task2Style.left).toEqual('463px');
    expect(task2Style.top).toEqual('100px');
  });

  it('Should move tasks to the done area', () => {
    render([
      {
        time: 1,
        taskName: 'task1',
        thread: 0,
        previousState: State.TODO,
        newState: State.DONE,
      },
      {
        time: 1,
        taskName: 'task2',
        thread: 1,
        previousState: State.TODO,
        newState: State.DONE,
      },
    ]);

    let doneElement = querySelector<HTMLElement>('#done');
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
    querySelector<HTMLButtonElement>('#compute').click();
    let task1Style = querySelector<HTMLDivElement>('#task1').style;
    expect(task1Style.left).toEqual('33px');
    expect(task1Style.top).toEqual('50px');

    let task2Style = querySelector<HTMLDivElement>('#task2').style;
    expect(task2Style.left).toEqual('86px');
    expect(task2Style.top).toEqual('50px');
  });
});
