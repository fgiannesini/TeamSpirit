import { State } from './task.ts';

export interface TimeEvent {
  time: number;
  taskName: string;
  state: State;
  thread: number;
}
