import type { TimeEvent } from './events.ts';
import { noReview } from './review.ts';
import type { Thread } from './team.ts';
import { State, type UserStory } from './user-story.ts';

export const todo = (options: Partial<UserStory> = {}): UserStory => {
  return {
    id: 0,
    name: 'user-story',
    complexity: 1,
    reviewComplexity: 1,
    review: noReview,
    state: State.Todo,
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
    state: State.InProgress,
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
    state: State.ToReview,
    threadId: 0,
    progression: 1,
    ...options,
  };
};

export const inReview = (options: Partial<UserStory> = {}): UserStory => {
  return {
    id: 0,
    name: 'user-story',
    complexity: 4,
    reviewComplexity: 2,
    review: {
      reviewersNeeded: 2,
      reviewers: new Map(),
    },
    state: State.Review,
    threadId: 0,
    progression: 0,
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
    state: State.Done,
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
    state: State.Done,
    ...options,
  };
};

export const inProgressEvent = (options: Partial<TimeEvent> = {}) => {
  return {
    state: State.InProgress,
    threadId: 0,
    time: 0,
    userStoryId: 0,
    ...options,
  };
};

export const toReviewEvent = (options: Partial<TimeEvent> = {}) => {
  return {
    state: State.ToReview,
    threadId: 0,
    time: 0,
    userStoryId: 0,
    ...options,
  };
};

export const doneEvent = (options: Partial<TimeEvent> = {}) => {
  return {
    state: State.Done,
    threadId: 0,
    time: 0,
    userStoryId: 0,
    ...options,
  };
};

export const reviewEvent = (options: Partial<TimeEvent> = {}) => {
  return {
    state: State.Review,
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
