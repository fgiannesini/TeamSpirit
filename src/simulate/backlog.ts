import { hasSomeReviews } from './review.ts';
import type { Thread } from './team.ts';
import {
  State,
  type UserStory,
  idle,
  isInProgressBy,
  isInReviewBy,
  isToReviewBy,
  toDo,
} from './user-story.ts';

export class Backlog {
  readonly userStoriesRemaining: UserStory[];
  readonly userStoriesDone: UserStory[] = [];
  constructor(userStories: UserStory[]) {
    this.userStoriesRemaining = userStories;
  }
}

export const getUserStories = (backlog: Backlog) => [
  ...backlog.userStoriesRemaining,
  ...backlog.userStoriesDone,
];

export const getNextUserStory = (
  backlog: Backlog,
  thread: Thread,
): UserStory => {
  let threadUserStoryIndex = backlog.userStoriesRemaining.findIndex(
    (userStory) => isInProgressBy(userStory, thread),
  );

  if (threadUserStoryIndex === -1) {
    threadUserStoryIndex = backlog.userStoriesRemaining.findIndex((userStory) =>
      isInReviewBy(userStory, thread),
    );
  }

  if (threadUserStoryIndex === -1) {
    let minDiff = Number.MAX_VALUE;
    backlog.userStoriesRemaining.forEach((userStory, i) => {
      if (isToReviewBy(userStory, thread)) {
        const diff = Math.abs(userStory.reviewComplexity - thread.power);
        if (diff < minDiff) {
          minDiff = diff;
          threadUserStoryIndex = i;
        }
      }
    });
  }

  if (threadUserStoryIndex === -1) {
    let minDiff = Number.MAX_VALUE;
    backlog.userStoriesRemaining.forEach((userStory, i) => {
      if (toDo(userStory)) {
        const diff = Math.abs(userStory.complexity - thread.power);
        if (diff < minDiff) {
          minDiff = diff;
          threadUserStoryIndex = i;
        }
      }
    });
  }

  if (threadUserStoryIndex !== -1) {
    return backlog.userStoriesRemaining.splice(threadUserStoryIndex, 1)[0];
  }
  return idle;
};

export const userStoriesWithSomeReviews = (backlog: Backlog): UserStory[] => {
  return backlog.userStoriesRemaining
    .filter((userStory) => userStory.state === State.REVIEW)
    .filter((userStory) =>
      hasSomeReviews(userStory.review, userStory.reviewComplexity),
    );
};

export const addUserStory = (userStory: UserStory, backlog: Backlog) => {
  if (userStory.state === State.DONE) {
    backlog.userStoriesDone.push(userStory);
  } else {
    backlog.userStoriesRemaining.push(userStory);
  }
};

export const getUserStoriesDone = (backlog: Backlog): UserStory[] => {
  return backlog.userStoriesDone;
};

export const getUserStoriesRemainings = (backlog: Backlog): UserStory[] => {
  return backlog.userStoriesRemaining;
};

export const hasMoreUserStories = (backlog: Backlog) => {
  return backlog.userStoriesRemaining.length > 0;
};
