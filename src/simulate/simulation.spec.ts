import { describe, expect, test } from 'vitest';
import {
  Backlog,
  getUserStoriesDone,
  getUserStoriesRemainings,
} from './backlog.ts';
import { todo } from './factory.ts';
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
    const { timeEvents } = simulate(backlog, team);
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
    const { structureEvents } = simulate(backlog, team);
    expect(structureEvents.length).toBeGreaterThan(0);
  });
});
