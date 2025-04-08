import type { State, UserStory } from './user-story.ts';

export interface TimeEvent {
  time: number;
  userStoryId: number;
  state: State;
  threadId: number;
}

export const createTimeEvent = (
  time: number,
  userStory: UserStory,
  threadId: number,
): TimeEvent => ({
  time: time,
  userStoryId: userStory.id,
  threadId: threadId,
  state: userStory.state,
});
