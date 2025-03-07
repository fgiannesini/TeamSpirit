import { TimeEvent } from '../simulate/events.ts';
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

const getDuplicatesInReview = (timeEvents: TimeEvent[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  timeEvents
    .filter((timeEvent) => timeEvent.state == State.REVIEW)
    .forEach((item) => {
      if (seen.has(item.userStoryName)) {
        duplicates.add(item.userStoryName);
      } else {
        seen.add(item.userStoryName);
      }
    });
  return Array.from(duplicates);
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
  const currentEvents = events.filter((event) => event.time == time);
  const duplicates = getDuplicatesInReview(currentEvents);
  for (const currentEvent of currentEvents) {
    if (currentEvent.userStoryName === 'idle') {
      setThreadStateTo(currentEvent.thread, 'Wait');
      continue;
    }
    switch (currentEvent.state) {
      case State.IN_PROGRESS: {
        const inProgressUserStory = getUserStory(currentEvent.userStoryName);
        if (inProgressUserStory) {
          getThreadUserStory(currentEvent.thread)?.appendChild(
            inProgressUserStory,
          );
          setThreadStateTo(currentEvent.thread, 'Develop');
        }
        break;
      }
      case State.REVIEW: {
        if (duplicates.indexOf(currentEvent.userStoryName) != -1) {
          removeUserStory(getUserStory(currentEvent.userStoryName));
          const id = `${currentEvent.userStoryName}_${currentEvent.thread}`;
          getThreadUserStory(currentEvent.thread)?.appendChild(
            getOrCreateUserStory(id),
          );
        } else {
          getDuplicatedUserStories(currentEvent.userStoryName).forEach((el) =>
            el.remove(),
          );
          getThreadUserStory(currentEvent.thread)?.appendChild(
            getOrCreateUserStory(currentEvent.userStoryName),
          );
        }
        setThreadStateTo(currentEvent.thread, 'Review');
        break;
      }
      case State.TO_REVIEW: {
        const toReviewUserStory = getUserStory(currentEvent.userStoryName);
        if (toReviewUserStory) getBacklog()?.appendChild(toReviewUserStory);
        break;
      }
      case State.DONE: {
        removeUserStory(
          ...getDuplicatedUserStories(currentEvent.userStoryName),
        );
        const doneUserStory = getOrCreateUserStory(currentEvent.userStoryName);
        getDone()?.appendChild(doneUserStory);
        break;
      }
    }
    await sleep(animationTime);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
