import type {TimeEvent} from '../simulate/events.ts';

const addThread = (threadNumber: number) => {
  const threadHtmlElement = document.createElement('div');
  threadHtmlElement.id = `thread${threadNumber}`;
  threadHtmlElement.className = 'thread';

  const threadTitle = document.createElement('div');
  threadTitle.id = `thread-title-${threadNumber}`;
  threadTitle.textContent = `Thread ${threadNumber}`;

  const threadContent = document.createElement('div');
  threadContent.id = `thread-user-story-${threadNumber}`;

  const threadState = document.createElement('div');
  threadState.id = `thread-state-${threadNumber}`;
  threadState.textContent = `Wait`;

  threadHtmlElement.append(threadTitle, threadContent, threadState);
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
