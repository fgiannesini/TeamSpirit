import { thread } from './factory.ts';
import type { Team, Thread } from './team.ts';

const _computeTeamProbabilities = (
  threads: Thread[],
  time: number,
  maxCapacity: number,
  config = {
    baseRemoveRate: 0.1, // Base chance of leaving (lowest experience member)
    baseCreateRate: 0.2, // Base chance of adding a member
    timeDecayFactor: 0.5, // How much time reduces removal rate
    experienceWeight: 2.0, // How strongly experience reduces removal
  },
): TeamProbabilities => {
  const currentSize = threads.length;
  const memberRemovalProbabilities = new Map<number, number>();

  // ---- 1. Compute per-member removal probabilities ----
  let totalExperience = 0;
  threads.forEach((thread) => {
    totalExperience += thread.power;
    // Higher experience = lower removal chance (scaled exponentially)
    const experienceFactor = Math.exp(-config.experienceWeight * thread.power);
    const timeFactor = 1 / Math.log(time + 2) ** config.timeDecayFactor;
    const pRemove = config.baseRemoveRate * experienceFactor * timeFactor;
    memberRemovalProbabilities.set(thread.id, pRemove);
  });

  // ---- 2. Compute team-wide creation probability ----
  let teamCreateProbability = 0;
  if (currentSize < maxCapacity) {
    const avgExperience = totalExperience / currentSize || 1;
    const capacityFactor = 1 - currentSize / maxCapacity;
    // More experienced teams hire slower (optional)
    const experiencePenalty = 1 / avgExperience ** 0.5;
    teamCreateProbability =
      (config.baseCreateRate * capacityFactor * experiencePenalty) /
      Math.sqrt(time + 1);
  }

  return { memberRemovalProbabilities, teamCreateProbability };
};

export class TeamModificator {
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

export type TeamProbabilities = {
  memberRemovalProbabilities: Map<number, number>; // Probability per member
  teamCreateProbability: number; // Team-wide addition chance
};
