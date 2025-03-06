import { describe, expect, test } from 'vitest';
import { EnsembleTeam, ParallelTeam, Team } from './team.ts';

describe('Team', () => {
  test('Should create a parallel team', () => {
    const team: Team = new ParallelTeam([
      { id: 1, power: 10 },
      { id: 2, power: 25 },
      { id: 3, power: 15 },
    ]);
    expect(team.getThreads()).toEqual([
      { id: 1, power: 10 },
      { id: 2, power: 25 },
      { id: 3, power: 15 },
    ]);
  });

  test('Should create an ensemble team', () => {
    const team: Team = new EnsembleTeam([
      { id: 1, power: 10 },
      { id: 2, power: 25 },
      { id: 3, power: 15 },
    ]);
    expect(team.getThreads()).toEqual([{ id: 1, power: 17 }]);
  });
});
