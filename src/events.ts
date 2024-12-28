import { State } from './user-story.ts';

export interface TimeEvent {
  time: number;
  userStoryName: string;
  state: State;
  thread: number;
}
