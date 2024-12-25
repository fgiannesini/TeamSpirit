import { TimeEvent } from './events.ts';
import { State } from './task.ts';

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
  const top = backlogContainer.getBoundingClientRect().top;
  const taskNames = events.map((event) => event.taskName);
  for (let taskName of taskNames) {
    let taskHtmlElement = document.createElement('div');
    taskHtmlElement.id = taskName;
    taskHtmlElement.className = 'task';
    taskHtmlElement.textContent = taskName;
    taskHtmlElement.style.top = `${top}px`;
    backlogContainer.append(taskHtmlElement);
  }

  setTimeout(() => {
    document.querySelectorAll('.task').forEach((task, index) => {
      let htmlElement = task as HTMLElement;
      return (htmlElement.style.left = 50 * index + 'px');
    });
  });
};

export const render = (events: TimeEvent[]) => {
  let body = querySelector('body');
  body.innerHTML = `
<h3>Team Spirit</h3>
<button id="compute">Compute</button>
<div id="backlog" class="backlog"></div>
<div id="threads" class="threads"></div>
<div id="done" class="done"></div>
`;
  addThreads(events);
  addTasks(events);
  let time = 0;
  let htmlButtonElement = querySelector<HTMLButtonElement>('#compute');
  htmlButtonElement.addEventListener('click', () => {
    time++;
    let currentEvents = events.filter((event) => event.time == time);
    let done = 0;
    for (const currentEvent of currentEvents) {
      let taskElement = querySelector<HTMLElement>(`#${currentEvent.taskName}`);
      if (currentEvent.newState == State.IN_PROGRESS) {
        const threadRect = querySelector<HTMLElement>(
          `#thread${currentEvent.thread}`
        ).getBoundingClientRect();
        taskElement.style.top = `${threadRect.top}px`;
        taskElement.style.left = `${threadRect.right + 3}px`;
      } else {
        done++;
        let threadRect =
          querySelector<HTMLElement>(`#done`).getBoundingClientRect();
        taskElement.style.top = `${threadRect.top}px`;
        taskElement.style.left = `${threadRect.left + 50 * (done - 1) + 3 * done}px`;
      }
    }
  });
};
