import { TimeEvent } from './events.ts';

export const querySelector = <T extends Element>(selector: string): T => {
  let element = document.querySelector<T>(selector);
  if (!element)
    throw new Error(`element avec sélecteur ${selector} non trouvé`);
  return element;
};

const addThreads = (events: TimeEvent[]) => {
  let threadsContainer = querySelector<HTMLDivElement>('#threads');
  const threads = Array.from(new Set(events.map((event) => event.thread)));
  for (let threadNumber of threads) {
    let threadHtmlElement = document.createElement('div');
    threadHtmlElement.id = `thread${threadNumber}`;
    threadHtmlElement.className = 'thread';
    threadHtmlElement.textContent = `thread ${threadNumber}`;
    threadsContainer.append(threadHtmlElement);
  }
};

const addTasks = (events: TimeEvent[]) => {
  let backlogContainer = querySelector<HTMLDivElement>('#backlog');
  const taskNames = events.map((event) => event.taskName);
  for (let taskName of taskNames) {
    let taskHtmlElement = document.createElement('div');
    taskHtmlElement.id = taskName;
    taskHtmlElement.className = 'task';
    taskHtmlElement.textContent = taskName;
    backlogContainer.append(taskHtmlElement);
  }

  setTimeout(() => {
    document.querySelectorAll('.task').forEach((task, index) => {
      let htmlElement = task as HTMLElement;
      return (htmlElement.style.left = 6 * index + 'rem');
    });
  });
};

export const render = (events: TimeEvent[]) => {
  let body = querySelector('body');
  body.innerHTML = `
<h3>Team Spirit</h3>
<div id="backlog" class="backlog"></div>
<div id="threads" class="threads"></div>
`;
  addThreads(events);
  addTasks(events);
};
