import {addUserStory, type Backlog, hasMoreUserStories} from './backlog.ts';
import type {BugGenerator} from './bug-generator.ts';
import type {TimeEvent} from './events.ts';
import {type StructureEvent, structureEventsOnInitialization,} from './simulation-structure.ts';
import {simulateTimeEvents} from './simulation-time.ts';
import type {Team} from './team.ts';
import type {TeamModificator} from './team-modificator.ts';

export const simulate = (
  backlog: Backlog,
  originalTeam: Team,
  bugGenerator: BugGenerator,
  teamModificator: TeamModificator,
): {
  timeEvents: TimeEvent[];
  structureEvents: StructureEvent[];
} => {
  const timeEvents: TimeEvent[] = [];
  let time = 1;
  let team = originalTeam;
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
    const teamWithThreadsOff = teamModificator.setThreadsOff(team);
    team = teamWithThreadsOff.team;
    teamWithThreadsOff.newThreadsOff.forEach((thread) => {
      structureEvents.push({
        time,
        name: thread.name,
        id: thread.id,
        action: 'ThreadOff',
      });
    });

    const teamWithThreadsIn = teamModificator.setThreadsIn(team);
    team = teamWithThreadsIn.team;
    teamWithThreadsIn.newThreadsIn.forEach((thread) => {
      structureEvents.push({
        time,
        name: thread.name,
        id: thread.id,
        action: 'ThreadIn',
      });
    });

    timeEvents.push(...simulateTimeEvents(team, backlog, time));
    time++;
    team = team.updateTimes();
  }
  return { timeEvents, structureEvents };
};
