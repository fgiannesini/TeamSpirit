import type { StructureEvent } from '../simulate/simulation-structure.ts';

export const createUserStory = (id: number, name: string) => {
  const userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = `user-story-${id}`;
  userStoryHtmlElement.className = 'userStory';
  userStoryHtmlElement.textContent = name;
  return userStoryHtmlElement;
};

export const createUserStoryInThread = (
  userStoryId: number,
  threadId: number,
  name: string,
) => {
  const userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = `user-story-${userStoryId}_${threadId}`;
  userStoryHtmlElement.className = 'userStory';
  userStoryHtmlElement.textContent = name;
  return userStoryHtmlElement;
};

export const addUserStories = (
  parent: Element,
  structureEvents: StructureEvent[],
) => {
  structureEvents
    .filter(({ action }) => action === 'CreateUserStory')
    .filter(({ id }) => id !== -1)
    .map(({ id, name }) => createUserStory(id, name))
    .forEach((userStoryElement) => {
      parent.appendChild(userStoryElement);
    });
};
