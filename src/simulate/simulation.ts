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
import { Team } from './team.ts';

export const simulate = (backlog: Backlog, team: Team): TimeEvent[] => {
  const events: TimeEvent[] = [];
  let time = 1;
  while (backlog.hasMoreUserStories()) {
    const toAddBacklog: UserStory[] = [];
    for (const thread of team.getThreads()) {
      const userStory: UserStory = backlog.next(thread);
      if (userStory == idle) {
        idle.thread = thread.id;
        events.push(createEvent(time, idle, thread.id));
        continue;
      }
      if (
        userStory.state == State.TO_REVIEW ||
        userStory.state == State.REVIEW
      ) {
        const review = setReview(userStory, thread);
        events.push(createEvent(time, review, thread.id));
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
        const inProgress = setInProgress(userStory, thread);
        events.push(createEvent(time, inProgress, thread.id));
        if (isDeveloped(inProgress)) {
          if (!isReviewed(inProgress)) {
            const toReview = setToReview(inProgress, thread.id);
            events.push(createEvent(time, toReview, thread.id));
            toAddBacklog.push(toReview);
          } else {
            const done = setDone(inProgress);
            events.push(createEvent(time, done, thread.id));
            toAddBacklog.push(done);
          }
        } else {
          toAddBacklog.push(inProgress);
        }
      }
    }
    backlog.userStoriesWithSomeReviews().forEach((review: UserStory) => {
      const toReview = setToReview(review, review.thread as number);
      events.push(createEvent(time, toReview, review.thread as number));
    });
    toAddBacklog.forEach((userStory) => backlog.add(userStory));
    time++;
  }

  return events;
};
