const buildMob = (allActiveThreads: Thread[]): Thread[] => {
  const sum = allActiveThreads
    .map((thread) => thread.power)
    .reduce((acc, val) => acc + val, 0);
  const mean = Math.round(sum / allActiveThreads.length);
  return [
    { id: 0, name: 'mob', power: mean, inTime: 0, offTime: 0, off: false },
  ];
};

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
  addThread(thread: Thread): Team;
  setOff(threadId: number): Team;
  getReviewersNeeded(): number;
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

  getAllActiveThreads(): Thread[] {
    return this.threads.filter((thread) => !thread.off);
  }

  getEffectiveActiveThreads(): Thread[] {
    return this.getAllActiveThreads();
  }

  getEffectiveThreads(): Thread[] {
    return this.getEffectiveActiveThreads();
  }

  addThread(thread: Thread): Team {
    return new ParallelTeam([...this.threads, thread]);
  }
}

export class EnsembleTeam implements Team {
  private readonly threads: Thread[];

  constructor(threads: Thread[]) {
    this.threads = threads;
  }

  getReviewersNeeded(): number {
    return 0;
  }

  setOff(threadId: number): Team {
    const index = this.threads.findIndex((thread) => thread.id === threadId);
    const newThread: Thread = { ...this.threads[index], off: true };
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

  addThread(thread: Thread): Team {
    return new EnsembleTeam([...this.threads, thread]);
  }
}
