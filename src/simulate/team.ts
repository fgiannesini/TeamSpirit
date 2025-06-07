export type Thread = {
  id: number;
  name: string;
  power: number;
};

export type Team = {
  getThreads(): Thread[];
  addThread(thread: Thread): Team;
};

export class ParallelTeam implements Team {
  private readonly threads: Thread[] = [];

  constructor(threads: Thread[]) {
    this.threads = threads;
  }

  getThreads(): Thread[] {
    return this.threads;
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

  getThreads(): Thread[] {
    const sum = this.threads
      .map((thread) => thread.power)
      .reduce((acc, val) => acc + val, 0);
    const mean = Math.round(sum / this.threads.length);
    return [{ id: 0, name: 'mob', power: mean }];
  }

  addThread(thread: Thread): Team {
    return new EnsembleTeam([...this.threads, thread]);
  }
}
