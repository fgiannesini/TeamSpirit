import type { TimeEvent } from './events.ts';
import { noReview } from './review.ts';
import type { Thread } from './team.ts';
import type { UserStory } from './user-story.ts';

export const todo = (options: Partial<UserStory> = {}): UserStory => {
  return {
    id: 0,
    name: 'user-story',
    complexity: 1,
    reviewComplexity: 1,
    review: noReview,
    state: 'Todo',
    threadId: undefined,
    progression: 0,
    ...options,
  };
};

export const inProgress = (options: Partial<UserStory> = {}): UserStory => {
  return {
    id: 0,
    name: 'user-story',
    complexity: 1,
    reviewComplexity: 1,
    review: noReview,
    state: 'InProgress',
    threadId: 0,
    progression: 1,
    ...options,
  };
};

export const toReview = (options: Partial<UserStory> = {}): UserStory => {
  return {
    id: 0,
    name: 'user-story',
    complexity: 1,
    reviewComplexity: 1,
    review: {
      reviewers: new Map(),
      reviewersNeeded: 1,
    },
    state: 'ToReview',
    threadId: 0,
    progression: 1,
    ...options,
  };
};

export const inReview = (options: Partial<UserStory> = {}): UserStory => {
  return {
    id: 0,
    name: 'user-story',
    complexity: 1,
    reviewComplexity: 1,
    review: {
      reviewersNeeded: 1,
      reviewers: new Map(),
    },
    state: 'Review',
    threadId: 0,
    progression: 1,
    ...options,
  };
};

export const done = (options: Partial<UserStory> = {}): UserStory => {
  return {
    id: 0,
    name: 'user-story',
    complexity: 1,
    reviewComplexity: 1,
    review: noReview,
    state: 'Done',
    threadId: 0,
    progression: 1,
    ...options,
  };
};

export const idleEvent = (options: Partial<TimeEvent> = {}): TimeEvent => {
  return {
    time: 0,
    userStoryId: -1,
    threadId: 0,
    state: 'Done',
    ...options,
  };
};

export const inProgressEvent = (options: Partial<TimeEvent> = {}) => {
  return {
    state: 'InProgress',
    threadId: 0,
    time: 0,
    userStoryId: 0,
    ...options,
  };
};

export const toReviewEvent = (options: Partial<TimeEvent> = {}) => {
  return {
    state: 'ToReview',
    threadId: 0,
    time: 0,
    userStoryId: 0,
    ...options,
  };
};

export const doneEvent = (options: Partial<TimeEvent> = {}) => {
  return {
    state: 'Done',
    threadId: 0,
    time: 0,
    userStoryId: 0,
    ...options,
  };
};

export const reviewEvent = (options: Partial<TimeEvent> = {}) => {
  return {
    state: 'Review',
    threadId: 0,
    time: 0,
    userStoryId: 0,
    ...options,
  };
};

export const thread = (options: Partial<Thread> = {}) => {
  return {
    id: 0,
    name: 'thread',
    power: 1,
    ...options,
  };
};
