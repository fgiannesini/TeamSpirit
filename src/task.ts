export enum State {
  TODO,
  IN_PROGRESS,
  DONE,
}
export type Task = {
  name: string;
  complexity: number;
  progression: number;
  thread: number | undefined;
  state: State;
};

export const idle: Task = {
  name: 'idle',
  complexity: 0,
  progression: 0,
  thread: undefined,
  state: State.DONE,
};
