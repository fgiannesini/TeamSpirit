import { describe, expect, test } from 'vitest';
import {
  Backlog,
  getUserStoriesDone,
  getUserStoriesRemainings,
} from './backlog.ts';
import { done, todo } from './factory.ts';
import { simulate } from './simulation.ts';
import { EnsembleTeam } from './team.ts';

describe('Simulation', () => {
  test('Should have one thread developing a user story', () => {
    const team = new EnsembleTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([
      todo({
        complexity: 2,
      }),
    ]);
    const { timeEvents } = simulate(backlog, team, []);
    expect(timeEvents.pop()?.time).toEqual(2);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should build structure events on initialization', () => {
    const team = new EnsembleTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([
      todo({
        complexity: 2,
      }),
    ]);
    const { structureEvents } = simulate(backlog, team, []);
    expect(structureEvents.length).toBeGreaterThan(0);
  });

  test('Should generate a bug during the first and second turn', () => {
    const team = new EnsembleTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([
      todo({
        id: 0,
        name: 'US1',
        complexity: 2,
      }),
    ]);
    const { structureEvents } = simulate(backlog, team, [0, 0.05, 1]);
    expect(structureEvents.slice(-2)).toEqual([
      {
        id: 1,
        name: 'bug-0',
        time: 1,
        action: 'CreateUserStory',
      },
      {
        id: 2,
        name: 'bug-1',
        time: 2,
        action: 'CreateUserStory',
      },
    ]);
    expect(backlog.userStoriesDone.length).toEqual(3);
  });

  test('Should generate a bug during the second turn', () => {
    const team = new EnsembleTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([
      todo({
        id: 0,
        name: 'US1',
        complexity: 1,
      }),
      todo({
        id: 1,
        name: 'US2',
        complexity: 1,
      }),
    ]);
    const { structureEvents } = simulate(backlog, team, [1, 0, 1]);
    expect(structureEvents.pop()).toEqual({
      id: 2,
      name: 'bug-0',
      time: 2,
      action: 'CreateUserStory',
    });
    expect(backlog.userStoriesDone.pop()).toEqual(
      done({
        id: 2,
        name: 'bug-0',
      }),
    );
  });
});
