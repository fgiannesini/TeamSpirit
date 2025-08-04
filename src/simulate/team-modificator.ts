import type {Team, Thread} from './team.ts';

type ThreadMoveProbabilities = Record<number, number>;

export const computeThreadsOffProbabilities = (
  threads: Thread[],
): ThreadMoveProbabilities => {
  const maxTime = 30;
  const maxProb = 0.5;
  const probabilities: ThreadMoveProbabilities = {};
  for (const thread of threads) {
    const timeFactor = Math.min(1, (thread.inTime / maxTime) ** 2.2); // entre 0 et 1
    const experienceFactor = (6 - thread.power) / 5; // entre 0.2 et 1
    probabilities[thread.id] = Math.min(
      maxProb,
      timeFactor * experienceFactor * maxProb,
    );
  }

  return probabilities;
};

export const computeThreadsInProbabilities = (
  threads: Thread[],
): ThreadMoveProbabilities => {
  const probabilities: ThreadMoveProbabilities = {};
  for (const thread of threads) {
    if (thread.offTime <= 4) {
      probabilities[thread.id] = 0.3 + (0.2 * thread.offTime) / 4;
      continue;
    }
    if (thread.offTime <= 10) {
      probabilities[thread.id] = 0.2;
      continue;
    }
    const max = 1.0;
    const value = 0.2 + (1 - Math.exp(-0.3 * (thread.offTime - 10)));
    probabilities[thread.id] = Math.min(value, max);
  }
  return probabilities;
};

export type TeamModificator = {
  addTo(team: Team): {
    team: Team;
    addedThreads: Pick<Thread, 'id' | 'name'>[];
  };

  removeFrom(team: Team): {
    team: Team;
    removedThreads: Pick<Thread, 'id' | 'name'>[];
  };
};

export class TeamModificatorHandler implements TeamModificator {
  private readonly randomProvider: () => number;
  constructor(randomProvider: () => number) {
    this.randomProvider = randomProvider;
  }

  addTo(team: Team): {
    team: Team;
    addedThreads: Pick<Thread, 'id' | 'name'>[];
  } {
    let newTeam = team;
    const offThreads = team.getThreadsOff();
    const addedThreads: Pick<Thread, 'id' | 'name'>[] = [];
    const probabilities = computeThreadsInProbabilities(offThreads);
    offThreads.forEach((thread) => {
      if (this.randomProvider() < probabilities[thread.id]) {
        addedThreads.push({
          id: thread.id,
          name: thread.name,
        });
        newTeam = team.setIn(thread.id);
      }
    });
    return {
      team: newTeam,
      addedThreads,
    };
  }

  removeFrom(team: Team): {
    team: Team;
    removedThreads: Pick<Thread, 'id' | 'name'>[];
  } {
    const allActiveThreads = team.getAllActiveThreads();
    if (allActiveThreads.length === 1) {
      return {
        team,
        removedThreads: [],
      };
    }
    let newTeam = team;
    const removedThreads: Pick<Thread, 'id' | 'name'>[] = [];
    const probabilities = computeThreadsOffProbabilities(allActiveThreads);
    allActiveThreads.forEach((thread) => {
      if (this.randomProvider() < probabilities[thread.id]) {
        removedThreads.push({
          id: thread.id,
          name: thread.name,
        });
        newTeam = team.setOff(thread.id);
      }
    });
    return {
      team: newTeam,
      removedThreads,
    };
  }
}
