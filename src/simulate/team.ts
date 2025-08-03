const buildMob = (allActiveThreads: Thread[]): Thread[] => {
  const sum = allActiveThreads
    .map((thread) => thread.power)
    .reduce((acc, val) => acc + val, 0);
  const mean = Math.round(sum / allActiveThreads.length);
  return [{ id: 0, name: 'mob', power: mean, startedTime: 0, quit: false }];
};

export type Thread = {
  id: number;
  name: string;
  power: number;
  startedTime: number;
  quit: boolean;
};

export type Team = {
  getEffectiveThreads(): Thread[];
  getAllActiveThreads(): Thread[];
  getEffectiveActiveThreads(): Thread[];
  addThread(thread: Thread): Team;
  quit(threadId: number): Team;
  getCapacity(): number;
  getReviewersNeeded(): number;
};

export class ParallelTeam implements Team {
  private readonly threads: Thread[] = [];
  private readonly capacity: number;
  private readonly reviewersNeeded: number;

  constructor(
    threads: Thread[],
    capacity: number = threads.length,
    reviewersNeeded: number = Math.ceil(threads.length / 2),
  ) {
    this.threads = threads;
    this.capacity = capacity;
    this.reviewersNeeded = reviewersNeeded;
  }

  getReviewersNeeded(): number {
    const effectiveThreadCount = this.getEffectiveActiveThreads().length;
    return this.reviewersNeeded >= effectiveThreadCount
      ? effectiveThreadCount - 1
      : this.reviewersNeeded;
  }

  getCapacity(): number {
    return this.capacity;
  }

  quit(threadId: number): Team {
    const index = this.threads.findIndex((thread) => thread.id === threadId);
    const newThread = { ...this.threads[index], quit: true };
    const newThreads = this.threads.map((item, i) =>
      i === index ? newThread : item,
    );
    return new ParallelTeam(newThreads, this.capacity);
  }

  getAllActiveThreads(): Thread[] {
    return this.threads.filter((thread) => !thread.quit);
  }

  getEffectiveActiveThreads(): Thread[] {
    return this.getAllActiveThreads();
  }

  getEffectiveThreads(): Thread[] {
    return this.getEffectiveActiveThreads();
  }

  addThread(thread: Thread): Team {
    return new ParallelTeam([...this.threads, thread], this.capacity);
  }
}

export class EnsembleTeam implements Team {
  private readonly threads: Thread[];
  private readonly capacity: number;

  constructor(threads: Thread[], capacity: number = threads.length) {
    this.threads = threads;
    this.capacity = capacity;
  }

  getReviewersNeeded(): number {
    return 0;
  }

  getCapacity(): number {
    return this.capacity;
  }

  quit(threadId: number): Team {
    const index = this.threads.findIndex((thread) => thread.id === threadId);
    const newThread = { ...this.threads[index], quit: true };
    const newThreads = this.threads.map((item, i) =>
      i === index ? newThread : item,
    );
    return new EnsembleTeam(newThreads, this.capacity);
  }

  getAllActiveThreads(): Thread[] {
    return this.threads.filter((thread) => !thread.quit);
  }

  getEffectiveActiveThreads(): Thread[] {
    return buildMob(this.getAllActiveThreads());
  }

  getEffectiveThreads(): Thread[] {
    return buildMob(this.threads);
  }

  addThread(thread: Thread): Team {
    return new EnsembleTeam([...this.threads, thread], this.capacity);
  }
}
