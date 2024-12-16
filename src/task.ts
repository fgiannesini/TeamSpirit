export enum State {
  TODO,
  IN_PROGRESS,
  DONE,
}
export type Task = {
  name: string;
  complexity: number;
  state: State;
};

export const idle: Task = {
  name: 'idle',
  complexity: 0,
  state: State.DONE,
};
