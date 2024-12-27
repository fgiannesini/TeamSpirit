import { TimeEvent } from './events.ts';
import { State } from './task.ts';
import {
  getBacklog,
  getBody,
  getCompute,
  getDone,
  getThread,
  getThreads,
} from './selector.ts';
import {
  addTasks,
  moveTask,
  moveTaskOrdered,
  waitForAnimations,
} from './render-task.ts';
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
  addTasks(getBacklog(), events);

  setTimeout(() => {
    document
      .querySelectorAll<HTMLElement>('.task')
      .forEach((task, index) => (task.style.left = 50 * index + 'px'));
  });
  let time = 0;
  let htmlButtonElement = getCompute();
  htmlButtonElement.addEventListener('click', async () => {
    time++;
    let currentEvents = events.filter((event) => event.time == time);
    let done = 0;
    for (const currentEvent of currentEvents) {
      if (currentEvent.newState == State.IN_PROGRESS) {
        moveTask(getThread(currentEvent.thread), currentEvent.taskName);
      } else {
        done++;
        moveTaskOrdered(getDone(), currentEvent.taskName, done);
      }
      await waitForAnimations();
    }
  });
};
