import { TimeEvent } from './events.ts';

export const render = (document: Document, events: TimeEvent[]) => {
  let threadsContainer = document.querySelector<HTMLDivElement>('#threads');
  if (!threadsContainer) throw new Error('div avec id #threads non trouvé');

  const threads = Array.from(new Set(events.map((event) => event.thread)));
  for (let threadNumber of threads) {
    let threadHtmlElement = document.createElement('div');
    threadHtmlElement.id = `thread${threadNumber}`;
    threadHtmlElement.className = 'thread';
    threadHtmlElement.textContent = `thread ${threadNumber}`;
    threadsContainer.append(threadHtmlElement);
  }

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
