import { type Backlog, getUserStories } from './backlog.ts';
import type { ParallelTeam } from './team.ts';

export enum Action {
  CreateThread = 0,
  CreateUserStory = 1,
}

export const simulateStructure = (backlog: Backlog, team: ParallelTeam) => {
  const userStoryStructureEvents = getUserStories(backlog).map((userStory) => {
    return {
      time: 1,
      id: userStory.id,
      name: userStory.name,
      action: Action.CreateUserStory,
    };
  });
  const threadStructureEvents = team.getThreads().map((thread) => {
    return {
      time: 1,
      id: thread.id,
      name: thread.name,
      action: Action.CreateThread,
    };
  });
  return [...threadStructureEvents, ...userStoryStructureEvents];
};
