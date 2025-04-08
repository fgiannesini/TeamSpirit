import type { State, UserStory } from './user-story.ts';

export interface TimeEvent {
  time: number;
  userStoryId: string;
  state: State;
  threadId: number;
}

export const createTimeEvent = (
  time: number,
  userStory: UserStory,
  threadId: number,
): TimeEvent => ({
  time: time,
  userStoryId: userStory.name,
  threadId: threadId,
  state: userStory.state,
});
