import { describe, expect, test } from 'vitest';
import { ensembleTeam, parallelTeam, thread } from './factory.ts';
import type { Team, Thread } from './team.ts';

class TeamModificator {
  private readonly randomProvider: () => number;
  constructor(randomProvider: () => number) {
    this.randomProvider = randomProvider;
  }

  addTo(team: Team): { team: Team; addedThreads: Thread[] } {
    this.randomProvider();
    const threadToAdd = thread({ id: 1 });
    return {
      team: team.addThread(threadToAdd),
      addedThreads: [threadToAdd],
    };
  }

  removeFrom(team: Team): { team: Team; removedThreads: Thread[] } {
    const removedThread = team.getRealThreads()[1];
    return {
      team: team.removeThread(1),
      removedThreads: [removedThread],
    };
  }
}

type TeamProbabilities = {
  memberRemovalProbs: Map<string, number>; // Probability per member
  teamCreateProb: number; // Team-wide addition chance
};

function computeTeamProbabilities(
  team: TeamMember[],
  time: number,
  maxCapacity: number,
  config = {
    baseRemoveRate: 0.1, // Base chance of leaving (lowest experience member)
    baseCreateRate: 0.2, // Base chance of adding a member
    timeDecayFactor: 0.5, // How much time reduces removal rate
    experienceWeight: 2.0, // How strongly experience reduces removal
  },
): TeamProbabilities {
  const currentSize = team.length;
  const memberRemovalProbs = new Map<string, number>();

  // ---- 1. Compute per-member removal probabilities ----
  let totalExperience = 0;
  team.forEach((member) => {
    totalExperience += member.experience;
    // Higher experience = lower removal chance (scaled exponentially)
    const experienceFactor = Math.exp(
      -config.experienceWeight * member.experience,
    );
    const timeFactor = 1 / Math.log(time + 2) ** config.timeDecayFactor;
    const pRemove = config.baseRemoveRate * experienceFactor * timeFactor;
    memberRemovalProbs.set(member.id, pRemove);
  });

  // ---- 2. Compute team-wide creation probability ----
  let teamCreateProb = 0;
  if (currentSize < maxCapacity) {
    const avgExperience = totalExperience / currentSize || 1;
    const capacityFactor = 1 - currentSize / maxCapacity;
    // More experienced teams hire slower (optional)
    const experiencePenalty = 1 / avgExperience ** 0.5;
    teamCreateProb =
      (config.baseCreateRate * capacityFactor * experiencePenalty) /
      Math.sqrt(time + 1);
  }

  return { memberRemovalProbs, teamCreateProb };
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
