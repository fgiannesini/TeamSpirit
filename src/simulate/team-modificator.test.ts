import { describe, expect, test, vitest } from 'vitest';
import { createThread, ensembleTeam, parallelTeam } from './factory.ts';
import {
  computeThreadsRemovalProbabilities,
  TeamModificator,
} from './team-modificator.ts';

describe('Team modificator', () => {
  test('should add a new thread in a parallel team', () => {
    const initialTeam = parallelTeam([createThread({ id: 0 })], 2);
    const teamModificator = new TeamModificator(() => 0);
    const { team, addedThreads } = teamModificator.addTo(initialTeam, 1);
    expect(team).toEqual(
      parallelTeam([
        createThread({ id: 0 }),
        createThread({ id: 1, startedTime: 1 }),
      ]),
    );
    expect(addedThreads).toEqual([createThread({ id: 1, startedTime: 1 })]);
  });

  test('should add a new thread in an ensemble team', () => {
    const initialTeam = ensembleTeam([createThread({ id: 0 })], 2);
    const teamModificator = new TeamModificator(() => 0);
    const { team, addedThreads } = teamModificator.addTo(initialTeam, 1);
    expect(team).toEqual(
      ensembleTeam([
        createThread({ id: 0 }),
        createThread({ id: 1, startedTime: 1 }),
      ]),
    );
    expect(addedThreads).toEqual([createThread({ id: 1, startedTime: 1 })]);
  });

  test('should set a thread quit in a parallel team', () => {
    const initialTeam = parallelTeam(
      [
        createThread({ id: 0, quit: false }),
        createThread({ id: 1, quit: false }),
      ],
      2,
    );
    const randomProvider = vitest
      .fn<() => number>()
      .mockReturnValueOnce(1)
      .mockReturnValue(0);
    const teamModificator = new TeamModificator(randomProvider);
    const { team, removedThreadIds } = teamModificator.removeFrom(
      initialTeam,
      1,
    );
    expect(team).toEqual(
      parallelTeam(
        [
          createThread({ id: 0, quit: false }),
          createThread({ id: 1, quit: true }),
        ],
        2,
      ),
    );
    expect(removedThreadIds).toEqual([1]);
  });

  test('should set a thread quit of an ensemble team', () => {
    const initialTeam = ensembleTeam(
      [
        createThread({ id: 0, quit: false }),
        createThread({ id: 1, quit: false }),
      ],
      2,
    );
    const randomProvider = vitest
      .fn<() => number>()
      .mockReturnValueOnce(1)
      .mockReturnValue(0);
    const teamModificator = new TeamModificator(randomProvider);
    const { team, removedThreadIds } = teamModificator.removeFrom(
      initialTeam,
      1,
    );
    expect(team).toEqual(
      ensembleTeam(
        [
          createThread({ id: 0, quit: false }),
          createThread({ id: 1, quit: true }),
        ],
        2,
      ),
    );
    expect(removedThreadIds).toEqual([1]);
  });

  test.each([
    [1, [0, 0, 0]],
    [15, [0.11, 0.07, 0.02]],
    [30, [0.5, 0.3, 0.1]],
  ])(
    'should compute probability to remove a thread at time %s',
    (time: number, expectedProbabilities: number[]) => {
      const initialTeam = parallelTeam([
        createThread({ id: 0, power: 1 }),
        createThread({ id: 1, power: 3 }),
        createThread({ id: 2, power: 5 }),
      ]);
      const actualProbabilities = computeThreadsRemovalProbabilities(
        initialTeam.getRealThreads(),
        time,
      );
      expect(actualProbabilities[0]).toBeCloseTo(expectedProbabilities[0]);
      expect(actualProbabilities[1]).toBeCloseTo(expectedProbabilities[1]);
      expect(actualProbabilities[2]).toBeCloseTo(expectedProbabilities[2]);
    },
  );
});
