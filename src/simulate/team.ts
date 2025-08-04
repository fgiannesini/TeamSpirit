const buildMob = (allActiveThreads: Thread[]): Thread[] => {
  const sum = allActiveThreads
    .map((thread) => thread.power)
    .reduce((acc, val) => acc + val, 0);
  const mean = Math.round(sum / allActiveThreads.length);
  return [
    { id: 0, name: 'mob', power: mean, inTime: 0, offTime: 0, off: false },
  ];
};

const updateThreadsTime = (threads: Thread[]) =>
  threads.map((thread) => {
    if (thread.off) {
      return {
        ...thread,
        offTime: thread.offTime + 1,
      };
    }
    return {
      ...thread,
      inTime: thread.inTime + 1,
    };
  });

export type Thread = {
  id: number;
  name: string;
  power: number;
  inTime: number;
  offTime: number;
  off: boolean;
};

export type Team = {
  getEffectiveThreads(): Thread[];
  getAllActiveThreads(): Thread[];
  getEffectiveActiveThreads(): Thread[];
  setIn(threadId: number): Team;
  setOff(threadId: number): Team;
  getReviewersNeeded(): number;
  updateTimes(): Team;
  getThreadsOff(): Thread[];
};

export class ParallelTeam implements Team {
  private readonly threads: Thread[] = [];
  private readonly reviewersNeeded: number;

  constructor(
    threads: Thread[],
    reviewersNeeded: number = Math.ceil(threads.length / 2),
  ) {
    this.threads = threads;
    this.reviewersNeeded = reviewersNeeded;
  }

  updateTimes(): Team {
    return new ParallelTeam(updateThreadsTime(this.threads));
  }

  getReviewersNeeded(): number {
    const effectiveThreadCount = this.getEffectiveActiveThreads().length;
    return this.reviewersNeeded >= effectiveThreadCount
      ? effectiveThreadCount - 1
      : this.reviewersNeeded;
  }

  setOff(threadId: number): Team {
    const index = this.threads.findIndex((thread) => thread.id === threadId);
    const newThread: Thread = { ...this.threads[index], off: true, inTime: 0 };
    const newThreads = this.threads.map((item, i) =>
      i === index ? newThread : item,
    );
    return new ParallelTeam(newThreads);
  }

  setIn(threadId: number): Team {
    const index = this.threads.findIndex((thread) => thread.id === threadId);
    const newThread: Thread = {
      ...this.threads[index],
      off: false,
      offTime: 0,
    };
    const newThreads = this.threads.map((item, i) =>
      i === index ? newThread : item,
    );
    return new ParallelTeam(newThreads);
  }

  getAllActiveThreads(): Thread[] {
    return this.threads.filter((thread) => !thread.off);
  }

  getEffectiveActiveThreads(): Thread[] {
    return this.getAllActiveThreads();
  }

  getEffectiveThreads(): Thread[] {
    return this.getEffectiveActiveThreads();
  }

  getThreadsOff(): Thread[] {
    return this.threads.filter((thread) => thread.off);
  }
}

export class EnsembleTeam implements Team {
  private readonly threads: Thread[];

  constructor(threads: Thread[]) {
    this.threads = threads;
  }

  getThreadsOff(): Thread[] {
    return this.threads.filter((thread) => thread.off);
  }

  getReviewersNeeded(): number {
    return 0;
  }

  setOff(threadId: number): Team {
    const index = this.threads.findIndex((thread) => thread.id === threadId);
    const newThread: Thread = { ...this.threads[index], off: true, inTime: 0 };
    const newThreads = this.threads.map((item, i) =>
      i === index ? newThread : item,
    );
    return new EnsembleTeam(newThreads);
  }

  setIn(threadId: number): Team {
    const index = this.threads.findIndex((thread) => thread.id === threadId);
    const newThread: Thread = {
      ...this.threads[index],
      off: false,
      offTime: 0,
    };
    const newThreads = this.threads.map((item, i) =>
      i === index ? newThread : item,
    );
    return new EnsembleTeam(newThreads);
  }

  getAllActiveThreads(): Thread[] {
    return this.threads.filter((thread) => !thread.off);
  }

  getEffectiveActiveThreads(): Thread[] {
    return buildMob(this.getAllActiveThreads());
  }

  getEffectiveThreads(): Thread[] {
    return buildMob(this.threads);
  }

  updateTimes(): Team {
    return new EnsembleTeam(updateThreadsTime(this.threads));
  }
}
