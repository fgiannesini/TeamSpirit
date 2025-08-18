import { type Backlog, getUserStories } from './backlog.ts';
import type { Team } from './team.ts';

export type StructureEvent =
  | {
      time: number;
      id: number;
      name: string;
      action: 'CreateThread' | 'CreateUserStory';
    }
  | {
      time: number;
      id: number;
      action: 'ThreadOff' | 'ThreadIn';
    }
  | {
      time: number;
      id: number;
      value: number;
      action: 'ChangePriority';
    };

export const structureEventsOnInitialization = (
  backlog: Backlog,
  team: Team,
): StructureEvent[] => {
  const userStoryStructureEvents: StructureEvent[] = getUserStories(
    backlog,
  ).flatMap((userStory) => {
    return [
      {
        time: 1,
        id: userStory.id,
        name: userStory.name,
        action: 'CreateUserStory',
      },
      {
        time: 1,
        id: userStory.id,
        value: userStory.priority,
        action: 'ChangePriority',
      },
    ];
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
