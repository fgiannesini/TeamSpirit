import { describe, expect, test } from 'vitest';
import { createThread, ensembleTeam, parallelTeam } from './factory.ts';
import { TeamModificator } from './team-modificator.ts';

describe('Team modificator', () => {
  test('should add a new thread in a parallel team', () => {
    const initialTeam = parallelTeam();
    const teamModificator = new TeamModificator(() => 0);
    const { team, addedThreads } = teamModificator.addTo(initialTeam);
    expect(team).toEqual(
      parallelTeam([createThread({ id: 0 }), createThread({ id: 1 })]),
    );
    expect(addedThreads).toEqual([createThread({ id: 1 })]);
  });

  test('should add a new thread in an ensemble team', () => {
    const initialTeam = ensembleTeam();
    const teamModificator = new TeamModificator(() => 0);
    const { team, addedThreads } = teamModificator.addTo(initialTeam);
    expect(team).toEqual(
      ensembleTeam([createThread({ id: 0 }), createThread({ id: 1 })]),
    );
    expect(addedThreads).toEqual([createThread({ id: 1 })]);
  });

  test('should remove a thread from a parallel team', () => {
    const initialTeam = parallelTeam([
      createThread({ id: 0 }),
      createThread({ id: 1 }),
    ]);
    const teamModificator = new TeamModificator(() => 0);
    const { team, removedThreads } = teamModificator.removeFrom(initialTeam);
    expect(team).toEqual(parallelTeam([createThread({ id: 0 })]));
    expect(removedThreads).toEqual([createThread({ id: 1 })]);
  });

  test('should remove a thread from an ensemble team', () => {
    const initialTeam = ensembleTeam([
      createThread({ id: 0 }),
      createThread({ id: 1 }),
    ]);
    const teamModificator = new TeamModificator(() => 0);
    const { team, removedThreads } = teamModificator.removeFrom(initialTeam);
    expect(team).toEqual(ensembleTeam([createThread({ id: 0 })]));
    expect(removedThreads).toEqual([createThread({ id: 1 })]);
  });
});
