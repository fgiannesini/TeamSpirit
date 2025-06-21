import { describe, expect, test } from 'vitest';
import { EnsembleTeam, ParallelTeam, type Team } from './team.ts';

describe('Team', () => {
  describe('Parallel team', () => {
    test('Should get effective threads', () => {
      const team: Team = new ParallelTeam([
        { id: 0, name: 'thread0', power: 10 },
        { id: 1, name: 'thread1', power: 25 },
        { id: 2, name: 'thread2', power: 15 },
      ]);
      expect(team.getEffectiveThreads()).toEqual([
        { id: 0, name: 'thread0', power: 10 },
        { id: 1, name: 'thread1', power: 25 },
        { id: 2, name: 'thread2', power: 15 },
      ]);
    });

    test('Should get real threads team', () => {
      const team: Team = new ParallelTeam([
        { id: 0, name: 'thread0', power: 10 },
        { id: 1, name: 'thread1', power: 25 },
        { id: 2, name: 'thread2', power: 15 },
      ]);
      expect(team.getRealThreads()).toEqual([
        { id: 0, name: 'thread0', power: 10 },
        { id: 1, name: 'thread1', power: 25 },
        { id: 2, name: 'thread2', power: 15 },
      ]);
    });
  });

  describe('Ensemble team', () => {
    test('Should get effective threads', () => {
      const team: Team = new EnsembleTeam([
        { id: 0, name: 'mob', power: 10 },
        { id: 1, name: 'mob', power: 25 },
        { id: 2, name: 'mob', power: 15 },
      ]);
      expect(team.getEffectiveThreads()).toEqual([
        { id: 0, name: 'mob', power: 17 },
      ]);
    });
  });

  test('Should get reals threads', () => {
    const team: Team = new EnsembleTeam([
      { id: 0, name: 'mob', power: 10 },
      { id: 1, name: 'mob', power: 25 },
      { id: 2, name: 'mob', power: 15 },
    ]);
    expect(team.getRealThreads()).toEqual([
      { id: 0, name: 'mob', power: 10 },
      { id: 1, name: 'mob', power: 25 },
      { id: 2, name: 'mob', power: 15 },
    ]);
  });
});
