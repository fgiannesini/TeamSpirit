import { TimeEvent } from '../compute/events.ts';

const addThread = (threadNumber: number) => {
  const threadHtmlElement = document.createElement('div');
  threadHtmlElement.id = `thread${threadNumber}`;
  threadHtmlElement.className = 'thread';
  threadHtmlElement.textContent = `thread ${threadNumber}`;
  return threadHtmlElement;
};

export const addThreads = (parent: Element, events: TimeEvent[]) => {
  Array.from(new Set(events.map((event) => event.thread))).forEach(
    (threadNumber) => {
      const threadHtmlElement = addThread(threadNumber);
      parent.append(threadHtmlElement);
    },
  );
};
