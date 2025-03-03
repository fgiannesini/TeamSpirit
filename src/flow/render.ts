import { TimeEvent } from '../compute/events.ts';
import { State } from '../compute/user-story.ts';
import {
  getBacklog,
  getCompute,
  getDone,
  getThread,
  getThreads,
  getUserStory,
} from './selector.ts';
import {
  addUserStories,
  createUserStory,
  moveUserStoryOrdered,
  moveUserStoryToThread,
} from './render-user-story.ts';
import { addThreads } from './render-thread.ts';

const getDuplicates = (arr: TimeEvent[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of arr) {
    if (seen.has(item.userStoryName)) {
      duplicates.add(item.userStoryName);
    } else {
      seen.add(item.userStoryName);
    }
  }
  return Array.from(duplicates);
};

export const render = (events: TimeEvent[]) => {
  addThreads(getThreads()!, events);
  addUserStories(getBacklog()!, events);

  let time = 0;
  let htmlButtonElement = getCompute()!;
  htmlButtonElement.addEventListener('click', async () => {
    time++;
    const currentEvents = events.filter((event) => event.time == time);
    const duplicates = getDuplicates(currentEvents);
    for (const currentEvent of currentEvents) {
      if (
        currentEvent.state == State.IN_PROGRESS ||
        currentEvent.state == State.REVIEW
      ) {
        if (duplicates.indexOf(currentEvent.userStoryName) != -1) {
          let id = `${currentEvent.userStoryName}_${currentEvent.thread}`;
          const userStory = createUserStory(id);
          getThread(currentEvent.thread)!.appendChild(userStory);
          getUserStory(currentEvent.userStoryName)?.remove();
        } else {
          moveUserStoryToThread(
            getThread(currentEvent.thread)!,
            currentEvent.userStoryName
          );
        }
      } else if (currentEvent.state == State.TO_REVIEW) {
        moveUserStoryOrdered(getBacklog()!, currentEvent.userStoryName);
      } else if (currentEvent.state == State.DONE) {
        moveUserStoryOrdered(getDone()!, currentEvent.userStoryName);
      }
      await sleep(500);
    }
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
