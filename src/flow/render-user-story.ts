import type { StructureEvent } from '../simulate/simulation-structure.ts';
import { getUserStory } from './selector.ts';

export const createUserStory = (id: number, name: string): HTMLDivElement => {
  const nameSpan = document.createElement('span');
  nameSpan.textContent = name;
  nameSpan.className = 'name';
  const userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = `user-story-${id}`;
  userStoryHtmlElement.className = 'userStory';
  userStoryHtmlElement.appendChild(nameSpan);
  return userStoryHtmlElement;
};

export const addUserStories = (
  parent: Element,
  structureEvents: StructureEvent[],
): void => {
  structureEvents
    .filter(
      (
        event,
      ): event is Extract<StructureEvent, { action: 'CreateUserStory' }> =>
        event.action === 'CreateUserStory',
    )
    .filter(({ id }) => id !== -1)
    .map(({ id, name }) => createUserStory(id, name))
    .forEach((userStoryElement) => {
      parent.appendChild(userStoryElement);
    });

  structureEvents
    .filter(
      (event): event is Extract<StructureEvent, { action: 'ChangePriority' }> =>
        event.action === 'ChangePriority',
    )
    .forEach(({ id, value }) => {
      const userStory = getUserStory(id);
      if (userStory) {
        userStory.querySelector('.priority')?.remove();
        const prioritySpan = document.createElement('span');
        prioritySpan.textContent = `(${value})`;
        prioritySpan.className = 'priority';
        userStory.appendChild(prioritySpan);
      }
    });
};
