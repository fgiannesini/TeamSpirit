import { idle, State, Task } from './task.ts';
import { Thread } from './team.ts';

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
  private readonly _tasks: Task[];
  private _dones: Task[] = [];
  constructor(tasks: Task[]) {
    this._tasks = tasks;
  }

  public static init = (): BacklogBuilder => new BacklogBuilder();

  next(thread: Thread): Task {
    let threadTaskIndex = this._tasks.findLastIndex(
      (task) => task.thread === thread.id
    );
    if (threadTaskIndex == -1) {
      threadTaskIndex = this._tasks.findLastIndex((task) => task.thread === -1);
    }
    if (threadTaskIndex != -1) {
      return this._tasks.splice(threadTaskIndex, 1)[0];
    }
    return idle;
  }

  add(task: Task) {
    if (task.state == State.DONE) {
      this._dones.push(task);
    } else {
      this._tasks.push(task);
    }
  }

  dones(): Task[] {
    return this._dones;
  }

  remainings(): Task[] {
    return this._tasks;
  }

  hasMoreTasks() {
    return this._tasks.length > 0;
  }
}
