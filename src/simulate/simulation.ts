import {
  type Backlog,
  addUserStory,
  getUserStories,
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
  let bugCount = 0;
  const structureEvents = structureEventsOnInitialization(backlog, team);
  while (hasMoreUserStories(backlog)) {
    if (shouldGenerateBug([random()])) {
      const id = getUserStories(backlog).length;
      const name = `bug-${bugCount}`;
      structureEvents.push({
        time,
        name,
        id,
        action: 'CreateUserStory',
      });
      addUserStory(
        {
          id,
          name,
          complexity: 1,
          reviewComplexity: 1,
          progression: 0,
          review: noReview,
          threadId: undefined,
          state: 'Todo',
        },
        backlog,
      );
      bugCount++;
    }
    timeEvents.push(...simulateTimeEvents(team, backlog, time));
    time++;
  }
  return { timeEvents, structureEvents };
};
