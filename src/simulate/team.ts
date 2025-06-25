export type Thread = {
  id: number;
  name: string;
  power: number;
  startedTime: number;
  quit: boolean;
};

export type Team = {
  getEffectiveThreads(): Thread[];
  getRealThreads(): Thread[];
  addThread(thread: Thread): Team;
  quit(threadId: number): Team;
  getCapacity(): number;
};

export class ParallelTeam implements Team {
  private readonly threads: Thread[] = [];
  private readonly capacity: number;

  constructor(threads: Thread[], capacity: number = threads.length) {
    this.threads = threads;
    this.capacity = capacity;
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

  getRealThreads(): Thread[] {
    return this.threads;
  }

  getEffectiveThreads(): Thread[] {
    return this.threads;
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

  getRealThreads(): Thread[] {
    return this.threads;
  }

  getEffectiveThreads(): Thread[] {
    const sum = this.threads
      .map((thread) => thread.power)
      .reduce((acc, val) => acc + val, 0);
    const mean = Math.round(sum / this.threads.length);
    return [{ id: 0, name: 'mob', power: mean, startedTime: 0, quit: false }];
  }

  addThread(thread: Thread): Team {
    return new EnsembleTeam([...this.threads, thread], this.capacity);
  }
}
