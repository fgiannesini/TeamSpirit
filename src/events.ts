import { State } from './task.ts';

export interface TimeEvent {
  time: number;
  taskName: string;
  previousState: State;
  newState: State;
  thread: number;
}
