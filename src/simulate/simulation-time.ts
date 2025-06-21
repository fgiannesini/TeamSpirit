import { addUserStory, type Backlog, getNextUserStory, userStoriesWithSomeReviews } from './backlog.ts';
import { createTimeEvent, type TimeEvent } from './events.ts';
import type { Team } from './team.ts';
import {
  idle,
  isDeveloped,
  isReviewed,
  setDone,
  setDoneBy,
  setInProgress,
  setReview,
  setToReview,
  type UserStory,
} from './user-story.ts';

export const simulateTimeEvents = (
  team: Team,
  backlog: Backlog,
  time: number,
): TimeEvent[] => {
  const events: TimeEvent[] = [];
  const toAddBacklog: UserStory[] = [];
  for (const thread of team.getEffectiveThreads()) {
    const userStory: UserStory = getNextUserStory(backlog, thread);
    if (userStory === idle) {
      idle.threadId = thread.id;
      events.push(createTimeEvent(time, idle, thread.id));
      continue;
    }
    switch (userStory.state) {
      case 'ToReview':
      case 'Review': {
        const review = setReview(userStory, thread);
        events.push(createTimeEvent(time, review, thread.id));
        if (isReviewed(review)) {
          const done = setDoneBy(userStory, review.threadId as number, time);
          events.push(createTimeEvent(time, done, done.threadId as number));
          toAddBacklog.push(done);
        } else {
          addUserStory(review, backlog);
        }
        break;
      }
      case 'Todo':
      case 'InProgress': {
        const inProgress = setInProgress(userStory, thread);
        events.push(createTimeEvent(time, inProgress, thread.id));
        if (isDeveloped(inProgress)) {
          if (isReviewed(inProgress)) {
            const done = setDone(inProgress, time);
            events.push(createTimeEvent(time, done, thread.id));
            toAddBacklog.push(done);
          } else {
            const toReview = setToReview(inProgress, thread.id);
            events.push(createTimeEvent(time, toReview, thread.id));
            toAddBacklog.push(toReview);
          }
        } else {
          toAddBacklog.push(inProgress);
        }
        break;
      }
      default:
        break;
    }
  }
  userStoriesWithSomeReviews(backlog).forEach((review: UserStory) => {
    const toReview = setToReview(review, review.threadId as number);
    events.push(createTimeEvent(time, toReview, review.threadId as number));
  });
  toAddBacklog.forEach((userStory) => {
    addUserStory(userStory, backlog);
  });
  return events;
};
