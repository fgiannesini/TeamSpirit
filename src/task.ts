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
