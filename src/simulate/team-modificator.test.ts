import { describe, expect, test } from 'vitest';
import { ensembleTeam, parallelTeam, thread } from './factory.ts';
import type { Team } from './team.ts';

class TeamModificator {
  constructor(private readonly randomProvider: () => number) {}

  addTo(team: Team) {
    this.randomProvider();
    const threadToAdd = thread({ id: 1 });
    return {
      team: team.addThread(threadToAdd),
      addedThreads: [threadToAdd],
    };
  }

  removeFrom(team: Team) {
    const removedThread = team.getRealThreads()[1];
    return {
      team: team.removeThread(1),
      removedThreads: [removedThread],
    };
  }
}

describe('Team modificator', () => {
  test('should add a new thread in a parallel team', () => {
    const initialTeam = parallelTeam();
    const teamModificator = new TeamModificator(() => 0);
    const { team, addedThreads } = teamModificator.addTo(initialTeam);
    expect(team).toEqual(parallelTeam([thread({ id: 0 }), thread({ id: 1 })]));
    expect(addedThreads).toEqual([thread({ id: 1 })]);
  });

  test('should add a new thread in an ensemble team', () => {
    const initialTeam = ensembleTeam();
    const teamModificator = new TeamModificator(() => 0);
    const { team, addedThreads } = teamModificator.addTo(initialTeam);
    expect(team).toEqual(ensembleTeam([thread({ id: 0 }), thread({ id: 1 })]));
    expect(addedThreads).toEqual([thread({ id: 1 })]);
  });

  test('should remove a thread from a parallel team', () => {
    const initialTeam = parallelTeam([thread({ id: 0 }), thread({ id: 1 })]);
    const teamModificator = new TeamModificator(() => 0);
    const { team, removedThreads } = teamModificator.removeFrom(initialTeam);
    expect(team).toEqual(parallelTeam([thread({ id: 0 })]));
    expect(removedThreads).toEqual([thread({ id: 1 })]);
  });

  test('should remove a thread from an ensemble team', () => {
    const initialTeam = ensembleTeam([thread({ id: 0 }), thread({ id: 1 })]);
    const teamModificator = new TeamModificator(() => 0);
    const { team, removedThreads } = teamModificator.removeFrom(initialTeam);
    expect(team).toEqual(ensembleTeam([thread({ id: 0 })]));
    expect(removedThreads).toEqual([thread({ id: 1 })]);
  });
});
