import { TimeEvent } from '../compute/events.ts';
import { State } from '../compute/user-story.ts';
import {
  getBacklog,
  getBody,
  getCompute,
  getDone,
  getThread,
  getThreads,
} from './selector.ts';
import {
  addUserStories,
  moveUserStory,
  moveUserStoryOrdered,
  waitForAnimations,
} from './render-user-story.ts';
import { addThreads } from './render-thread.ts';

export const render = (events: TimeEvent[]) => {
  getBody().innerHTML = `
<h3>Team Spirit</h3>
<button id="compute">Compute</button>
<div id="backlog" class="backlog"></div>
<div id="threads" class="threads"></div>
<div id="done" class="done"></div>
`;
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
      if (currentEvent.state == State.IN_PROGRESS) {
        moveUserStory(
          getThread(currentEvent.thread),
          currentEvent.userStoryName
        );
      } else {
        done++;
        moveUserStoryOrdered(getDone(), currentEvent.userStoryName, done);
      }
      await waitForAnimations();
    }
  });
};
