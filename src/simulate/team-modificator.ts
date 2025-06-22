import { createThread } from './factory.ts';
import type { Team, Thread } from './team.ts';

type DepartureProbabilities = Record<number, number>;

export const computeThreadsRemovalProbabilities = (
  threads: Thread[],
  time: number,
): DepartureProbabilities => {
  const maxTime = 30;
  const maxProb = 0.5;
  const probabilities: DepartureProbabilities = {};
  for (const thread of threads) {
    const timeFactor = Math.min(1, ((time - thread.startedTime) / maxTime) ** 2.2); // entre 0 et 1
    const experienceFactor = (6 - thread.power) / 5; // entre 0.2 et 1
    probabilities[thread.id] = Math.min(
      maxProb,
      timeFactor * experienceFactor * maxProb,
    );
  }

  return probabilities;
};

export class TeamModificator {
  private readonly randomProvider: () => number;
  constructor(randomProvider: () => number) {
    this.randomProvider = randomProvider;
  }

  addTo(team: Team): { team: Team; addedThreads: Thread[] } {
    this.randomProvider();
    const threadToAdd = createThread({ id: 1 });
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
