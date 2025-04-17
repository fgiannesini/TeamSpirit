import {
  type Backlog,
  addUserStory,
  hasMoreUserStories,
  shouldGenerateBug,
} from './backlog.ts';
import type { TimeEvent } from './events.ts';
import { noReview } from './review.ts';
import { structureEventsOnInitialization } from './simulation-structure.ts';
import { simulateTimeEvents } from './simulation-time.ts';
import type { Team } from './team.ts';

export const simulate = (
  backlog: Backlog,
  team: Team,
  random: () => number = () => Math.random(),
) => {
  const timeEvents: TimeEvent[] = [];
  let time = 1;
  const structureEvents = structureEventsOnInitialization(backlog, team);
  while (hasMoreUserStories(backlog)) {
    if (shouldGenerateBug(random)) {
      structureEvents.push({
        time,
        name: 'bug-0',
        id: 2,
        action: 'CreateUserStory',
      });
      addUserStory(
        {
          id: 2,
          name: 'bug-0',
          complexity: 1,
          reviewComplexity: 1,
          progression: 0,
          review: noReview,
          threadId: undefined,
          state: 'Todo',
        },
        backlog,
      );
    }
    timeEvents.push(...simulateTimeEvents(team, backlog, time));
    time++;
  }
  return { timeEvents, structureEvents };
};
