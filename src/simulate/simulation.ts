import {
  addUserStory,
  type Backlog,
  getUserStoriesRemainings,
  hasMoreUserStories,
  resetUserStoriesRemainings,
} from './backlog.ts';
import type { BugGenerator } from './bug-generator.ts';
import type { TimeEvent } from './events.ts';
import type { PriorityModificator } from './priority-modificator.ts';
import {
  type StructureEvent,
  structureEventsOnInitialization,
} from './simulation-structure.ts';
import { simulateTimeEvents } from './simulation-time.ts';
import type { Team } from './team.ts';
import type { TeamModificator } from './team-modificator.ts';

export const simulate = (
  originalBacklog: Backlog,
  originalTeam: Team,
  bugGenerator: BugGenerator,
  teamModificator: TeamModificator,
  priorityModificator: PriorityModificator,
): {
  timeEvents: TimeEvent[];
  structureEvents: StructureEvent[];
} => {
  const timeEvents: TimeEvent[] = [];
  let time = 1;
  let team = originalTeam;
  let backlog = originalBacklog;
  const structureEvents = structureEventsOnInitialization(backlog, team);
  while (hasMoreUserStories(backlog)) {
    bugGenerator.generate(backlog, team, time).forEach((bug) => {
      structureEvents.push(
        {
          time,
          name: bug.name,
          id: bug.id,
          action: 'CreateUserStory',
        },
        {
          time,
          value: bug.priority,
          id: bug.id,
          action: 'ChangePriority',
        },
      );

      addUserStory(bug, backlog);
    });
    const teamWithThreadsOff = teamModificator.setThreadsOff(team, time);
    team = teamWithThreadsOff.team;
    teamWithThreadsOff.newThreadsOff.forEach((thread) => {
      structureEvents.push({
        time,
        id: thread.id,
        action: 'ThreadOff',
      });
    });

    const teamWithThreadsIn = teamModificator.setThreadsIn(team, time);
    team = teamWithThreadsIn.team;
    teamWithThreadsIn.newThreadsIn.forEach((thread) => {
      structureEvents.push({
        time,
        id: thread.id,
        action: 'ThreadIn',
      });
    });

    const userStoriesWithModifications = priorityModificator.generate(
      getUserStoriesRemainings(backlog),
      time,
    );
    backlog = resetUserStoriesRemainings(
      backlog,
      userStoriesWithModifications.userStories,
    );
    userStoriesWithModifications.modifications.forEach((modification) => {
      structureEvents.push({
        time,
        id: modification.id,
        value: modification.priority,
        action: 'ChangePriority',
      });
    });

    timeEvents.push(...simulateTimeEvents(team, backlog, time));
    time++;
    team = team.updateTimes();
  }
  return { timeEvents, structureEvents };
};
