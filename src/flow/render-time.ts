import type { TimeEvent } from '../simulate/events.ts';
import { State } from '../simulate/user-story.ts';
import {
  getBacklog,
  getDone,
  getDuplicatedUserStories,
  getOrCreateUserStory,
  getThreadState,
  getThreadUserStory,
  getUserStory,
} from './selector.ts';

const hasManyReviewsInSameTime = (
  timeEvents: TimeEvent[],
  userStoryName: string,
) => {
  return (
    timeEvents.filter(
      (timeEvent) =>
        timeEvent.state === State.Review &&
        timeEvent.userStoryName === userStoryName,
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
    if (currentEvent.userStoryName === 'idle') {
      setThreadStateTo(currentEvent.threadId, 'Wait');
      continue;
    }
    switch (currentEvent.state) {
      case State.InProgress: {
        const inProgressUserStory = getUserStory(currentEvent.userStoryName);
        if (inProgressUserStory) {
          getThreadUserStory(currentEvent.threadId)?.appendChild(
            inProgressUserStory,
          );
          setThreadStateTo(currentEvent.threadId, 'Develop');
        }
        break;
      }
      case State.Review: {
        if (
          hasManyReviewsInSameTime(currentEvents, currentEvent.userStoryName)
        ) {
          removeUserStory(getUserStory(currentEvent.userStoryName));
          const id = `${currentEvent.userStoryName}_${currentEvent.threadId}`;
          getThreadUserStory(currentEvent.threadId)?.appendChild(
            getOrCreateUserStory(id),
          );
        } else {
          removeUserStory(
            ...getDuplicatedUserStories(currentEvent.userStoryName),
          );
          getThreadUserStory(currentEvent.threadId)?.appendChild(
            getOrCreateUserStory(currentEvent.userStoryName),
          );
        }
        setThreadStateTo(currentEvent.threadId, 'Review');
        break;
      }
      case State.ToReview: {
        const toReviewUserStory = getUserStory(currentEvent.userStoryName);
        if (toReviewUserStory) {
          getBacklog()?.appendChild(toReviewUserStory);
        }
        break;
      }
      case State.Done: {
        removeUserStory(
          ...getDuplicatedUserStories(currentEvent.userStoryName),
        );
        const doneUserStory = getOrCreateUserStory(currentEvent.userStoryName);
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
