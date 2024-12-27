import { Backlog } from './backlog.ts';
import { TimeEvent } from './events.ts';
import { idle, State, Task } from './task.ts';

export interface Team {}

export type Thread = {
  id: number;
};
export class ParallelTeam implements Team {
  private readonly devs: Thread[] = [];
  constructor(devCount: number) {
    for (let i = 0; i < devCount; i++) {
      this.devs.push({ id: i });
    }
  }

  public static init = (): ParallelTeamBuilder => {
    return new ParallelTeamBuilder();
  };

  run(backlog: Backlog): TimeEvent[] {
    const events: TimeEvent[] = [];
    let time = 1;
    while (backlog.hasMoreTasks()) {
      for (let dev of this.devs) {
        let task: Task = backlog.next(dev);
        if (task == idle) {
          events.push({
            time: time,
            taskName: task.name,
            thread: dev.id,
            state: task.state,
          });
          continue;
        }
        let inProgress: Task = { ...task };
        inProgress.progression = task.progression + 1;
        inProgress.thread = dev.id;
        inProgress.state = State.IN_PROGRESS;
        events.push({
          time: time,
          taskName: task.name,
          thread: inProgress.thread,
          state: inProgress.state,
        });
        if (inProgress.complexity == inProgress.progression) {
          let done: Task = { ...inProgress };
          done.state = State.DONE;
          done.thread = dev.id;
          events.push({
            time: time,
            taskName: task.name,
            thread: done.thread,
            state: done.state,
          });
          backlog.add(done);
        } else {
          backlog.add(inProgress);
        }
      }
      time++;
    }

    return events;
  }
}

class ParallelTeamBuilder {
  private devCount: number = 0;

  public withDevCount(devCount: number): ParallelTeamBuilder {
    this.devCount = devCount;
    return this;
  }

  public build(): ParallelTeam {
    return new ParallelTeam(this.devCount);
  }
}
