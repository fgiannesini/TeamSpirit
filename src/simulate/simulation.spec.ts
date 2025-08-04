import { describe, expect, test, vi } from 'vitest';
import {
  addUserStory,
  Backlog,
  getUserStoriesDone,
  getUserStoriesRemainings,
} from './backlog.ts';
import type { BugGenerator } from './bug-generator.ts';
import { createThread, done, ensembleTeam, todo } from './factory.ts';
import { simulate } from './simulation.ts';
import type { Team, Thread } from './team.ts';
import type { TeamModificator } from './team-modificator.ts';
import type { UserStory } from './user-story.ts';

describe('Simulation', () => {
  const noBugGenerator: BugGenerator = {
    generate(_: Backlog, _2: Team, _3: number): UserStory[] {
      return [];
    },
  };

  const noTeamModificator: TeamModificator = {
    addTo(
      team: Team,
      _startedTime: number,
    ): { team: Team; addedThreads: Thread[] } {
      return { addedThreads: [], team };
    },
    removeFrom(team: Team): {
      team: Team;
      removedThreads: Pick<Thread, 'id' | 'name'>[];
    } {
      return { removedThreads: [], team };
    },
  };

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

  test('Should remove a thread', () => {
    const teamModificator: TeamModificator = {
      removeFrom(team: Team): {
        team: Team;
        removedThreads: Pick<Thread, 'id' | 'name'>[];
      } {
        return { removedThreads: [{ id: 0, name: 'thread' }], team };
      },
      addTo(team: Team): { team: Team; addedThreads: Thread[] } {
        return { addedThreads: [], team };
      },
    };
    const teamToModify = ensembleTeam([createThread()]);
    const { structureEvents } = simulate(
      new Backlog([todo()]),
      teamToModify,
      noBugGenerator,
      teamModificator,
    );

    expect(structureEvents.slice(-1)).toEqual([
      {
        id: 0,
        name: 'thread',
        time: 1,
        action: 'RemoveThread',
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
