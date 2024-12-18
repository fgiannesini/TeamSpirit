import { Backlog } from './backlog.ts';
import { TimeEvent } from './events.ts';
import { State } from './task.ts';

export interface Team {}

type Developper ={
  
}
export class ParallelTeam implements Team {
  private readonly devs: Developper[] = [];
  constructor(devCount: number) {
    for (let i =0; i < devCount; i++) {
      this.devs.push({});
    }
  }

  public static init = (): ParallelTeamBuilder => {
    return new ParallelTeamBuilder();
  };

  run(backlog: Backlog): TimeEvent[] {
    const events: TimeEvent[] = [];
    let time = 0;
    while(backlog.hasMoreTasks()) {
      for (let i = 0; i < this.devs.length; i++) {
        let next = backlog.next();
        next.state = State.DONE;
        events.push({
          time: time,
          taskName: next.name,
          thread: i,
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
