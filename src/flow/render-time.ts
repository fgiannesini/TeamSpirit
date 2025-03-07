import { TimeEvent } from '../simulate/events.ts';
import { State } from '../simulate/user-story.ts';
import {
  getBacklog,
  getDone,
  getDuplicatedUserStories,
  getThreadState,
  getThreadUserStory,
  getUserStory,
} from './selector.ts';
import { createUserStory } from './render-user-story.ts';

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
    if (currentEvent.state == State.IN_PROGRESS) {
      const userStory = getUserStory(currentEvent.userStoryName);
      if (userStory) {
        getThreadUserStory(currentEvent.thread)?.appendChild(userStory);
        setThreadStateTo(currentEvent.thread, 'Develop');
      }
    }
    if (currentEvent.state == State.REVIEW) {
      if (duplicates.indexOf(currentEvent.userStoryName) != -1) {
        getUserStory(currentEvent.userStoryName)?.remove();
        const id = `${currentEvent.userStoryName}_${currentEvent.thread}`;
        getThreadUserStory(currentEvent.thread)?.appendChild(
          getUserStory(id) ?? createUserStory(id),
        );
      } else {
        getDuplicatedUserStories(currentEvent.userStoryName).forEach((el) =>
          el.remove(),
        );
        getThreadUserStory(currentEvent.thread)?.appendChild(
          getUserStory(currentEvent.userStoryName) ??
            createUserStory(currentEvent.userStoryName),
        );
      }
      setThreadStateTo(currentEvent.thread, 'Review');
    }
    if (currentEvent.state == State.TO_REVIEW) {
      const userStory = getUserStory(currentEvent.userStoryName);
      if (userStory) getBacklog()?.appendChild(userStory);
    }

    if (currentEvent.state == State.DONE) {
      getDuplicatedUserStories(currentEvent.userStoryName).forEach((el) =>
        el.remove(),
      );
      const userStory =
        getUserStory(currentEvent.userStoryName) ??
        createUserStory(currentEvent.userStoryName);
      getDone()?.appendChild(userStory);
    }
    await sleep(animationTime);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
