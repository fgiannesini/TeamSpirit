import { type Backlog, getUserStories } from './backlog.ts';
import type { ParallelTeam } from './team.ts';

export type Action =  'CreateThread' | 'CreateUserStory'

export const simulateStructure = (backlog: Backlog, team: ParallelTeam) => {
  const userStoryStructureEvents = getUserStories(backlog).map((userStory) => {
    return {
      time: 1,
      id: userStory.id,
      name: userStory.name,
      action: 'CreateUserStory',
    };
  });
  const threadStructureEvents = team.getThreads().map((thread) => {
    return {
      time: 1,
      id: thread.id,
      name: thread.name,
      action: 'CreateThread',
    };
  });
  return [...threadStructureEvents, ...userStoryStructureEvents];
};
