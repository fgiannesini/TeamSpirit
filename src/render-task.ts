import { TimeEvent } from './events.ts';

const tasks: HTMLDivElement[] = [];
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
    });
};
