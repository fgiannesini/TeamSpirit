import { describe, expect, test } from 'vitest';
import { ensembleTeam, parallelTeam, thread } from './factory.ts';
import { ParallelTeam, type Team } from './team.ts';

class TeamModificator {
  constructor(private readonly creationRandomProvider: () => number) {}

  addTo(team: Team) {
    this.creationRandomProvider();
    const threadToAdd = thread({ id: 1 });
    return {
      team: team.addThread(threadToAdd),
      addedThreads: [threadToAdd],
    };
  }
}

describe('Team modificator', () => {
  test('should add a new thread in a parallel team', () => {
    const initialTeam = parallelTeam();
    const teamModificator = new TeamModificator(() => 0);
    const { team, addedThreads } = teamModificator.addTo(initialTeam);
    expect(team).toEqual(
      new ParallelTeam([thread({ id: 0 }), thread({ id: 1 })]),
    );
    expect(addedThreads).toEqual([thread({ id: 1 })]);
  });

  test('should add a new thread in an ensemble team', () => {
    const initialTeam = ensembleTeam();
    const teamModificator = new TeamModificator(() => 0);
    const { team, addedThreads } = teamModificator.addTo(initialTeam);
    expect(team).toEqual(ensembleTeam([thread({ id: 0 }), thread({ id: 1 })]));
    expect(addedThreads).toEqual([thread({ id: 1 })]);
  });
});
