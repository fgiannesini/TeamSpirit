import { describe, expect, test, vi } from 'vitest';
import {
  addUserStory,
  Backlog,
  getUserStoriesDone,
  getUserStoriesRemainings,
} from './backlog.ts';
import { type BugGenerator, noBugGenerator } from './bug-generator.ts';
import { createThread, done, ensembleTeam, todo } from './factory.ts';
import { simulate } from './simulation.ts';
import type { StructureEvent } from './simulation-structure.ts';
import type { Team, Thread } from './team.ts';
import { noTeamModificator, type TeamModificator } from './team-modificator.ts';
import type { UserStory } from './user-story.ts';

describe('Simulation', () => {
  test('Should have one thread developing a user story', () => {
    const team = ensembleTeam([createThread({ power: 1 })]);
    const backlog = new Backlog([
      todo({
        complexity: 2,
      }),
    ]);
    const { timeEvents } = simulate(
      backlog,
      team,
      noBugGenerator,
      noTeamModificator,
    );
    expect(timeEvents.pop()?.time).toEqual(2);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should build structure events on initialization', () => {
    const team = ensembleTeam([createThread()]);
    const backlog = new Backlog([
      todo({
        complexity: 2,
      }),
    ]);

    const { structureEvents } = simulate(
      backlog,
      team,
      noBugGenerator,
      noTeamModificator,
    );
    expect(structureEvents.length).toBeGreaterThan(0);
  });

  test('Should generate a bug during the first and second turn', () => {
    const team = ensembleTeam([createThread()]);
    const backlog = new Backlog([
      todo({
        id: 1,
        name: 'US1',
        complexity: 1,
      }),
    ]);
    addUserStory(done({ id: 0, name: 'US0' }), backlog);
    const bugGenerator: BugGenerator = {
      generate(_: Backlog, _2: Team, time: number): UserStory[] {
        if (time === 1) {
          return [todo({ id: 1, name: 'bug-0' })];
        }
        return [];
      },
    };

    const { structureEvents } = simulate(
      backlog,
      team,
      bugGenerator,
      noTeamModificator,
    );
    expect(structureEvents.slice(-1)).toEqual([
      {
        id: 1,
        name: 'bug-0',
        time: 1,
        action: 'CreateUserStory',
      },
    ]);
    expect(backlog.userStoriesDone.length).toEqual(3);
  });

  test('Should set a thread off', () => {
    const teamModificator: TeamModificator = {
      setThreadsOff(team: Team): {
        team: Team;
        newThreadsOff: Pick<Thread, 'id' | 'name'>[];
      } {
        return { newThreadsOff: [{ id: 0, name: 'thread' }], team };
      },
      setThreadsIn(team: Team): {
        team: Team;
        newThreadsIn: Pick<Thread, 'id' | 'name'>[];
      } {
        return { newThreadsIn: [], team };
      },
    };
    const teamToModify = ensembleTeam([createThread()]);
    const { structureEvents } = simulate(
      new Backlog([todo()]),
      teamToModify,
      noBugGenerator,
      teamModificator,
    );

    expect(structureEvents.slice(-1)).toEqual<StructureEvent[]>([
      {
        id: 0,
        time: 1,
        action: 'ThreadOff',
      },
    ]);
  });

  test('Should set a thread in', () => {
    const teamModificator: TeamModificator = {
      setThreadsOff(team: Team): {
        team: Team;
        newThreadsOff: Pick<Thread, 'id' | 'name'>[];
      } {
        return { newThreadsOff: [], team };
      },
      setThreadsIn(team: Team): {
        team: Team;
        newThreadsIn: Pick<Thread, 'id' | 'name'>[];
      } {
        return { newThreadsIn: [{ id: 0, name: 'thread' }], team };
      },
    };
    const teamToModify = ensembleTeam([createThread()]);
    const { structureEvents } = simulate(
      new Backlog([todo()]),
      teamToModify,
      noBugGenerator,
      teamModificator,
    );

    expect(structureEvents.slice(-1)).toEqual<StructureEvent[]>([
      {
        id: 0,
        time: 1,
        action: 'ThreadIn',
      },
    ]);
  });

  test('Should update time in team', () => {
    const teamToUpdate = ensembleTeam([createThread()]);
    const updateTimesMock = vi.spyOn(teamToUpdate, 'updateTimes');
    simulate(
      new Backlog([todo()]),
      teamToUpdate,
      noBugGenerator,
      noTeamModificator,
    );

    expect(updateTimesMock).toHaveBeenCalled();
  });
});
