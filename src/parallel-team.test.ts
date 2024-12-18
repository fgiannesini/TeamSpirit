import { describe, expect, it } from 'vitest';
import { Backlog } from './backlog.ts';
import { State } from './task.ts';
import { ParallelTeam } from './team.ts';

describe('Parallel Team', () => {
  it('should handle 4 simple tasks by 4 devs', () => {
    const backlog = Backlog.init()
      .addTask({ name: 'task4', complexity: 1, state: State.TODO })
      .addTask({ name: 'task3', complexity: 1, state: State.TODO })
      .addTask({ name: 'task2', complexity: 1, state: State.TODO })
      .addTask({ name: 'task1', complexity: 1, state: State.TODO })
      .build();

    const events = ParallelTeam.init().withDevCount(4).build().run(backlog);

    expect(events).toEqual([
      { time: 0, taskName: 'task1', thread: 0 },
      { time: 0, taskName: 'task2', thread: 1 },
      { time: 0, taskName: 'task3', thread: 2 },
      { time: 0, taskName: 'task4', thread: 3 },
    ]);
    
    expect(backlog.dones()).toHaveLength(4);
    expect(backlog.remainings()).toHaveLength(0);
  });

  it('should handle 4 simple tasks by 2 devs', () => {
    const backlog = Backlog.init()
        .addTask({ name: 'task4', complexity: 1, state: State.TODO })
        .addTask({ name: 'task3', complexity: 1, state: State.TODO })
        .addTask({ name: 'task2', complexity: 1, state: State.TODO })
        .addTask({ name: 'task1', complexity: 1, state: State.TODO })
        .build();

    const events = ParallelTeam.init().withDevCount(2).build().run(backlog);

    expect(events).toEqual([
      { time: 0, taskName: 'task1', thread: 0 },
      { time: 0, taskName: 'task2', thread: 1 },
      { time: 1, taskName: 'task3', thread: 0 },
      { time: 1, taskName: 'task4', thread: 1 },
    ]);

    expect(backlog.dones()).toHaveLength(4);
    expect(backlog.remainings()).toHaveLength(0);
  });
  
});
