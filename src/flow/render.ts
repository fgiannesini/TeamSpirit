import { TimeEvent } from '../compute/events.ts';
import { State } from '../compute/user-story.ts';
import {
  getBacklog,
  getCompute,
  getDone,
  getThread,
  getThreads,
} from './selector.ts';
import {
  addUserStories,
  moveUserStoryOrdered,
  moveUserStoryToThread,
} from './render-user-story.ts';
import { addThreads } from './render-thread.ts';

export const render = (events: TimeEvent[]) => {
  addThreads(getThreads(), events);
  addUserStories(getBacklog(), events);

  let time = 0;
  let htmlButtonElement = getCompute();
  htmlButtonElement.addEventListener('click', async () => {
    time++;
    let currentEvents = events.filter((event) => event.time == time);
    for (const currentEvent of currentEvents) {
      if (
        currentEvent.state == State.IN_PROGRESS ||
        currentEvent.state == State.REVIEW
      ) {
        moveUserStoryToThread(
          getThread(currentEvent.thread),
          currentEvent.userStoryName
        );
      } else if (currentEvent.state == State.TO_REVIEW) {
        moveUserStoryOrdered(getBacklog(), currentEvent.userStoryName);
      } else if (currentEvent.state == State.DONE) {
        moveUserStoryOrdered(getDone(), currentEvent.userStoryName);
      }
      await sleep(500);
    }
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
