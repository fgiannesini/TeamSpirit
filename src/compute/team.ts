import { Backlog } from './backlog.ts';
import { createEvent, TimeEvent } from './events.ts';
import {
  idle,
  isDeveloped,
  isReviewed,
  setDone,
  setDoneBy,
  setInProgress,
  setReview,
  setToReview,
  State,
  UserStory,
} from './user-story.ts';

export interface Thread {
  id: number;
  power: number;
}

export class Team {
  private readonly _devs: Thread[] = [];
  private readonly _review: boolean;

  constructor(devs: Thread[], review: boolean) {
    this._devs = devs;
    this._review = review;
  }

  public static parallelTeam = (): ParallelTeamBuilder => {
    return new ParallelTeamBuilder();
  };

  run(backlog: Backlog): TimeEvent[] {
    const events: TimeEvent[] = [];
    let time = 1;
    while (backlog.hasMoreUserStories()) {
      const toAddBacklog: UserStory[] = [];
      for (const dev of this._devs) {
        const userStory: UserStory = backlog.next(dev);
        if (userStory == idle) {
          idle.thread = dev.id;
          events.push(createEvent(time, idle, dev.id));
          continue;
        }
        if (
          userStory.state == State.TO_REVIEW ||
          userStory.state == State.REVIEW
        ) {
          const review = setReview(userStory, dev);
          events.push(createEvent(time, review, dev.id));
          if (isReviewed(review)) {
            const done = setDoneBy(userStory, review.thread as number);
            events.push(createEvent(time, done, done.thread as number));
            toAddBacklog.push(done);
          } else {
            backlog.add(review);
          }
        }

        if (
          userStory.state == State.TODO ||
          userStory.state == State.IN_PROGRESS
        ) {
          const inProgress = setInProgress(userStory, dev);
          events.push(createEvent(time, inProgress, dev.id));
          if (isDeveloped(inProgress)) {
            if (this._review) {
              const toReview = setToReview(inProgress, dev);
              events.push(createEvent(time, toReview, dev.id));
              toAddBacklog.push(toReview);
            } else {
              const done = setDone(inProgress);
              events.push(createEvent(time, done, dev.id));
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
  private _review = false;

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

  public withReview(review = true): ParallelTeamBuilder {
    this._review = review;
    return this;
  }

  public build(): Team {
    return new Team(this._devs, this._review);
  }
}
