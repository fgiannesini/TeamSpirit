import { type Backlog, getUserStories } from './backlog.ts';
import type { Team } from './team.ts';

export type Action = 'CreateThread' | 'CreateUserStory';
export type StructureEvent = {
  time: number;
  id: number;
  name: string;
  action: Action;
};

export const structureEventsOnInitialization = (
  backlog: Backlog,
  team: Team,
): StructureEvent[] => {
  const userStoryStructureEvents: StructureEvent[] = getUserStories(
    backlog,
  ).map((userStory) => {
    return {
      time: 1,
      id: userStory.id,
      name: userStory.name,
      action: 'CreateUserStory',
    };
  });
  const threadStructureEvents: StructureEvent[] = team
    .getEffectiveThreads()
    .map((thread) => {
      return {
        time: 1,
        id: thread.id,
        name: thread.name,
        action: 'CreateThread',
      };
    });
  return [...threadStructureEvents, ...userStoryStructureEvents];
};
