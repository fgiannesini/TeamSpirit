import type { State, UserStory } from './user-story.ts';

export type TimeEvent = {
  time: number;
  userStoryId: number;
  state: State;
  threadId: number;
};

export const createTimeEvent = (
  time: number,
  userStory: UserStory,
  threadId: number,
): TimeEvent => ({
  time,
  userStoryId: userStory.id,
  threadId,
  state: userStory.state,
});
