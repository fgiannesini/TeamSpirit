import type { State, UserStory } from './user-story.ts';

export interface TimeEvent {
  time: number;
  userStoryName: string;
  state: State;
  threadId: number;
}

export const createTimeEvent = (
  time: number,
  userStory: UserStory,
  threadId: number,
): TimeEvent => ({
  time: time,
  userStoryName: userStory.name,
  threadId: threadId,
  state: userStory.state,
});
