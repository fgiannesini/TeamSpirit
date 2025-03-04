import { TimeEvent } from '../compute/events.ts';
import { State } from '../compute/user-story.ts';
import {
  getBacklog,
  getCompute,
  getComputeAll,
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

const renderTimeEvents = async (
  events: TimeEvent[],
  time: number,
  animationTime: number,
) => {
  const currentEvents = events.filter((event) => event.time == time);
  const duplicates = getDuplicatesInReview(currentEvents);
  for (const currentEvent of currentEvents) {
    if (currentEvent.state == State.IN_PROGRESS) {
      const userStory = getUserStory(currentEvent.userStoryName);
      if (userStory) {
        getThread(currentEvent.thread)?.appendChild(userStory);
      }
    }
    if (currentEvent.state == State.REVIEW) {
      if (duplicates.indexOf(currentEvent.userStoryName) != -1) {
        getUserStory(currentEvent.userStoryName)?.remove();
        const id = `${currentEvent.userStoryName}_${currentEvent.thread}`;
        getThread(currentEvent.thread)?.appendChild(
          getUserStory(id) ?? createUserStory(id),
        );
      } else {
        getDuplicatedUserStories(currentEvent.userStoryName).forEach((el) =>
          el.remove(),
        );
        getThread(currentEvent.thread)?.appendChild(
          getUserStory(currentEvent.userStoryName) ??
            createUserStory(currentEvent.userStoryName),
        );
      }
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

const renderStatEvents = (events: StatEvent[], time: number) => {
  const currentEvents = events.filter((event) => event.time == time);
  if (currentEvents.length == 0) return;

  const leadTime = getLeadTime();
  if (leadTime)
    leadTime.textContent = currentEvents[0].leadTime?.toFixed(2) ?? NaN;

  const timeElement = getTime();
  if (timeElement) timeElement.textContent = currentEvents[0].time.toString();
};

export const render = (events: TimeEvent[], statEvents: StatEvent[]) => {
  const threads = getThreads();
  if (threads) addThreads(threads, events);
  const backlog = getBacklog();
  if (backlog) addUserStories(backlog, events);

  const maxTime = Math.max(...events.map((event) => event.time));
  let time = 0;
  const computeButton = getCompute();
  computeButton?.addEventListener('click', async () => {
    time++;
    await renderTimeEvents(events, time, 1000);
    renderStatEvents(statEvents, time);
    if (maxTime === time && computeButton) {
      computeButton.disabled = true;
    }
  });

  const computeButtonAll = getComputeAll();
  computeButtonAll?.addEventListener('click', async () => {
    while (maxTime !== time) {
      time++;
      await renderTimeEvents(events, time, 300);
      renderStatEvents(statEvents, time);
    }
    if (computeButtonAll) computeButtonAll.disabled = true;
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
