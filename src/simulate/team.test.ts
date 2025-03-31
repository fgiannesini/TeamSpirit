import { describe, expect, test } from 'vitest';
import { EnsembleTeam, ParallelTeam, type Team } from './team.ts';

describe('Team', () => {
  test('Should create a parallel team', () => {
    const team: Team = new ParallelTeam([
      { id: 1, name: 'thread1', power: 10 },
      { id: 2, name: 'thread2', power: 25 },
      { id: 3, name: 'thread3', power: 15 },
    ]);
    expect(team.getThreads()).toEqual([
      { id: 1, name: 'thread1', power: 10 },
      { id: 2, name: 'thread2', power: 25 },
      { id: 3, name: 'thread3', power: 15 },
    ]);
  });

  test('Should create an ensemble team', () => {
    const team: Team = new EnsembleTeam([
      { id: 1, name: 'mob', power: 10 },
      { id: 2, name: 'mob', power: 25 },
      { id: 3, name: 'mob', power: 15 },
    ]);
    expect(team.getThreads()).toEqual([{ id: 1, name: 'mob', power: 17 }]);
  });
});
