import { describe, expect, it } from 'vitest';
import { querySelector, render } from './render.ts';

describe('Render', () => {
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
});
