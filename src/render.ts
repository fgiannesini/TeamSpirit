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

export const render = (events: TimeEvent[]) => {
  let body = querySelector('body');
  body.innerHTML = `
<h3>Team Spirit</h3>
<div id="backlog" class="backlog"></div>
<div id="threads" class="threads"></div>
`;
  addThreads(events);

  let backlogContainer = document.querySelector<HTMLDivElement>('#backlog');
  if (!backlogContainer) throw new Error('div avec id #backlog non trouvé');
  const backlog = events.map((event) => event.taskName);
  for (let i = 0; i < backlog.length; i++) {
    let taskName = backlog[i];
    let taskHtmlElement = document.createElement('div');
    taskHtmlElement.id = taskName;
    taskHtmlElement.className = 'task';
    taskHtmlElement.textContent = taskName;
    backlogContainer.append(taskHtmlElement);
  }

  setTimeout(() => {
    document
      .querySelectorAll('.task')
      .forEach(
        (task, index) => ((task as HTMLElement).style.left = 6 * index + 'rem')
      );
  });
};
