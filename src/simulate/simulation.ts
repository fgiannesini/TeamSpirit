import { type Backlog, hasMoreUserStories } from './backlog.ts';
import type { TimeEvent } from './events.ts';
import { structureEventsOnInitialization } from './simulation-structure.ts';
import { simulateTimeEvents } from './simulation-time.ts';
import type { Team } from './team.ts';

export const simulate = (backlog: Backlog, team: Team) => {
  const timeEvents: TimeEvent[] = [];
  let time = 1;
  const structureEvents = structureEventsOnInitialization(backlog, team);
  while (hasMoreUserStories(backlog)) {
    timeEvents.push(...simulateTimeEvents(team, backlog, time));
    time++;
  }
  return { timeEvents, structureEvents };
};
