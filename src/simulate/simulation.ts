import {
  addUserStory,
  Backlog,
  getNextUserStory,
  hasMoreUserStories,
  userStoriesWithSomeReviews,
} from './backlog.ts';
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

const simulateTimeEvents = (team: Team, backlog: Backlog, time: number) => {
  const events: TimeEvent[] = [];
  const toAddBacklog: UserStory[] = [];
  for (const thread of team.getThreads()) {
    const userStory: UserStory = getNextUserStory(backlog, thread);
    if (userStory == idle) {
      idle.thread = thread.id;
      events.push(createEvent(time, idle, thread.id));
      continue;
    }
    switch (userStory.state) {
      case State.TO_REVIEW:
      case State.REVIEW: {
        const review = setReview(userStory, thread);
        events.push(createEvent(time, review, thread.id));
        if (isReviewed(review)) {
          const done = setDoneBy(userStory, review.thread as number);
          events.push(createEvent(time, done, done.thread as number));
          toAddBacklog.push(done);
        } else {
          addUserStory(review, backlog);
        }
        break;
      }
      case State.TODO:
      case State.IN_PROGRESS: {
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
        break;
      }
    }
  }
  userStoriesWithSomeReviews(backlog).forEach((review: UserStory) => {
    const toReview = setToReview(review, review.thread as number);
    events.push(createEvent(time, toReview, review.thread as number));
  });
  toAddBacklog.forEach((userStory) => addUserStory(userStory, backlog));
  return events;
};

export const simulate = (backlog: Backlog, team: Team): TimeEvent[] => {
  const events: TimeEvent[] = [];
  let time = 1;
  while (hasMoreUserStories(backlog)) {
    events.push(...simulateTimeEvents(team, backlog, time));
    time++;
  }
  return events;
};
