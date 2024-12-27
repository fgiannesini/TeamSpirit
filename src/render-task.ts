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
      taskElement.addEventListener('transitionend', (event) => {
        const index = tasks.findIndex((element) => element == event.target);
        tasksInAnimation[index] = false;
      });
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
  tasksInAnimation[tasks.indexOf(taskElement)] = true;
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
  tasksInAnimation[tasks.indexOf(taskElement)] = true;
};

export const waitForAnimations = async () => {
  while (!tasksInAnimation.every((isInAnimation) => !isInAnimation)) {
    await sleep(100);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
