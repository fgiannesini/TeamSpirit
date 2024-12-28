import { TimeEvent } from './events.ts';
import { getUserStory } from './selector.ts';

const userStories: HTMLDivElement[] = [];
const userStoriesInAnimation: boolean[] = [];

const createUserStory = (userStoryName: string) => {
  let userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = userStoryName;
  userStoryHtmlElement.className = 'userStory';
  userStoryHtmlElement.textContent = userStoryName;
  return userStoryHtmlElement;
};

export const addUserStories = (parent: Element, events: TimeEvent[]) => {
  const top = parent.getBoundingClientRect().top;
  const userStoryNames = Array.from(
    new Set(events.map((event) => event.userStoryName))
  );
  userStoryNames
    .map((userStoryName) => createUserStory(userStoryName))
    .forEach((userStoryElement) => {
      userStoryElement.style.top = `${top}px`;
      userStoryElement.addEventListener('transitionend', (event) => {
        const index = userStories.findIndex(
          (element) => element == event.target
        );
        userStoriesInAnimation[index] = false;
      });
      parent.append(userStoryElement);
      userStories.push(userStoryElement);
      userStoriesInAnimation.push(false);
    });
};

export const moveUserStory = (parent: Element, userStoryName: string) => {
  const userStoryElement = getUserStory(userStoryName);
  const threadRect = parent.getBoundingClientRect();
  userStoryElement.style.top = `${threadRect.top}px`;
  userStoryElement.style.left = `${threadRect.right + 3}px`;
  userStoriesInAnimation[userStories.indexOf(userStoryElement)] = true;
};

export const moveUserStoryOrdered = (
  parent: Element,
  userStoryName: string,
  number: number
) => {
  const userStoryElement = getUserStory(userStoryName);
  const threadRect = parent.getBoundingClientRect();
  userStoryElement.style.top = `${threadRect.top}px`;
  userStoryElement.style.left = `${threadRect.left + 50 * (number - 1) + 3 * number}px`;
  userStoriesInAnimation[userStories.indexOf(userStoryElement)] = true;
};

export const waitForAnimations = async () => {
  while (!userStoriesInAnimation.every((isInAnimation) => !isInAnimation)) {
    await sleep(100);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
