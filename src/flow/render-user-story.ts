import { TimeEvent } from '../compute/events.ts';
import { getUserStory } from './selector.ts';

const _userStories: HTMLDivElement[] = [];
const _userStoriesInAnimation: boolean[] = [];

const createUserStory = (userStoryName: string) => {
  const userStoryHtmlElement = document.createElement('div');
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
        const index = _userStories.findIndex(
          (element) => element == event.target
        );
        _userStoriesInAnimation[index] = false;
      });
      parent.append(userStoryElement);
      _userStories.push(userStoryElement);
      _userStoriesInAnimation.push(false);
    });
};

export const moveUserStoryToThread = (
  thread: Element,
  userStoryName: string
): boolean => {
  const threadRect = thread.getBoundingClientRect();
  const newTop = `${threadRect.top}px`;
  const newLeft = `${threadRect.right + 3}px`;
  return moveTo(getUserStory(userStoryName), newTop, newLeft);
};

export const moveUserStoryOrdered = (
  parent: Element,
  userStoryName: string,
  number: number
): boolean => {
  const parentRect = parent.getBoundingClientRect();
  const newTop = `${parentRect.top}px`;
  const newLeft = `${parentRect.left + 50 * (number - 1) + 3 * number}px`;
  return moveTo(getUserStory(userStoryName), newTop, newLeft);
};

const moveTo = (
  userStoryElement: HTMLDivElement,
  newTop: string,
  newLeft: string
) => {
  if (
    newTop == userStoryElement.style.top &&
    newLeft == userStoryElement.style.left
  ) {
    return false;
  }
  userStoryElement.style.top = newTop;
  userStoryElement.style.left = newLeft;
  _userStoriesInAnimation[_userStories.indexOf(userStoryElement)] = true;
  return true;
};

export const waitForAnimations = async () => {
  while (!_userStoriesInAnimation.every((isInAnimation) => !isInAnimation)) {
    await sleep(100);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
