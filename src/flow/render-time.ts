import type { TimeEvent } from '../simulate/events.ts';
import {
  getBacklog,
  getDone,
  getDuplicatedUserStories,
  getOrCreateUserStory,
  getOrCreateUserStoryInThread,
  getThreadState,
  getThreadUserStory,
  getUserStory,
} from './selector.ts';

const hasManyReviewsInSameTime = (
  timeEvents: TimeEvent[],
  userStoryId: number,
) => {
  return (
    timeEvents.filter(
      (timeEvent) =>
        timeEvent.state === 'Review' && timeEvent.userStoryId === userStoryId,
    ).length > 1
  );
};

const setThreadStateTo = (threadIndex: number, textContent: string) => {
  const threadState = getThreadState(threadIndex);
  if (threadState) {
    threadState.textContent = textContent;
  }
};

const removeUserStory = (...userStory: (HTMLDivElement | null)[]) => {
  userStory
    .filter((userStory) => userStory !== null)
    .forEach((userStory) => userStory.remove());
};

export const renderTimeEvents = async (
  events: TimeEvent[],
  time: number,
  animationTime: number,
) => {
  const currentEvents = events.filter((event) => event.time === time);
  for (const currentEvent of currentEvents) {
    if (currentEvent.userStoryId === -1) {
      setThreadStateTo(currentEvent.threadId, 'Wait');
      continue;
    }
    switch (currentEvent.state) {
      case 'InProgress': {
        const inProgressUserStory = getUserStory(currentEvent.userStoryId);
        if (inProgressUserStory) {
          getThreadUserStory(currentEvent.threadId)?.appendChild(
            inProgressUserStory,
          );
          setThreadStateTo(currentEvent.threadId, 'Develop');
        }
        break;
      }
      case 'Review': {
        if (hasManyReviewsInSameTime(currentEvents, currentEvent.userStoryId)) {
          removeUserStory(getUserStory(currentEvent.userStoryId));

          getThreadUserStory(currentEvent.threadId)?.appendChild(
            getOrCreateUserStoryInThread(
              currentEvent.userStoryId,
              currentEvent.threadId,
            ),
          );
        } else {
          removeUserStory(
            ...getDuplicatedUserStories(currentEvent.userStoryId),
          );
          getThreadUserStory(currentEvent.threadId)?.appendChild(
            getOrCreateUserStory(currentEvent.userStoryId),
          );
        }
        setThreadStateTo(currentEvent.threadId, 'Review');
        break;
      }
      case 'ToReview': {
        const toReviewUserStory = getUserStory(currentEvent.userStoryId);
        if (toReviewUserStory) {
          getBacklog()?.appendChild(toReviewUserStory);
        }
        break;
      }
      case 'Done': {
        removeUserStory(...getDuplicatedUserStories(currentEvent.userStoryId));
        const doneUserStory = getOrCreateUserStoryInThread(
          currentEvent.userStoryId,
          currentEvent.threadId,
        );
        getDone()?.appendChild(doneUserStory);
        break;
      }
      default:
        break;
    }
    await sleep(animationTime);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
