import { Backlog } from './backlog.ts';
import { createEvent, TimeEvent } from './events.ts';
import {
  idle,
  isDeveloped,
  setDone,
  setInProgress,
  setReview,
  setToReview,
  State,
  UserStory,
} from './user-story.ts';

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
      const toAddBacklog: UserStory[] = [];
      for (let dev of this._devs) {
        let userStory: UserStory = backlog.next(dev);
        if (userStory == idle) {
          idle.thread = dev.id;
          events.push(createEvent(time, idle));
          continue;
        }
        if (userStory.state == State.TO_REVIEW) {
          const review = setReview(userStory, dev);
          events.push(createEvent(time, review));
          const done = setDone(userStory, dev);
          events.push(createEvent(time, done));
          toAddBacklog.push(done);
        }

        if (
          userStory.state == State.TODO ||
          userStory.state == State.IN_PROGRESS
        ) {
          const inProgress = setInProgress(userStory, dev);
          events.push(createEvent(time, inProgress));
          if (isDeveloped(inProgress)) {
            if (this._review) {
              const toReview = setToReview(inProgress, dev);
              events.push(createEvent(time, toReview));
              toAddBacklog.push(toReview);
            } else {
              const done = setDone(inProgress, dev);
              events.push(createEvent(time, done));
              toAddBacklog.push(done);
            }
          } else {
            toAddBacklog.push(inProgress);
          }
        }
      }
      toAddBacklog.forEach((userStory) => backlog.add(userStory));
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
