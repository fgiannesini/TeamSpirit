export interface Thread {
  id: number;
  power: number;
}

export class Team {
  private readonly _devs: Thread[] = [];

  constructor(devs: Thread[]) {
    this._devs = devs;
  }

  getThreads(): Thread[] {
    return this._devs;
  }
}
