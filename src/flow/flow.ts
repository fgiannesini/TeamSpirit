import './flow.scss';
import type { TimeEvent } from '../simulate/events.ts';
import type { StructureEvent } from '../simulate/simulation-structure.ts';
import type { StatEvent } from '../simulate/stats.ts';
import { renderStatEvents } from './render-stats.ts';
import { addThreads, removeThreads } from './render-thread.ts';
import { renderTimeEvents } from './render-time.ts';
import { addUserStories } from './render-user-story.ts';
import {
  getBacklog,
  getCompute,
  getComputeAll,
  getThreads,
} from './selector.ts';
import {
  loadStatEvents,
  loadStructureEvents,
  loadTimeEvents,
} from './storage/session-storage.ts';

const buildUserStories = (
  structureEvents: StructureEvent[],
  timeCount: number,
): void => {
  const backlog = getBacklog();
  if (backlog) {
    const initStructureEvents = structureEvents.filter(
      ({ time }) => time === timeCount,
    );
    addUserStories(backlog, initStructureEvents);
  }
};

const render = (
  events: TimeEvent[],
  statEvents: StatEvent[],
  structureEvents: StructureEvent[],
): void => {
  const threads = getThreads();
  if (threads) {
    addThreads(threads, structureEvents);
  }
  const backlog = getBacklog();
  if (backlog) {
    const initStructureEvents = structureEvents.filter(
      ({ time }) => time === 1,
    );
    addUserStories(backlog, initStructureEvents);
  }

  const maxTime = Math.max(...events.map((event) => event.time));
  let currentTime = 0;
  const computeButton = getCompute();
  computeButton?.addEventListener('click', async () => {
    computeButton.disabled = true;
    currentTime++;
    await renderTimeEvents(events, currentTime, 1000);
    renderStatEvents(statEvents, currentTime, maxTime);
    buildUserStories(structureEvents, currentTime + 1);
    removeThreads(structureEvents, currentTime + 1);
    if (maxTime !== currentTime) {
      computeButton.disabled = false;
    }
  });

  const computeButtonAll = getComputeAll();
  computeButtonAll?.addEventListener('click', async () => {
    while (maxTime !== currentTime) {
      currentTime++;
      await renderTimeEvents(events, currentTime, 300);
      renderStatEvents(statEvents, currentTime, maxTime);
      buildUserStories(structureEvents, currentTime + 1);
      removeThreads(structureEvents, currentTime + 1);
    }
    computeButtonAll.disabled = true;
  });
};

const params: URLSearchParams = new URLSearchParams(window.location.search);
const idFromParams: string | null = params.get('id');
if (idFromParams) {
  render(
    loadTimeEvents(idFromParams),
    loadStatEvents(idFromParams),
    loadStructureEvents(idFromParams),
  );
}
