import type { StructureEvent } from '../simulate/simulation-structure.ts';

export const createUserStory = (id: number, name: string): HTMLDivElement => {
  const userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = `user-story-${id}`;
  userStoryHtmlElement.className = 'userStory';
  userStoryHtmlElement.textContent = name;
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
};
