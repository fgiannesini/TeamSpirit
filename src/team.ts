import { Backlog } from './backlog.ts';
import { TimeEvent } from './events.ts';

export interface Team {}

export class ParallelTeam implements Team {
  constructor(dev: number) {}

  public static init = (): ParallelTeamBuilder => {
    return new ParallelTeamBuilder();
  };

  run(backlog: Backlog): TimeEvent[] {
    return [];
  }
}

class ParallelTeamBuilder {
  private dev: number = 0;
  public withDevCount(devCount: number): ParallelTeamBuilder {
    this.dev = devCount;
    return this;
  }

  public build(): ParallelTeam {
    return new ParallelTeam(this.dev);
  }
}
