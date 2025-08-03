import { computeBugProbability } from './bug-generator.ts';
import { hasSomeReviews } from './review.ts';
import type { Team, Thread } from './team.ts';
import {
  idle,
  isInProgressBy,
  isInReviewBy,
  isToDo,
  isToReviewBy,
  needReviewBy,
  type UserStory,
} from './user-story.ts';

export class Backlog {
  readonly userStoriesRemaining: UserStory[];
  readonly userStoriesDone: UserStory[] = [];
  constructor(userStories: UserStory[]) {
    this.userStoriesRemaining = userStories;
  }
}

export const getUserStories = (backlog: Backlog): UserStory[] => [
  ...backlog.userStoriesRemaining,
  ...backlog.userStoriesDone,
];

export const getNextUserStory = (
  backlog: Backlog,
  thread: Thread,
  reviewersNeeded: number,
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
    threadUserStoryIndex = backlog.userStoriesRemaining.findIndex((userStory) =>
      needReviewBy(userStory, thread, reviewersNeeded),
    );
  }

  if (threadUserStoryIndex === -1) {
    let minDiff = Number.MAX_VALUE;
    backlog.userStoriesRemaining.forEach((userStory, i) => {
      if (isToReviewBy(userStory, thread)) {
        const diff = Math.abs(userStory.review.reviewComplexity - thread.power);
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
      if (isToDo(userStory)) {
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

export const userStoriesWithSomeReviews = (
  backlog: Backlog,
  reviewersNeeded: number,
): UserStory[] => {
  return backlog.userStoriesRemaining
    .filter((userStory) => userStory.state === 'Review')
    .filter((userStory) =>
      hasSomeReviews(
        userStory.review,
        userStory.review.reviewComplexity,
        reviewersNeeded,
      ),
    );
};

export const addUserStory = (userStory: UserStory, backlog: Backlog): void => {
  if (userStory.state === 'Done') {
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

export const hasMoreUserStories = (backlog: Backlog): boolean => {
  return backlog.userStoriesRemaining.length > 0;
};

export const shouldGenerateBug = (
  randomProvider: () => number,
  userStory: UserStory,
  team: Team,
  time: number,
): boolean => {
  const number = randomProvider();
  const experience =
    team
      .getEffectiveThreads()
      .find((thread) => thread.id === userStory.threadId)?.power ?? 0;
  return (
    number <
    computeBugProbability(
      userStory.complexity,
      time - userStory.timeDone,
      experience,
    )
  );
};
