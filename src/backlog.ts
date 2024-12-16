import { Task } from './task.ts';

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
  constructor(tasks: Task[]) {}

  public static init = (): BacklogBuilder => new BacklogBuilder();
}
