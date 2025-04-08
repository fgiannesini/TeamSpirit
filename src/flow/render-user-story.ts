import type { TimeEvent } from '../simulate/events.ts';

export const createUserStory = (id: string) => {
  const userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = id;
  userStoryHtmlElement.className = 'userStory';
  userStoryHtmlElement.textContent = id;
  return userStoryHtmlElement;
};

export const addUserStories = (parent: Element, events: TimeEvent[]) => {
  const userStoryIds = Array.from(
    new Set(events.map((event) => event.userStoryId)),
  );
  userStoryIds
    .filter((userStoryId) => userStoryId !== 'idle')
    .map((userStoryId) => createUserStory(userStoryId))
    .forEach((userStoryElement) => {
      parent.appendChild(userStoryElement);
    });
};
