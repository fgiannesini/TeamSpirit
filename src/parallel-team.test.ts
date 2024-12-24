import { describe, expect, it } from 'vitest';
import { Backlog } from './backlog.ts';
import { State } from './task.ts';
import { ParallelTeam } from './team.ts';

describe('Parallel Team', () => {
  it('should handle 4 simple tasks by 4 devs', () => {
    const backlog = Backlog.init()
      .addTask({
        name: 'task4',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .addTask({
        name: 'task3',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .addTask({
        name: 'task2',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .addTask({
        name: 'task1',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .build();

    const events = ParallelTeam.init().withDevCount(4).build().run(backlog);

    expect(events).toEqual([
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
      {
        time: 1,
        taskName: 'task3',
        thread: 2,
        previousState: State.TODO,
        newState: State.DONE,
      },
      {
        time: 1,
        taskName: 'task4',
        thread: 3,
        previousState: State.TODO,
        newState: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(4);
    expect(backlog.remainings()).toHaveLength(0);
  });

  it('should handle 3 simple tasks by 2 devs', () => {
    const backlog = Backlog.init()
      .addTask({
        name: 'task3',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .addTask({
        name: 'task2',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .addTask({
        name: 'task1',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .build();

    const events = ParallelTeam.init().withDevCount(2).build().run(backlog);

    expect(events).toEqual([
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
      {
        time: 2,
        taskName: 'task3',
        thread: 0,
        previousState: State.TODO,
        newState: State.DONE,
      },
      {
        time: 2,
        taskName: 'idle',
        thread: 1,
        previousState: State.DONE,
        newState: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(3);
    expect(backlog.remainings()).toHaveLength(0);
  });

  it('should handle 2 complex tasks by 2 devs', () => {
    const backlog = Backlog.init()
      .addTask({
        name: 'task2',
        complexity: 2,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .addTask({
        name: 'task1',
        complexity: 2,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .build();

    const events = ParallelTeam.init().withDevCount(2).build().run(backlog);

    expect(events).toEqual([
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
      {
        time: 2,
        taskName: 'task1',
        thread: 0,
        previousState: State.IN_PROGRESS,
        newState: State.DONE,
      },
      {
        time: 2,
        taskName: 'task2',
        thread: 1,
        previousState: State.IN_PROGRESS,
        newState: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(2);
    expect(backlog.remainings()).toHaveLength(0);
  });
});
