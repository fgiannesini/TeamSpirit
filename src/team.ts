import { Backlog } from './backlog.ts';
import { createEvent, TimeEvent } from './events.ts';
import { idle, State, UserStory } from './user-story.ts';

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
          events.push({
            time: time,
            userStoryName: userStory.name,
            thread: dev.id,
            state: userStory.state,
          });
          continue;
        }
        let inProgress: UserStory = { ...userStory };
        inProgress.progression = userStory.progression + 1;
        inProgress.thread = dev.id;
        inProgress.state = State.IN_PROGRESS;
        events.push(createEvent(time, inProgress));
        if (!this._review) {
          if (inProgress.complexity == inProgress.progression) {
            let done: UserStory = { ...inProgress };
            done.state = State.DONE;
            done.thread = dev.id;
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
