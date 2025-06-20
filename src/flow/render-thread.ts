import type { StructureEvent } from '../simulate/simulation-structure.ts';

const addThread = (threadNumber: number, name: string): HTMLDivElement => {
  const threadHtmlElement = document.createElement('div');
  threadHtmlElement.id = `thread${threadNumber}`;
  threadHtmlElement.className = 'thread';

  const threadTitle = document.createElement('div');
  threadTitle.id = `thread-title-${threadNumber}`;
  threadTitle.textContent = name;

  const threadContent = document.createElement('div');
  threadContent.id = `thread-user-story-${threadNumber}`;

  const threadState = document.createElement('div');
  threadState.id = `thread-state-${threadNumber}`;
  threadState.textContent = 'Wait';

  threadHtmlElement.append(threadTitle, threadContent, threadState);
  return threadHtmlElement;
};

export const addThreads = (
  parent: Element,
  structureEvents: StructureEvent[],
): void => {
  structureEvents
    .filter((event) => event.action === 'CreateThread')
    .forEach((event) => {
      const threadHtmlElement = addThread(event.id, event.name);
      parent.append(threadHtmlElement);
    });
};
