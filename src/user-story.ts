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

export const setDone = (inProgress: UserStory, dev: Thread): UserStory => {
  return { ...inProgress, state: State.DONE, thread: dev.id };
};
