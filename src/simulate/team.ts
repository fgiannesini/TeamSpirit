export interface Thread {
  id: number;
  name: string;
  power: number;
}

export interface Team {
  getThreads(): Thread[];
}

export class ParallelTeam implements Team {
  private readonly threads: Thread[] = [];

  constructor(threads: Thread[]) {
    this.threads = threads;
  }

  getThreads(): Thread[] {
    return this.threads;
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
    return [{ id: 1, name: 'mob', power: mean }];
  }
}
