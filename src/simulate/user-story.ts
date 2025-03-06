import { Thread } from './team.ts';
import {
  getReviewPoints,
  hasAllReviews,
  needReview,
  noReview,
  Review,
} from './review.ts';

export enum State {
  TODO,
  IN_PROGRESS,
  TO_REVIEW,
  REVIEW,
  DONE,
}

export interface UserStory {
  name: string;
  complexity: number;
  reviewComplexity: number;
  progression: number;
  review: Review;
  thread?: number;
  state: State;
}

export const idle: UserStory = {
  name: 'idle',
  complexity: 0,
  progression: 0,
  reviewComplexity: 0,
  review: noReview,
  thread: undefined,
  state: State.DONE,
};

export const setInProgress = (userStory: UserStory, dev: Thread): UserStory => {
  return {
    ...userStory,
    progression: Math.min(
      userStory.progression + dev.power,
      userStory.complexity,
    ),
    thread: dev.id,
    state: State.IN_PROGRESS,
  };
};

export const setDoneBy = (userStory: UserStory, devId: number): UserStory => {
  return { ...userStory, state: State.DONE, thread: devId };
};

export const setDone = (userStory: UserStory): UserStory => {
  return { ...userStory, state: State.DONE };
};

export const setToReview = (userStory: UserStory, dev: Thread): UserStory => {
  return {
    ...userStory,
    state: State.TO_REVIEW,
    thread: dev.id,
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

export const setReview = (userStory: UserStory, dev: Thread): UserStory => {
  const currentReview = userStory.review;
  const currentReviewPoints = getReviewPoints(currentReview, dev);
  const newReviewPoints = Math.min(
    currentReviewPoints + dev.power,
    userStory.reviewComplexity,
  );
  const newReview = updateReviewPoints(currentReview, dev, newReviewPoints);

  return {
    ...userStory,
    state: State.REVIEW,
    review: newReview,
  };
};

export const isDeveloped = (userStory: UserStory): boolean => {
  return userStory.progression == userStory.complexity;
};

export const isReviewed = (userStory: UserStory): boolean => {
  return hasAllReviews(userStory.review, userStory.reviewComplexity);
};

export const isInProgressBy: (
  userStory: UserStory,
  thread: Thread,
) => boolean = (userStory: UserStory, thread: Thread) =>
  userStory.state === State.IN_PROGRESS && userStory.thread === thread.id;

export const isInReviewBy: (userStory: UserStory, thread: Thread) => boolean = (
  userStory: UserStory,
  thread: Thread,
) =>
  userStory.state === State.REVIEW &&
  userStory.thread !== thread.id &&
  needReview(userStory.review, thread, userStory.reviewComplexity);

export const isToReviewBy: (userStory: UserStory, thread: Thread) => boolean = (
  userStory: UserStory,
  thread: Thread,
) => userStory.state === State.TO_REVIEW && userStory.thread !== thread.id;

export const toDo: (userStory: UserStory) => boolean = (userStory: UserStory) =>
  userStory.state === State.TODO;
