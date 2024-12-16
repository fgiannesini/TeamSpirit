import { Backlog } from './backlog.ts';
import { TimeEvent } from './events.ts';
import { State } from './task.ts';

export interface Team {}

export class ParallelTeam implements Team {
  private readonly _devCount: number;
  constructor(devCount: number) {
    this._devCount = devCount;
  }

  public static init = (): ParallelTeamBuilder => {
    return new ParallelTeamBuilder();
  };

  run(backlog: Backlog): TimeEvent[] {
    const events: TimeEvent[] = [];
    for (let i = 0; i < this._devCount; i++) {
      let next = backlog.next(State.TODO);
      next.state = State.DONE;
      events.push({
        time: 0,
        taskName: next.name,
        thread: i,
      });
      backlog.setOnTop(next);
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
