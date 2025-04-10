import type { StructureEvent } from '../simulate/simulation-structure.ts';

export const createUserStory = (id: number) => {
  const userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = `user-story-${id}`;
  userStoryHtmlElement.className = 'userStory';
  userStoryHtmlElement.textContent = `userStory${id}`;
  return userStoryHtmlElement;
};

export const createUserStoryInThread = (
  userStoryId: number,
  threadId: number,
) => {
  const userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = `user-story-${userStoryId}_${threadId}`;
  userStoryHtmlElement.className = 'userStory';
  userStoryHtmlElement.textContent = `userStory${userStoryId}`;
  return userStoryHtmlElement;
};

export const addUserStories = (
  parent: Element,
  structureEvents: StructureEvent[],
) => {
  const userStoryIds = structureEvents
    .filter(({ action }) => action === 'CreateUserStory')
    .map(({ id }) => id);
  userStoryIds
    .filter((userStoryId) => userStoryId !== -1)
    .map((userStoryId) => createUserStory(userStoryId))
    .forEach((userStoryElement) => {
      parent.appendChild(userStoryElement);
    });
};
