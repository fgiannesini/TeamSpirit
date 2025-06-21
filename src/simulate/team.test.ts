import { describe, expect, test } from 'vitest';
import { createThread } from './factory.ts';
import { EnsembleTeam, ParallelTeam, type Team } from './team.ts';

describe('Team', () => {
  describe('Parallel team', () => {
    test('Should get effective threads', () => {
      const team: Team = new ParallelTeam([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
      ]);
      expect(team.getEffectiveThreads()).toEqual([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
      ]);
    });

    test('Should get real threads team', () => {
      const team: Team = new ParallelTeam([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
      ]);
      expect(team.getRealThreads()).toEqual([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
      ]);
    });

    test('Should add thread', () => {
      const team: Team = new ParallelTeam([createThread({ id: 0 })], 2);
      const newTeam = team.addThread(createThread({ id: 1 }));
      expect(newTeam).toEqual(
        new ParallelTeam([createThread({ id: 0 }), createThread({ id: 1 })], 2),
      );
    });

    test('Should remove thread', () => {
      const team: Team = new ParallelTeam(
        [createThread({ id: 0 }), createThread({ id: 1 })],
        2,
      );
      const newTeam = team.removeThread(1);
      expect(newTeam).toEqual(new ParallelTeam([createThread({ id: 0 })], 2));
    });

    test('Should get capacity', () => {
      const team: Team = new ParallelTeam([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
      ]);
      const capacity = team.getCapacity();
      expect(capacity).toBe(2);
    });
  });

  describe('Ensemble team', () => {
    test('Should get effective threads', () => {
      const team: Team = new EnsembleTeam([
        createThread({ id: 0, power: 10 }),
        createThread({ id: 1, power: 25 }),
        createThread({ id: 2, power: 15 }),
      ]);
      expect(team.getEffectiveThreads()).toEqual([
        createThread({ id: 0, name: 'mob', power: 17 }),
      ]);
    });

    test('Should get reals threads', () => {
      const team: Team = new EnsembleTeam([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
      ]);
      expect(team.getRealThreads()).toEqual([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
      ]);
    });

    test('Should add thread', () => {
      const team: Team = new EnsembleTeam([createThread({ id: 0 })], 2);
      const newTeam = team.addThread(createThread({ id: 1 }));
      expect(newTeam).toEqual(
        new EnsembleTeam([createThread({ id: 0 }), createThread({ id: 1 })], 2),
      );
    });

    test('Should remove thread', () => {
      const team: Team = new EnsembleTeam(
        [createThread({ id: 0 }), createThread({ id: 1 })],
        2,
      );
      const newTeam = team.removeThread(1);
      expect(newTeam).toEqual(new EnsembleTeam([createThread({ id: 0 })], 2));
    });

    test('Should get capacity', () => {
      const team: Team = new EnsembleTeam([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
      ]);
      const capacity = team.getCapacity();
      expect(capacity).toBe(2);
    });
  });
});
