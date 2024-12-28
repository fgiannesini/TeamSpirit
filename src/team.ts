import { Backlog } from './backlog.ts';
import { createEvent, TimeEvent } from './events.ts';
import { idle, setDone, setInProgress, UserStory } from './user-story.ts';

export interface Team {}

export type Thread = {
  id: number;
};

export class ParallelTeam implements Team {
  private readonly _devs: Thread[] = [];
  private readonly _review: boolean;

  constructor(devCount: number, review: boolean) {
    this._review = review;
    for (let i = 0; i < devCount; i++) {
      this._devs.push({ id: i });
    }
  }

  public static init = (): ParallelTeamBuilder => {
    return new ParallelTeamBuilder();
  };

  run(backlog: Backlog): TimeEvent[] {
    const events: TimeEvent[] = [];
    let time = 1;
    while (backlog.hasMoreUserStories()) {
      for (let dev of this._devs) {
        let userStory: UserStory = backlog.next(dev);
        if (userStory == idle) {
          idle.thread = dev.id;
          events.push(createEvent(time, idle));
          continue;
        }
        const inProgress = setInProgress(userStory, dev);
        events.push(createEvent(time, inProgress));
        if (!this._review) {
          if (inProgress.complexity == inProgress.progression) {
            const done = setDone(inProgress, dev);
            events.push(createEvent(time, done));
            backlog.add(done);
          } else {
            backlog.add(inProgress);
          }
        }
      }
      time++;
    }

    return events;
  }
}

class ParallelTeamBuilder {
  private devCount: number = 0;
  private review: boolean = false;

  public withDevCount(devCount: number): ParallelTeamBuilder {
    this.devCount = devCount;
    return this;
  }

  public withReview(): ParallelTeamBuilder {
    this.review = true;
    return this;
  }

  public build(): ParallelTeam {
    return new ParallelTeam(this.devCount, this.review);
  }
}
