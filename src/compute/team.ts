export interface Thread {
  id: number;
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
