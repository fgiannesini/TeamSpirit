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
  private _dones : Task[] = [];
  constructor(tasks: Task[]) {
    this._tasks = tasks;
  }

  public static init = (): BacklogBuilder => new BacklogBuilder();

  next(): Task {
    return this._tasks.pop() ?? idle;
  }

  add(task: Task) {
    if(task.state == State.DONE) {
      this._dones.push(task);
    } else {
      this._tasks.push(task);  
    }
  }

  dones(): Task[] {
    return this._dones;
  }

  remainings() {
    return this._tasks;
  }
}
