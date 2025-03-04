import { TimeEvent } from '../compute/events.ts';
import { State } from '../compute/user-story.ts';
import {
  getBacklog,
  getCompute,
  getDone,
  getDuplicatedUserStories,
  getThread,
  getThreads,
  getUserStory,
} from './selector.ts';
import { addUserStories, createUserStory } from './render-user-story.ts';
import { addThreads } from './render-thread.ts';
import { StatEvent } from '../compute/stats.ts';
import { getLeadTime, getTime } from './render-stats.ts';

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

const renderTimeEvents = async (events: TimeEvent[], time: number) => {
  const currentEvents = events.filter((event) => event.time == time);
  const duplicates = getDuplicatesInReview(currentEvents);
  for (const currentEvent of currentEvents) {
    if (currentEvent.state == State.IN_PROGRESS) {
      getThread(currentEvent.thread)!.appendChild(
        getUserStory(currentEvent.userStoryName)!
      );
    }
    if (currentEvent.state == State.REVIEW) {
      if (duplicates.indexOf(currentEvent.userStoryName) != -1) {
        getUserStory(currentEvent.userStoryName)?.remove();
        let id = `${currentEvent.userStoryName}_${currentEvent.thread}`;
        getThread(currentEvent.thread)!.appendChild(
          getUserStory(id) ?? createUserStory(id)
        );
      } else {
        getDuplicatedUserStories(currentEvent.userStoryName).forEach((el) =>
          el.remove()
        );
        getThread(currentEvent.thread)!.appendChild(
          getUserStory(currentEvent.userStoryName) ??
            createUserStory(currentEvent.userStoryName)
        );
      }
    }
    if (currentEvent.state == State.TO_REVIEW) {
      getBacklog()!.appendChild(getUserStory(currentEvent.userStoryName)!);
    }

    if (currentEvent.state == State.DONE) {
      getDuplicatedUserStories(currentEvent.userStoryName).forEach((el) =>
        el.remove()
      );
      const userStory =
        getUserStory(currentEvent.userStoryName) ??
        createUserStory(currentEvent.userStoryName);
      getDone()!.appendChild(userStory);
    }
    await sleep(1000);
  }
};

const renderStatEvents = (events: StatEvent[], time: number) => {
  const currentEvents = events.filter((event) => event.time == time);
  if (currentEvents.length == 0) return;
  getLeadTime()!.textContent = currentEvents[0].leadTime.toFixed(2);
  getTime()!.textContent = currentEvents[0].time.toString();
};

export const render = (events: TimeEvent[], statEvents: StatEvent[]) => {
  addThreads(getThreads()!, events);
  addUserStories(getBacklog()!, events);

  let time = 0;
  let htmlButtonElement = getCompute()!;
  htmlButtonElement.addEventListener('click', async () => {
    time++;
    await renderTimeEvents(events, time);
    renderStatEvents(statEvents, time);
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
