import { type Backlog, getUserStories } from './backlog.ts';
import { Action } from './simulation-structure.test.ts';
import type { ParallelTeam } from './team.ts';

export const simulateStructure = (backlog: Backlog, team: ParallelTeam) => {
  const userStoryStructureEvents = getUserStories(backlog).map((userStory) => {
    return {
      time: 1,
      id: userStory.id,
      name: userStory.name,
      action: Action.CREATE_USER_STORY,
    };
  });
  const threadStructureEvents = team.getThreads().map((thread) => {
    return {
      time: 1,
      id: thread.id,
      name: thread.name,
      action: Action.CREATE_THREAD,
    };
  });
  return [...threadStructureEvents, ...userStoryStructureEvents];
};
