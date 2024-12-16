import { idle, State, Task } from './task.ts';

class BacklogBuilder {
  private tasks: Task[] = [];

  public addTask = (task: Task): BacklogBuilder => {
    this.tasks.push(task);
    return this;
  };

  public build(): Backlog {
    return new Backlog(this.tasks);
  }
}

export class Backlog {
  private _tasks: Task[];
  constructor(tasks: Task[]) {
    this._tasks = tasks;
  }

  public static init = (): BacklogBuilder => new BacklogBuilder();

  next(state: State): Task {
    for (let i = this._tasks.length - 1; i >= 0; i--) {
      if (this._tasks[i].state === state) {
        return this._tasks.splice(i, 1)[0];
      }
    }
    return idle;
  }

  setOnTop(task: Task) {
    this._tasks.push(task);
  }
}
