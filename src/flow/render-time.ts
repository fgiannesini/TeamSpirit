import type { TimeEvent } from '../simulate/events.ts';
import {
  getAllUserStories,
  getBacklog,
  getDone,
  getThreadState,
  getThreadUserStoryContainer,
  getUserStory,
  getUserStoryOfThread,
} from './selector.ts';

const setThreadStateTo = (threadIndex: number, textContent: string): void => {
  const threadState = getThreadState(threadIndex);
  if (threadState) {
    threadState.textContent = textContent;
  }
};

const removeCurrentTaskOfThread = (currentEvent: TimeEvent): void => {
  Array.from(
    getThreadUserStoryContainer(currentEvent.threadId)?.children ?? [],
  ).forEach((child) => {
    child.remove();
  });
};

const sleep = (ms: number): Promise<unknown> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const renderTimeEvents = async (
  events: TimeEvent[],
  time: number,
  animationTime: number,
): Promise<void> => {
  const currentEvents = events.filter((event) => event.time === time);
  for (const currentEvent of currentEvents) {
    if (currentEvent.userStoryId === -1) {
      removeCurrentTaskOfThread(currentEvent);
      setThreadStateTo(currentEvent.threadId, 'Wait');
      continue;
    }
    switch (currentEvent.state) {
      case 'InProgress': {
        const id = `user-story-${currentEvent.userStoryId}-${currentEvent.threadId}`;
        Array.from(
          getThreadUserStoryContainer(currentEvent.threadId)?.children ?? [],
        )
          .filter((child) => child.id !== id)
          .forEach((child) => {
            child.remove();
          });
        const userStory = getUserStory(currentEvent.userStoryId);
        if (userStory) {
          getThreadUserStoryContainer(currentEvent.threadId)?.appendChild(
            userStory,
          );
          userStory.id = id;
        }
        setThreadStateTo(currentEvent.threadId, 'Develop');
        break;
      }
      case 'Review': {
        if (
          getUserStoryOfThread(currentEvent.userStoryId, currentEvent.threadId)
        ) {
          continue;
        }
        removeCurrentTaskOfThread(currentEvent);
        const newUserStory = getUserStory(currentEvent.userStoryId)?.cloneNode(
          true,
        ) as HTMLElement;
        const newId = `user-story-${currentEvent.userStoryId}-${currentEvent.threadId}`;
        if (newUserStory) {
          newUserStory.id = newId;
          const threadUserStoryContainer = getThreadUserStoryContainer(
            currentEvent.threadId,
          );
          threadUserStoryContainer?.appendChild(newUserStory);
        }
        document
          .querySelector<HTMLDivElement>(
            `#backlog #user-story-${currentEvent.userStoryId}`,
          )
          ?.remove();
        setThreadStateTo(currentEvent.threadId, 'Review');
        break;
      }
      case 'ToReview': {
        const allUserStories = getAllUserStories(currentEvent.userStoryId);
        const userStory = allUserStories.shift();
        if (userStory) {
          getBacklog()?.appendChild(userStory);
          userStory.id = `user-story-${currentEvent.userStoryId}`;
        }
        allUserStories.forEach((userStoryToRemove) => {
          userStoryToRemove.remove();
        });
        break;
      }
      case 'Done': {
        const allUserStories = getAllUserStories(currentEvent.userStoryId);
        const userStory = allUserStories.shift();
        if (userStory) {
          getDone()?.appendChild(userStory);
          userStory.id = `user-story-${currentEvent.userStoryId}`;
        }
        allUserStories.forEach((userStoryToRemove) => {
          userStoryToRemove.remove();
        });
        break;
      }
      default:
        break;
    }
    await sleep(animationTime);
  }
};
