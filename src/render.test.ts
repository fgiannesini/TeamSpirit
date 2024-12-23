import { describe, expect, it, vi } from 'vitest';
import { querySelector, render } from './render.ts';

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
      { time: 0, taskName: 'task1', thread: 0 },
      { time: 0, taskName: 'task2', thread: 1 },
      { time: 1, taskName: 'task1', thread: 0 },
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
      { time: 0, taskName: 'task1', thread: 0 },
      { time: 0, taskName: 'task2', thread: 1 },
    ]);
    let task1 = querySelector<HTMLDivElement>('#task1');
    expect(task1.className).toEqual('task');
    expect(task1.textContent).toEqual('task1');
    expect(task1.style.left).toEqual('');

    let task2 = querySelector<HTMLDivElement>('#task2');
    expect(task2.className).toEqual('task');
    expect(task2.textContent).toEqual('task2');
    expect(task2.style.left).toEqual('');

    vi.advanceTimersByTime(1000);
    expect(task1.style.left).toEqual('0rem');
    expect(task2.style.left).toEqual('6rem');
  });
});
