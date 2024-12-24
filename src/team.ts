import { Backlog } from './backlog.ts';
import { TimeEvent } from './events.ts';
import { idle, State } from './task.ts';

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
        let task = backlog.next(dev);
        if (task == idle) {
          events.push({
            time: time,
            taskName: task.name,
            thread: dev.id,
            previousState: task.state,
            newState: task.state,
          });
          continue;
        }
        const next = { ...task };
        next.progression = task.progression + 1;
        if (next.complexity == next.progression) {
          next.state = State.DONE;
        } else {
          next.state = State.IN_PROGRESS;
        }
        next.thread = dev.id;

        events.push({
          time: time,
          taskName: task.name,
          thread: dev.id,
          previousState: task.state,
          newState: next.state,
        });
        backlog.add(next);
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
