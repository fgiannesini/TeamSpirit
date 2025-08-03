import { describe, expect, test } from 'vitest';
import { createThread, ensembleTeam, parallelTeam } from './factory.ts';
import { EnsembleTeam, ParallelTeam, type Team } from './team.ts';

describe('Team', () => {
  describe('Parallel team', () => {
    test('Should get effective threads', () => {
      const team: Team = parallelTeam([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
        createThread({ id: 2, quit: true }),
      ]);
      expect(team.getEffectiveThreads()).toEqual([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
      ]);
    });

    test('Should get all active threads', () => {
      const team: Team = parallelTeam([
        createThread({ id: 0 }),
        createThread({ id: 1, quit: true }),
      ]);
      expect(team.getAllActiveThreads()).toEqual([createThread({ id: 0 })]);
    });

    test('Should get all effective active threads', () => {
      const team: Team = parallelTeam([
        createThread({ id: 0 }),
        createThread({ id: 1, quit: true }),
      ]);
      expect(team.getEffectiveActiveThreads()).toEqual([
        createThread({ id: 0 }),
      ]);
    });

    test('Should add thread', () => {
      const team: Team = parallelTeam([createThread({ id: 0 })], 2);
      const newTeam = team.addThread(createThread({ id: 1 }));
      expect(newTeam).toEqual(
        parallelTeam([createThread({ id: 0 }), createThread({ id: 1 })], 2),
      );
    });

    test('Should quit thread', () => {
      const team: Team = parallelTeam(
        [createThread({ id: 0 }), createThread({ id: 1 })],
        2,
      );
      const newTeam = team.quit(1);
      expect(newTeam).toBeInstanceOf(ParallelTeam);
      expect(newTeam).toEqual(
        parallelTeam(
          [
            createThread({ id: 0, quit: false }),
            createThread({ id: 1, quit: true }),
          ],
          2,
        ),
      );
    });

    test('Should get capacity', () => {
      const team: Team = parallelTeam([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
      ]);
      const capacity = team.getCapacity();
      expect(capacity).toBe(2);
    });

    test('Should init reviewers needed with half of developers, rounded up', () => {
      const team: Team = parallelTeam([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
        createThread({ id: 2 }),
      ]);

      expect(team.getReviewersNeeded()).toStrictEqual(2);
    });

    test('Should have reviewers needed under developers count', () => {
      const team: Team = parallelTeam([createThread({ id: 0 })]);

      expect(team.getReviewersNeeded()).toStrictEqual(0);
    });

    test('Should have reviewers needed under active developers count', () => {
      const team: Team = parallelTeam([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
        createThread({ id: 2, quit: true }),
      ]);

      expect(team.getReviewersNeeded()).toStrictEqual(1);
    });
  });

  describe('Ensemble team', () => {
    test('Should get effective threads', () => {
      const team: Team = ensembleTeam([
        createThread({ id: 0, power: 10 }),
        createThread({ id: 1, power: 25 }),
        createThread({ id: 2, power: 15 }),
        createThread({ id: 3, power: 50, quit: true }),
      ]);
      expect(team.getEffectiveThreads()).toEqual([
        createThread({ id: 0, name: 'mob', power: 25 }),
      ]);
    });

    test('Should get all active threads', () => {
      const team: Team = ensembleTeam([
        createThread({ id: 0 }),
        createThread({ id: 1, quit: true }),
      ]);
      expect(team.getAllActiveThreads()).toEqual([createThread({ id: 0 })]);
    });

    test('Should get effective active threads', () => {
      const team: Team = ensembleTeam([
        createThread({ id: 0, power: 5 }),
        createThread({ id: 1, power: 15 }),
        createThread({ id: 1, quit: true }),
      ]);
      expect(team.getEffectiveActiveThreads()).toEqual([
        createThread({ id: 0, name: 'mob', power: 10 }),
      ]);
    });

    test('Should add thread', () => {
      const team: Team = ensembleTeam([createThread({ id: 0 })], 2);
      const newTeam = team.addThread(createThread({ id: 1 }));
      expect(newTeam).toEqual(
        ensembleTeam([createThread({ id: 0 }), createThread({ id: 1 })], 2),
      );
    });

    test('Should quit thread', () => {
      const team: Team = ensembleTeam(
        [createThread({ id: 0 }), createThread({ id: 1 })],
        2,
      );
      const newTeam = team.quit(1);
      expect(newTeam).toEqual(
        ensembleTeam(
          [
            createThread({ id: 0, quit: false }),
            createThread({ id: 1, quit: true }),
          ],
          2,
        ),
      );
      expect(newTeam).toBeInstanceOf(EnsembleTeam);
    });

    test('Should get capacity', () => {
      const team: Team = ensembleTeam([
        createThread({ id: 0 }),
        createThread({ id: 1 }),
      ]);
      const capacity = team.getCapacity();
      expect(capacity).toBe(2);
    });

    test('Should get reviewers needed', () => {
      const team: Team = ensembleTeam();
      const capacity = team.getReviewersNeeded();
      expect(capacity).toBe(0);
    });
  });
});
