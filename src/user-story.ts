import { Thread } from './team.ts';

export enum State {
  TODO,
  IN_PROGRESS,
  TO_REVIEW,
  REVIEW,
  DONE,
}
export type UserStory = {
  name: string;
  complexity: number;
  progression: number;
  thread: number | undefined;
  state: State;
};

export const idle: UserStory = {
  name: 'idle',
  complexity: 0,
  progression: 0,
  thread: undefined,
  state: State.DONE,
};

export const setInProgress = (userStory: UserStory, dev: Thread): UserStory => {
  return {
    ...userStory,
    progression: userStory.progression + 1,
    thread: dev.id,
    state: State.IN_PROGRESS,
  };
};

export const setDone = (userStory: UserStory, dev: Thread): UserStory => {
  return { ...userStory, state: State.DONE, thread: dev.id };
};

export const setToReview = (userStory: UserStory, dev: Thread): UserStory => {
  return { ...userStory, state: State.TO_REVIEW, thread: dev.id };
};

export const setReview = (userStory: UserStory, dev: Thread): UserStory => {
  return { ...userStory, state: State.REVIEW, thread: dev.id };
};

export const isDeveloped = (userStory: UserStory): boolean => {
  return userStory.progression == userStory.complexity;
};

export const toReviewBy = (userStory: UserStory, thread: Thread): boolean => {
  return userStory.state === State.TO_REVIEW && userStory.thread !== thread.id;
};

export const isInProgressBy: (
  userStory: UserStory,
  thread: Thread
) => boolean = (userStory: UserStory, thread: Thread) =>
  userStory.state === State.IN_PROGRESS && userStory.thread === thread.id;

export const toDo: (userStory: UserStory) => boolean = (userStory: UserStory) =>
  userStory.thread === -1;
