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
