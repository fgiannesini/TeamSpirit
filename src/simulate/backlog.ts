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
  const priorities = [
    ...new Set(
      backlog.userStoriesRemaining.map((userStory) => userStory.priority),
    ),
  ].toSorted((a, b) => b - a);

  let nextUserStory: UserStory | undefined;
  for (const priority of priorities) {
    const userStories = backlog.userStoriesRemaining.filter(
      (userStory) => userStory.priority === priority,
    );

    nextUserStory = userStories.find((userStory) =>
      isInProgressBy(userStory, thread),
    );

    if (!nextUserStory) {
      nextUserStory = userStories.find((userStory) =>
        isInReviewBy(userStory, thread),
      );
    }

    if (!nextUserStory) {
      nextUserStory = userStories.find((userStory) =>
        needReviewBy(userStory, thread, reviewersNeeded),
      );
    }

    if (!nextUserStory) {
      let minDiff = Number.MAX_VALUE;
      userStories.forEach((userStory) => {
        if (isToReviewBy(userStory, thread)) {
          const diff = Math.abs(
            userStory.review.reviewComplexity - thread.power,
          );
          if (diff < minDiff) {
            minDiff = diff;
            nextUserStory = userStory;
          }
        }
      });
    }

    if (!nextUserStory) {
      let minDiff = Number.MAX_VALUE;
      userStories.forEach((userStory) => {
        if (isToDo(userStory)) {
          const diff = Math.abs(userStory.complexity - thread.power);
          if (diff < minDiff) {
            minDiff = diff;
            nextUserStory = userStory;
          }
        }
      });
    }

    if (nextUserStory) {
      break;
    }
  }

  if (nextUserStory) {
    const index = backlog.userStoriesRemaining.indexOf(nextUserStory);
    return backlog.userStoriesRemaining.splice(index, 1)[0];
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
      userStory.review.reviewers.size,
    )
  );
};
