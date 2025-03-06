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

  constructor(devs: Thread[]) {
    this._devs = devs;
  }

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
            if (!isReviewed(inProgress)) {
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
