import { TimeEvent } from './events.ts';
import { getTask } from './selector.ts';

const tasks: HTMLDivElement[] = [];
const tasksInAnimation: boolean[] = [];

const createTask = (taskName: string) => {
  let taskHtmlElement = document.createElement('div');
  taskHtmlElement.id = taskName;
  taskHtmlElement.className = 'task';
  taskHtmlElement.textContent = taskName;
  return taskHtmlElement;
};

export const addTasks = (parent: Element, events: TimeEvent[]) => {
  const top = parent.getBoundingClientRect().top;
  const taskNames = Array.from(new Set(events.map((event) => event.taskName)));
  taskNames
    .map((taskName) => createTask(taskName))
    .forEach((taskElement) => {
      taskElement.style.top = `${top}px`;
      parent.append(taskElement);
      tasks.push(taskElement);
      tasksInAnimation.push(false);
    });
};

export const moveTask = (parent: Element, taskName: string) => {
  const taskElement = getTask(taskName);
  const threadRect = parent.getBoundingClientRect();
  taskElement.style.top = `${threadRect.top}px`;
  taskElement.style.left = `${threadRect.right + 3}px`;
};

export const moveTaskOrdered = (
  parent: Element,
  taskName: string,
  number: number
) => {
  const taskElement = getTask(taskName);
  const threadRect = parent.getBoundingClientRect();
  taskElement.style.top = `${threadRect.top}px`;
  taskElement.style.left = `${threadRect.left + 50 * (number - 1) + 3 * number}px`;
};
