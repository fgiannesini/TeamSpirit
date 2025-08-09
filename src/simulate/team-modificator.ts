import type { Team, Thread } from './team.ts';

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
  setThreadsIn(
    team: Team,
    time: number,
  ): { team: Team; newThreadsIn: Pick<Thread, 'id' | 'name'>[] };

  setThreadsOff(
    team: Team,
    time: number,
  ): { team: Team; newThreadsOff: Pick<Thread, 'id' | 'name'>[] };
};

export class RandomTeamModificator implements TeamModificator {
  private readonly randomProvider: () => number;

  constructor(randomProvider: () => number) {
    this.randomProvider = randomProvider;
  }

  setThreadsIn(
    team: Team,
    _time: number,
  ): { team: Team; newThreadsIn: Pick<Thread, 'id' | 'name'>[] } {
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
      newThreadsIn: addedThreads,
    };
  }

  setThreadsOff(
    team: Team,
    _time: number,
  ): { team: Team; newThreadsOff: Pick<Thread, 'id' | 'name'>[] } {
    const allActiveThreads = team.getAllActiveThreads();
    if (allActiveThreads.length === 1) {
      return {
        team,
        newThreadsOff: [],
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
      newThreadsOff: removedThreads,
    };
  }
}

export const noTeamModificator: TeamModificator = {
  setThreadsIn(team: Team): {
    team: Team;
    newThreadsIn: Pick<Thread, 'id' | 'name'>[];
  } {
    return { newThreadsIn: [], team };
  },
  setThreadsOff(team: Team): {
    team: Team;
    newThreadsOff: Pick<Thread, 'id' | 'name'>[];
  } {
    return { newThreadsOff: [], team };
  },
};

export type TeamModificatorEvent = {
  in: number;
  out: number;
  threadId: number;
};

export class CustomTeamModificator implements TeamModificator {
  readonly events: TeamModificatorEvent[];
  constructor(events: TeamModificatorEvent[]) {
    this.events = events;
  }
  setThreadsIn(
    originalTeam: Team,
    time: number,
  ): { team: Team; newThreadsIn: Pick<Thread, 'id' | 'name'>[] } {
    let team = originalTeam;
    const newThreadsIn: Pick<Thread, 'id' | 'name'>[] = [];
    for (const event of this.events) {
      if (event.in === time) {
        const thread = team
          .getThreadsOff()
          .find(({ id }) => id === event.threadId);
        if (thread !== undefined) {
          team = team.setIn(thread.id);
          newThreadsIn.push({ id: thread.id, name: thread.name });
        }
      }
    }

    return { newThreadsIn, team };
  }

  setThreadsOff(
    originalTeam: Team,
    time: number,
  ): { team: Team; newThreadsOff: Pick<Thread, 'id' | 'name'>[] } {
    let team = originalTeam;
    const newThreadsOff: Pick<Thread, 'id' | 'name'>[] = [];
    for (const event of this.events) {
      if (event.out === time) {
        const thread = team
          .getAllActiveThreads()
          .find(({ id }) => id === event.threadId);
        if (thread !== undefined) {
          team = team.setOff(thread.id);
          newThreadsOff.push({ id: thread.id, name: thread.name });
        }
      }
    }

    return { newThreadsOff, team };
  }
}
