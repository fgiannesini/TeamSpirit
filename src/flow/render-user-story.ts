import { TimeEvent } from '../simulate/events.ts';

export const createUserStory = (id: string) => {
  const userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = id;
  userStoryHtmlElement.className = 'userStory';
  userStoryHtmlElement.textContent = id;
  return userStoryHtmlElement;
};

export const addUserStories = (parent: Element, events: TimeEvent[]) => {
  const userStoryNames = Array.from(
    new Set(events.map((event) => event.userStoryName)),
  );
  userStoryNames
    .filter((userStoryName) => userStoryName !== 'idle')
    .map((userStoryName) => createUserStory(userStoryName))
    .forEach((userStoryElement) => {
      parent.appendChild(userStoryElement);
    });
};
