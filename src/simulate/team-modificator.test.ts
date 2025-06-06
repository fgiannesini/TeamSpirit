import { describe, expect, test } from 'vitest';
import { parallelTeam, thread } from './factory.ts';
import { ParallelTeam } from './team.ts';

class TeamModificator {
  constructor(private readonly creationRandomProvider: () => number) {}

  addTo(parallelTeam: ParallelTeam) {
    this.creationRandomProvider();
    const threadToAdd = thread({ id: 1 });
    return {
      team: parallelTeam.addThread(threadToAdd),
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
});
