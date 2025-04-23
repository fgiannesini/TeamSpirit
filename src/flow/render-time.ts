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

const setThreadStateTo = (threadIndex: number, textContent: string) => {
  const threadState = getThreadState(threadIndex);
  if (threadState) {
    threadState.textContent = textContent;
  }
};

export const renderTimeEvents = async (
  events: TimeEvent[],
  time: number,
  animationTime: number,
) => {
  const currentEvents = events.filter((event) => event.time === time);
  for (const currentEvent of currentEvents) {
    if (currentEvent.userStoryId === -1) {
      Array.from(
        getThreadUserStoryContainer(currentEvent.threadId)?.children ?? [],
      ).forEach((child) => child.remove());
      setThreadStateTo(currentEvent.threadId, 'Wait');
      continue;
    }
    switch (currentEvent.state) {
      case 'InProgress': {
        const userStory = getUserStory(currentEvent.userStoryId);
        if (userStory) {
          getThreadUserStoryContainer(currentEvent.threadId)?.appendChild(
            userStory,
          );
          userStory.id = `user-story-${currentEvent.userStoryId}-${currentEvent.threadId}`;
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
        const userStory = getUserStoryOfThread(
          currentEvent.userStoryId,
          currentEvent.threadId,
        );
        if (userStory) {
          getBacklog()?.appendChild(userStory);
          userStory.id = `user-story-${currentEvent.userStoryId}`;
        }
        break;
      }
      case 'Done': {
        const allUserStories = getAllUserStories(currentEvent.userStoryId);
        const userStory = allUserStories.shift();
        if (userStory) {
          getDone()?.appendChild(userStory);
          userStory.id = `user-story-${currentEvent.userStoryId}`;
        }
        allUserStories.forEach((userStory) => userStory.remove());
        break;
      }
      default:
        break;
    }
    await sleep(animationTime);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
