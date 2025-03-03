import { TimeEvent } from '../compute/events.ts';
import { getUserStory } from './selector.ts';

export const createUserStory = (userStoryName: string) => {
  const userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = userStoryName;
  userStoryHtmlElement.className = 'userStory';
  userStoryHtmlElement.textContent = userStoryName;
  return userStoryHtmlElement;
};

export const addUserStories = (parent: Element, events: TimeEvent[]) => {
  const userStoryNames = Array.from(
    new Set(events.map((event) => event.userStoryName))
  );
  userStoryNames
    .map((userStoryName) => createUserStory(userStoryName))
    .forEach((userStoryElement) => {
      parent.appendChild(userStoryElement);
    });
};

export const moveUserStoryToThread = (
  thread: Element,
  userStoryName: string
): void => {
  const userStory = getUserStory(userStoryName)!;
  thread.appendChild(userStory);
};

export const moveUserStoryOrdered = (
  parent: Element,
  userStoryName: string
): void => {
  parent.appendChild(getUserStory(userStoryName)!);
};
