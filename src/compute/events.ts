import { State, UserStory } from './user-story.ts';

export interface TimeEvent {
  time: number;
  userStoryName: string;
  state: State;
  thread: number;
}

export const createEvent = (time: number, userStory: UserStory): TimeEvent => ({
  time: time,
  userStoryName: userStory.name,
  thread: userStory.thread!,
  state: userStory.state,
});
