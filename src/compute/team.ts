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
  power: number;
};

export class ParallelTeam implements Team {
  private readonly _devs: Thread[] = [];
  private readonly _review: boolean;

  constructor(devs: Thread[], review: boolean) {
    this._devs = devs;
    this._review = review;
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
  private _devs: Thread[] = [];
  private _review: boolean = false;

  public withDev(dev: Thread) {
    this._devs.push(dev);
    return this;
  }

  public withDevCount(devCount: number): ParallelTeamBuilder {
    for (let i = 0; i < devCount; i++) {
      this._devs.push({ id: i, power: 1 });
    }
    return this;
  }

  public withReview(review: boolean = true): ParallelTeamBuilder {
    this._review = review;
    return this;
  }

  public build(): ParallelTeam {
    return new ParallelTeam(this._devs, this._review);
  }
}
