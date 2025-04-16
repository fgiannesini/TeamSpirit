import {
  type Review,
  getReviewPoints,
  hasAllReviews,
  needReview,
  noReview,
} from './review.ts';
import type { Thread } from './team.ts';

export type State = 'Todo' | 'InProgress' | 'ToReview' | 'Review' | 'Done';
export type UserStory = {
  id: number;
  name: string;
  complexity: number;
  reviewComplexity: number;
  progression: number;
  review: Review;
  threadId?: number;
  state: State;
};

export const idle: UserStory = {
  id: -1,
  name: 'idle',
  complexity: 0,
  progression: 0,
  reviewComplexity: 0,
  review: noReview,
  threadId: undefined,
  state: 'Done',
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
): UserStory => {
  return { ...userStory, state: 'Done', threadId: threadId };
};

export const setDone = (userStory: UserStory): UserStory => {
  return { ...userStory, state: 'Done' };
};

export const setToReview = (
  userStory: UserStory,
  threadId: number,
): UserStory => {
  return {
    ...userStory,
    state: 'ToReview',
    threadId: threadId,
  };
};

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

export const setReview = (userStory: UserStory, thread: Thread): UserStory => {
  const currentReview = userStory.review;
  const currentReviewPoints = getReviewPoints(currentReview, thread);
  const newReviewPoints = Math.min(
    currentReviewPoints + thread.power,
    userStory.reviewComplexity,
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
  return hasAllReviews(userStory.review, userStory.reviewComplexity);
};

export const isInProgressBy: (userStory: UserStory, thread: Thread) => boolean =
  (userStory: UserStory, thread: Thread) =>
    userStory.state === 'InProgress' && userStory.threadId === thread.id;

export const isInReviewBy: (userStory: UserStory, thread: Thread) => boolean = (
  userStory: UserStory,
  thread: Thread,
) =>
  userStory.state === 'Review' &&
  userStory.threadId !== thread.id &&
  needReview(userStory.review, thread, userStory.reviewComplexity);

export const isToReviewBy: (userStory: UserStory, thread: Thread) => boolean = (
  userStory: UserStory,
  thread: Thread,
) => userStory.state === 'ToReview' && userStory.threadId !== thread.id;

export const isToDo: (userStory: UserStory) => boolean = (
  userStory: UserStory,
) => userStory.state === 'Todo';
