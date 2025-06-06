import { type Backlog, addUserStory, hasMoreUserStories } from './backlog.ts';
import type { BugGenerator } from './bug-generator.ts';
import type { TimeEvent } from './events.ts';
import { structureEventsOnInitialization } from './simulation-structure.ts';
import { simulateTimeEvents } from './simulation-time.ts';
import type { Team } from './team.ts';

export const simulate = (
  backlog: Backlog,
  team: Team,
  bugGenerator: BugGenerator,
) => {
  const timeEvents: TimeEvent[] = [];
  let time = 1;
  const structureEvents = structureEventsOnInitialization(backlog, team);
  while (hasMoreUserStories(backlog)) {
    bugGenerator.generate(backlog, team, time).forEach((bug) => {
      structureEvents.push({
        time,
        name: bug.name,
        id: bug.id,
        action: 'CreateUserStory',
      });
      addUserStory(bug, backlog);
    });

    timeEvents.push(...simulateTimeEvents(team, backlog, time));
    time++;
  }
  return { timeEvents, structureEvents };
};
