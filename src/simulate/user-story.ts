import {
  canReview,
  getReviewPoints,
  hasAllReviews,
  hasReviewStarted,
  noReview,
  type Review,
} from './review.ts';
import type { Thread } from './team.ts';

const updateReviewPoints = (
  review: Review,
  dev: Thread,
  newReviewPoints: number,
): Review => {
  const newReviewers = new Map<number, number>(review.reviewers).set(
    dev.id,
    newReviewPoints,
  );
  return {
    ...review,
    reviewers: newReviewers,
  };
};

export type State = 'Todo' | 'InProgress' | 'ToReview' | 'Review' | 'Done';
export type UserStory = {
  id: number;
  name: string;
  complexity: number;
  progression: number;
  review: Review;
  threadId?: number;
  state: State;
  timeDone: number;
};

export const idle: UserStory = {
  id: -1,
  name: 'idle',
  complexity: 0,
  progression: 0,
  review: noReview,
  threadId: undefined,
  state: 'Done',
  timeDone: 0,
};

export const setInProgress = (userStory: UserStory, dev: Thread): UserStory => {
  return {
    ...userStory,
    progression: Math.min(
      userStory.progression + dev.power,
      userStory.complexity,
    ),
    threadId: dev.id,
    state: 'InProgress',
  };
};

export const setDoneBy = (
  userStory: UserStory,
  threadId: number,
  currentTime: number,
): UserStory => {
  return {
    ...userStory,
    state: 'Done',
    threadId,
    timeDone: currentTime,
  };
};

export const setDone = (
  userStory: UserStory,
  currentTime: number,
): UserStory => {
  return { ...userStory, state: 'Done', timeDone: currentTime };
};

export const setToReview = (
  userStory: UserStory,
  threadId: number,
): UserStory => {
  return {
    ...userStory,
    state: 'ToReview',
    threadId,
  };
};

export const setReview = (userStory: UserStory, thread: Thread): UserStory => {
  const currentReview = userStory.review;
  const currentReviewPoints = getReviewPoints(currentReview, thread);
  const newReviewPoints = Math.min(
    currentReviewPoints + thread.power,
    currentReview.reviewComplexity,
  );
  const newReview = updateReviewPoints(currentReview, thread, newReviewPoints);

  return {
    ...userStory,
    state: 'Review',
    review: newReview,
  };
};

export const isDeveloped = (userStory: UserStory): boolean => {
  return userStory.progression === userStory.complexity;
};

export const isReviewed = (userStory: UserStory): boolean => {
  return hasAllReviews(userStory.review, userStory.review.reviewComplexity);
};

export const isInProgressBy: (userStory: UserStory, thread: Thread) => boolean =
  (userStory: UserStory, thread: Thread) =>
    userStory.state === 'InProgress' && userStory.threadId === thread.id;

export const isInReviewBy: (userStory: UserStory, thread: Thread) => boolean = (
  userStory: UserStory,
  thread: Thread,
) => {
  if (userStory.state !== 'Review' || userStory.threadId === thread.id) {
    return false;
  }
  return hasReviewStarted(
    userStory.review,
    thread,
    userStory.review.reviewComplexity,
  );
};

export const needReviewBy = (
  userStory: UserStory,
  thread: Thread,
  reviewersNeeded: number,
): boolean =>
  userStory.state === 'Review' &&
  userStory.threadId !== thread.id &&
  canReview(userStory.review, thread, reviewersNeeded);

export const isToReviewBy: (userStory: UserStory, thread: Thread) => boolean = (
  userStory: UserStory,
  thread: Thread,
) => userStory.state === 'ToReview' && userStory.threadId !== thread.id;

export const isToDo: (userStory: UserStory) => boolean = (
  userStory: UserStory,
) => userStory.state === 'Todo';
