import { describe, expect, test, vitest } from 'vitest';
import { createThread, ensembleTeam, parallelTeam } from './factory.ts';
import {
  computeThreadsInProbabilities,
  computeThreadsRemovalProbabilities,
  TeamModificatorHandler,
} from './team-modificator.ts';

describe('Team modificator', () => {
  test('should add a new thread in a parallel team', () => {
    const initialTeam = parallelTeam([createThread({ id: 0 })]);
    const teamModificator = new TeamModificatorHandler(() => 0);
    const { team, addedThreads } = teamModificator.addTo(initialTeam, 1);
    expect(team).toEqual(
      parallelTeam([
        createThread({ id: 0 }),
        createThread({ id: 1, inTime: 1 }),
      ]),
    );
    expect(addedThreads).toEqual([createThread({ id: 1, inTime: 1 })]);
  });

  test('should add a new thread in an ensemble team', () => {
    const initialTeam = ensembleTeam([createThread({ id: 0 })]);
    const teamModificator = new TeamModificatorHandler(() => 0);
    const { team, addedThreads } = teamModificator.addTo(initialTeam, 1);
    expect(team).toEqual(
      ensembleTeam([
        createThread({ id: 0 }),
        createThread({ id: 1, inTime: 1 }),
      ]),
    );
    expect(addedThreads).toEqual([createThread({ id: 1, inTime: 1 })]);
  });

  test('should set a thread off in a parallel team', () => {
    const initialTeam = parallelTeam([
      createThread({ id: 0, off: false, inTime: 1 }),
      createThread({ id: 1, off: false, inTime: 1 }),
    ]);
    const randomProvider = vitest
      .fn<() => number>()
      .mockReturnValueOnce(1)
      .mockReturnValue(0);
    const teamModificator = new TeamModificatorHandler(randomProvider);
    const { team, removedThreads } = teamModificator.removeFrom(initialTeam);
    expect(team).toEqual(
      parallelTeam([
        createThread({ id: 0, off: false, inTime: 1 }),
        createThread({ id: 1, off: true, inTime: 0 }),
      ]),
    );
    expect(removedThreads).toEqual([{ id: 1, name: 'thread' }]);
  });

  test('should set a thread off of an ensemble team', () => {
    const initialTeam = ensembleTeam([
      createThread({ id: 0, off: false, inTime: 1 }),
      createThread({ id: 1, off: false, inTime: 1 }),
    ]);
    const randomProvider = vitest
      .fn<() => number>()
      .mockReturnValueOnce(1)
      .mockReturnValue(0);
    const teamModificator = new TeamModificatorHandler(randomProvider);
    const { team, removedThreads } = teamModificator.removeFrom(initialTeam);
    expect(team).toEqual(
      ensembleTeam([
        createThread({ id: 0, off: false, inTime: 1 }),
        createThread({ id: 1, off: true, inTime: 0 }),
      ]),
    );
    expect(removedThreads).toEqual([{ id: 1, name: 'thread' }]);
  });

  test('should not remove a thread if the team will be empty', () => {
    const initialTeam = parallelTeam([
      createThread({ id: 0, off: true }),
      createThread({ id: 1, off: false }),
    ]);
    const randomProvider = vitest.fn<() => number>().mockReturnValue(0);
    const teamModificator = new TeamModificatorHandler(randomProvider);
    const { team, removedThreads } = teamModificator.removeFrom(initialTeam);
    expect(team).toEqual(
      parallelTeam([
        createThread({ id: 0, off: true }),
        createThread({ id: 1, off: false }),
      ]),
    );
    expect(removedThreads).toEqual([]);
  });

  test.each([
    [1, [0, 0, 0]],
    [15, [0.11, 0.07, 0.02]],
    [30, [0.5, 0.3, 0.1]],
  ])(
    'should compute probability to set a thread off at time %s',
    (inTime: number, expectedProbabilities: number[]) => {
      const initialTeam = parallelTeam([
        createThread({ id: 0, power: 1, inTime }),
        createThread({ id: 1, power: 3, inTime }),
        createThread({ id: 2, power: 5, inTime }),
      ]);
      const actualProbabilities = computeThreadsRemovalProbabilities(
        initialTeam.getAllActiveThreads(),
      );
      expect(actualProbabilities[0]).toBeCloseTo(expectedProbabilities[0]);
      expect(actualProbabilities[1]).toBeCloseTo(expectedProbabilities[1]);
      expect(actualProbabilities[2]).toBeCloseTo(expectedProbabilities[2]);
    },
  );

  test.each([
    [1, 0.35],
    [4, 0.5],
    [7, 0.2],
    [10, 0.2],
    [15, 0.98],
    [20, 1],
  ])(
    'should compute the probability to set a thread in at time %s',
    (offTime: number, expectedProbability: number) => {
      const actualProbabilities = computeThreadsInProbabilities([
        createThread({ id: 1, power: 3, off: true, offTime }),
      ]);
      expect(actualProbabilities[1]).toBeCloseTo(expectedProbability);
    },
  );
});
