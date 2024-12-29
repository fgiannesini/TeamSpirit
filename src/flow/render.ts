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
  waitForAnimations,
} from './render-user-story.ts';
import { addThreads } from './render-thread.ts';

export const render = (events: TimeEvent[]) => {
  addThreads(getThreads(), events);
  addUserStories(getBacklog(), events);

  setTimeout(() => {
    document
      .querySelectorAll<HTMLElement>('.userStory')
      .forEach(
        (userStory, index) => (userStory.style.left = 50 * index + 'px')
      );
  });
  let time = 0;
  let htmlButtonElement = getCompute();
  htmlButtonElement.addEventListener('click', async () => {
    time++;
    let currentEvents = events.filter((event) => event.time == time);
    let done = 0;
    for (const currentEvent of currentEvents) {
      let isMoving: boolean = false;
      if (
        currentEvent.state == State.IN_PROGRESS ||
        currentEvent.state == State.REVIEW
      ) {
        isMoving = moveUserStoryToThread(
          getThread(currentEvent.thread),
          currentEvent.userStoryName
        );
      } else if (currentEvent.state == State.TO_REVIEW) {
        isMoving = moveUserStoryOrdered(
          getBacklog(),
          currentEvent.userStoryName,
          1
        );
      } else if (currentEvent.state == State.DONE) {
        done++;
        isMoving = moveUserStoryOrdered(
          getDone(),
          currentEvent.userStoryName,
          done
        );
      }
      if (isMoving) {
        await waitForAnimations();
      }
    }
  });
};
