import {describe, expect, test, vi} from 'vitest';
import {addUserStory, getUserStoriesDone, getUserStoriesRemainings,} from './backlog.ts';
import {type BugGenerator, CustomBugGenerator, noBugGenerator,} from './bug-generator.ts';
import {createBacklog, createThread, done, ensembleTeam, todo} from './factory.ts';
import {CustomPriorityModificator, noPriorityModificator, type PriorityModificator,} from './priority-modificator.ts';
import {simulate} from './simulation.ts';
import type {StructureEvent} from './simulation-structure.ts';
import type {Team, Thread} from './team.ts';
import {noTeamModificator, type TeamModificator} from './team-modificator.ts';

describe('Simulation', () => {
  test('Should have one thread developing a user story', () => {
    const team = ensembleTeam([createThread({ power: 1 })]);
    const backlog = createBacklog({userStoriesRemaining:[
      todo({
        complexity: 2,
      }),
    ]});
    const { timeEvents } = simulate(
      backlog,
      team,
      noBugGenerator,
      noTeamModificator,
      noPriorityModificator,
    );
    expect(timeEvents.pop()?.time).toEqual(2);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should build structure events on initialization', () => {
    const team = ensembleTeam([createThread()]);
    const backlog = createBacklog({userStoriesRemaining:[
      todo({
        complexity: 2,
      }),
    ]});

    const { structureEvents } = simulate(
      backlog,
      team,
      noBugGenerator,
      noTeamModificator,
      noPriorityModificator,
    );
    expect(structureEvents.length).toBeGreaterThan(0);
  });

  test('Should generate a bug during the first and second turn', () => {
    const team = ensembleTeam([createThread()]);
    const backlog = createBacklog({userStoriesRemaining:[
      todo({
        id: 1,
        name: 'US1',
        complexity: 1,
      }),
    ]});
    addUserStory(done({ id: 0, name: 'US0' }), backlog);
    const bugGenerator: BugGenerator = new CustomBugGenerator([
      {
        time: 1,
        complexity: 1,
        reviewComplexity: 1,
        priority: 1,
      },
    ]);

    const { structureEvents } = simulate(
      backlog,
      team,
      bugGenerator,
      noTeamModificator,
      noPriorityModificator,
    );
    expect(structureEvents.slice(-2)).toEqual([
      {
        id: 2,
        name: 'bug-0',
        time: 1,
        action: 'CreateUserStory',
      },
      {
        id: 2,
        time: 1,
        value: 1,
        action: 'ChangePriority',
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
      createBacklog({userStoriesRemaining:[todo()]}),
      teamToModify,
      noBugGenerator,
      teamModificator,
      noPriorityModificator,
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
      createBacklog({userStoriesRemaining:[todo()]}),
      teamToModify,
      noBugGenerator,
      teamModificator,
      noPriorityModificator,
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
      createBacklog({userStoriesRemaining:[todo()]}),
      teamToUpdate,
      noBugGenerator,
      noTeamModificator,
      noPriorityModificator,
    );

    expect(updateTimesMock).toHaveBeenCalled();
  });

  test('Should modify priority', () => {
    const priorityModificator: PriorityModificator =
      new CustomPriorityModificator([
        {
          time: 1,
          id: 0,
          priority: 3,
        },
      ]);
    const team = ensembleTeam();
    const { structureEvents } = simulate(
      createBacklog({userStoriesRemaining:[todo()]}),
      team,
      noBugGenerator,
      noTeamModificator,
      priorityModificator,
    );

    expect(structureEvents.slice(-1)).toEqual<StructureEvent[]>([
      {
        time: 1,
        id: 0,
        value: 3,
        action: 'ChangePriority',
      },
    ]);
  });
});
